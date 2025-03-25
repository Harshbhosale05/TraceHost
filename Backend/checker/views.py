from django.shortcuts import render
from django.http import JsonResponse, StreamingHttpResponse
import requests
import whois
import dns.resolver
import ipinfo
import google.generativeai as genai
from .models import DomainScan
from django.db.models import Count, Avg, Min, Max
from datetime import timedelta, date, datetime
from django.core.cache import cache
from django.db.models import Q
from django.utils import timezone
from django.db.models.functions import TruncDate
import logging
import time
import os
import json
from decouple import config
from django.conf import settings

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(),
    ]
)
logger = logging.getLogger(__name__)

# Load API keys from environment variables
IPINFO_API_KEY = config('IPINFO_API_KEY', default='0e48f52537790e')  
SHODAN_API_KEY = config('SHODAN_API_KEY', default='iy28xuQax9DSociONeAtReOq5S6nhlIq')
SECURITY_TRAILS_API_KEY = config('SECURITY_TRAILS_API_KEY', default='LUggU9k5ozhBWzGFUscd_EmT9Tb3MIp2')
GEMINI_API_KEY = config('GEMINI_API_KEY', default='AIzaSyB0xQWImHqVB2gdMSryLqwI8psGbgoSB14')

# Configure Gemini API
try:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info("Gemini API configured successfully")
except Exception as e:
    logger.error(f"Failed to configure Gemini API: {str(e)}")

# Add retry capability for API calls
def call_with_retry(func, *args, max_retries=3, **kwargs):
    """Call a function with retry capability"""
    for attempt in range(max_retries):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.warning(f"API call failed (attempt {attempt+1}/{max_retries}): {str(e)}")
            if attempt == max_retries - 1:  # Last attempt
                logger.error(f"All retry attempts failed: {str(e)}")
                raise
            time.sleep(1)  # Wait before retrying

# Function to get Whois information
def get_whois_info(domain):
    logger.info(f"Getting WHOIS info for {domain}")
    start_time = time.time()
    try:
        whois_data = whois.whois(domain)
        logger.info(f"WHOIS lookup completed in {time.time() - start_time:.2f}s")
        return {
            'registrar': whois_data.registrar,
            'registrant_name': whois_data.name,
            'registrant_organization': whois_data.org,
            'country': whois_data.country,
            'updated_date': whois_data.updated_date,
            'creation_date': whois_data.creation_date,
            'expiration_date': whois_data.expiration_date,
        }
    except Exception as e:
        logger.error(f"WHOIS lookup failed: {str(e)}")
        return {'error': str(e)}

# Function to get DNS information
def get_dns_info(domain):
    logger.info(f"Getting DNS info for {domain}")
    start_time = time.time()
    try:
        answers = dns.resolver.resolve(domain, 'A')
        logger.info(f"DNS lookup completed in {time.time() - start_time:.2f}s")
        return [answer.to_text() for answer in answers]
    except dns.resolver.NXDOMAIN:
        logger.warning(f"Domain {domain} does not exist (NXDOMAIN)")
        return {"error": "non_existent_domain", "message": f"Domain {domain} does not exist"}
    except Exception as e:
        logger.error(f"DNS lookup failed: {str(e)}")
        return {"error": "dns_lookup_failed", "message": str(e)}

# Function to get historical DNS records from SecurityTrails
def get_historical_dns(domain):
    logger.info(f"Getting historical DNS records for {domain}")
    start_time = time.time()
    url = f'https://api.securitytrails.com/v1/history/{domain}'
    headers = {'APIKEY': SECURITY_TRAILS_API_KEY}
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            logger.info(f"Historical DNS lookup completed in {time.time() - start_time:.2f}s")
            return response.json()  # Assuming it returns JSON with historical DNS info
        else:
            logger.warning(f"SecurityTrails API returned status code {response.status_code}")
            return []
    except Exception as e:
        logger.error(f"Historical DNS lookup failed: {str(e)}")
        return []

# Function to enumerate subdomains using SecurityTrails
def enumerate_subdomains(domain):
    logger.info(f"Enumerating subdomains for {domain}")
    start_time = time.time()
    url = f'https://api.securitytrails.com/v1/domain/{domain}/subdomains'
    headers = {'APIKEY': SECURITY_TRAILS_API_KEY}
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            logger.info(f"Subdomain enumeration completed in {time.time() - start_time:.2f}s")
            return response.json().get('subdomains', [])  # Return subdomains list
        else:
            logger.warning(f"SecurityTrails API returned status code {response.status_code}")
            return []
    except Exception as e:
        logger.error(f"Subdomain enumeration failed: {str(e)}")
        return []

# Function for SSL certificate logs using crt.sh
def get_ssl_cert_logs(domain):
    logger.info(f"Getting SSL certificate logs for {domain}")
    start_time = time.time()
    url = f"https://crt.sh/?q={domain}&output=json"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            cert_data = response.json()
            logger.info(f"SSL certificate lookup completed in {time.time() - start_time:.2f}s")
            return cert_data if cert_data else "No SSL certificates found"
        else:
            logger.warning(f"crt.sh API returned status code {response.status_code}")
            return f"Error fetching SSL logs: {response.status_code}"
    except Exception as e:
        logger.error(f"SSL certificate lookup failed: {str(e)}")
        return f"Error fetching SSL logs: {str(e)}"

# Function to get Shodan information using IPinfo API
def get_shodan_info(ip):
    logger.info(f"Getting Shodan info for IP {ip}")
    start_time = time.time()
    url = f"https://api.shodan.io/shodan/host/{ip}?key={SHODAN_API_KEY}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            logger.info(f"Shodan lookup completed in {time.time() - start_time:.2f}s")
            return response.json()  # Return Shodan info
        else:
            logger.warning(f"Shodan API returned status code {response.status_code}")
            return "No Shodan information found"
    except Exception as e:
        logger.error(f"Shodan lookup failed: {str(e)}")
        return f"Error fetching Shodan information: {str(e)}"

# Function to get ASN information using IPinfo API
def get_asn_info(ip):
    logger.info(f"Getting ASN info for IP {ip}")
    start_time = time.time()
    try:
        handler = ipinfo.getHandler(IPINFO_API_KEY)
        details = handler.getDetails(ip)
        logger.info(f"ASN lookup completed in {time.time() - start_time:.2f}s")
        return {
            'asn': details.org,
            'city': details.city,
            'region': details.region,
            'country': details.country_name,
            'latitude': details.loc.split(',')[0],  # Latitude
            'longitude': details.loc.split(',')[1]  # Longitude
        }
    except Exception as e:
        logger.error(f"ASN lookup failed: {str(e)}")
        return {
            'asn': 'Unknown',
            'city': 'Unknown',
            'region': 'Unknown',
            'country': 'Unknown',
            'latitude': '0',
            'longitude': '0'
        }

# Function to calculate risk score
def calculate_risk_score(whois_info, dns_info, location_info, domain=None):
    logger.info("Calculating risk score")
    score = 50  # Base score
    
    try:
        # Check for trusted TLDs first
        if domain:
            trusted_tlds = ['.edu', '.gov', '.ac', '.sch', '.mil']
            if any(domain.lower().endswith(tld) for tld in trusted_tlds):
                logger.info(f"Domain {domain} has a trusted TLD, reducing risk score")
                return 15  # Very low risk for trusted domains
        
        # Domain age check
        if whois_info.get('creation_date'):
            domain_age = timezone.now().date() - whois_info['creation_date'].date()
            if domain_age.days < 30:
                logger.info("Domain is less than 30 days old (+20 risk)")
                score += 20
            elif domain_age.days < 90:
                logger.info("Domain is less than 90 days old (+10 risk)")
                score += 10
        
        # Location check
        suspicious_countries = ['XX', 'Unknown']  # Add more as needed
        if location_info.get('country') in suspicious_countries:
            logger.info(f"Suspicious server location: {location_info.get('country')} (+15 risk)")
            score += 15
        
        # Missing information penalty
        if not whois_info.get('registrar'):
            logger.info("Missing registrar information (+10 risk)")
            score += 10
        
        # Cap the score at 100
        final_score = min(100, score)
        logger.info(f"Final risk score: {final_score}")
        return final_score
    
    except Exception as e:
        logger.error(f"Error calculating risk score: {str(e)}")
        return 50  # Return base score if calculation fails

# New AI-powered risk score calculation
def calculate_ai_risk_score(domain, whois_info, dns_info, location_info):
    logger.info(f"Calculating AI-powered risk score for {domain}")
    
    # Check for trusted TLDs first (override AI for these trusted domains)
    trusted_tlds = ['.edu', '.gov', '.ac', '.sch', '.mil']
    if any(domain.lower().endswith(tld) for tld in trusted_tlds):
        logger.info(f"Domain {domain} has a trusted TLD, setting low risk score")
        return 15  # Very low risk for trusted domains
    
    try:
        # Create a structured prompt for Gemini to analyze the domain
        prompt = f"""
        Analyze the following domain and provide a risk score from 0-100, where higher scores indicate higher risk:
        
        Domain: {domain}
        
        Domain Information:
        - Creation Date: {whois_info.get('creation_date', 'Unknown')}
        - Expiration Date: {whois_info.get('expiration_date', 'Unknown')}
        - Registrar: {whois_info.get('registrar', 'Unknown')}
        - Registrant Name: {whois_info.get('registrant_name', 'Unknown')}
        - Registrant Organization: {whois_info.get('registrant_organization', 'Unknown')}
        - Country: {whois_info.get('country', 'Unknown')}
        - Server Location: {location_info.get('country', 'Unknown')}
        
        Analyze the domain in the following ways:
        1. Check if the domain name contains suspicious patterns (similar to legitimate brands, misspellings, excessive hyphens, random characters)
        2. Assess the domain age (newer domains are higher risk)
        3. Check if WHOIS privacy protection is used or if registrant details are missing
        4. Analyze if the domain is hosted in a high-risk country
        5. Evaluate if the domain is designed to mimic a legitimate service
        6. If the domain ends with ".edu", ".org", ".gov", ".ac", ".sch", ".mil" or a similar trusted educational/government domain (e.g., ".gov", ".ac", ".sch", ".mil"), the risk score should be reduced to less than 20, as these domains are generally legitimate.
        
        Provide a risk score from 0-100 and briefly explain your reasoning. Format your response as a JSON object with "score" and "explanation" fields.
        """
        
        # Call Gemini API for analysis with retry capability
        try:
            model = genai.GenerativeModel('gemini-2.0-flash')
            # Use timeout from settings if available
            timeout = getattr(settings, 'GEMINI_API_TIMEOUT', 45)
            
            # Set safety settings to avoid content filtering issues
            safety_settings = {
                "HARASSMENT": "BLOCK_NONE",
                "HATE": "BLOCK_NONE",
                "SEXUAL": "BLOCK_NONE",
                "DANGEROUS": "BLOCK_NONE",
            }
            
            # Use a more compact generation configuration to reduce response time
            generation_config = {
                "temperature": 0.2,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 256,
            }
            
            response = call_with_retry(
                model.generate_content, 
                prompt, 
                safety_settings=safety_settings,
                generation_config=generation_config,
                max_retries=3
            )
            
            # Parse the response to extract the score
            try:
                import json
                response_text = response.text.strip()
                
                # Try to parse as JSON directly
                try:
                    result = json.loads(response_text)
                except json.JSONDecodeError:
                    # If direct parsing fails, try to extract JSON from text
                    import re
                    json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                    if json_match:
                        result = json.loads(json_match.group(0))
                    else:
                        # Fallback: extract numeric score directly
                        score_match = re.search(r'score["\s:]+(\d+)', response_text, re.IGNORECASE)
                        if score_match:
                            ai_score = int(score_match.group(1))
                            logger.info(f"Extracted AI risk score: {ai_score}")
                            return ai_score
                        else:
                            logger.warning("Could not extract risk score from AI response")
                            return calculate_risk_score(whois_info, dns_info, location_info, domain)
                
                # Extract the score from the result
                if 'score' in result:
                    ai_score = int(result['score'])
                    logger.info(f"AI generated risk score: {ai_score}")
                    
                    # Double-check for trusted TLDs in case AI didn't take it into account properly
                    trusted_tlds = ['.edu', '.gov', '.ac', '.sch', '.mil']
                    if any(domain.lower().endswith(tld) for tld in trusted_tlds) and ai_score > 20:
                        logger.info(f"Overriding AI score for trusted domain {domain}")
                        return 15  # Override for trusted domains
                    
                    return ai_score
                else:
                    logger.warning("AI response did not contain a score")
                    return calculate_risk_score(whois_info, dns_info, location_info, domain)
                
            except Exception as parse_error:
                logger.error(f"Error parsing AI response: {str(parse_error)}")
                return calculate_risk_score(whois_info, dns_info, location_info, domain)
                
        except Exception as api_error:
            logger.error(f"Gemini API error: {str(api_error)}")
            return calculate_risk_score(whois_info, dns_info, location_info, domain)
    
    except Exception as e:
        logger.error(f"Error in AI risk score calculation: {str(e)}")
        # Fall back to traditional calculation
        return calculate_risk_score(whois_info, dns_info, location_info, domain)

# Update the analyze_domain function to use AI risk score
def analyze_domain(request):
    domain = request.GET.get('domain', None)
    logger.info(f"Domain check request received for {domain}")
    
    if not domain:
        logger.warning("No domain provided in request")
        return JsonResponse({'error': 'No domain provided'}, status=400)
    
    # Increase default request timeout to accommodate longer processing times
    if hasattr(settings, 'DATA_UPLOAD_MAX_MEMORY_SIZE'):
        original_timeout = settings.DATA_UPLOAD_MAX_MEMORY_SIZE
        # Temporarily increase timeout for this long-running request
        settings.DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB
    
    # Process in chunks to avoid streaming errors
    from django.http import StreamingHttpResponse
    
    # Check if we want a chunked response to avoid timeout issues                                  
    use_streaming = request.GET.get('streaming', 'false').lower() == 'true'
    
    if use_streaming:
        def generate_analysis():
            yield '{"processing":true,"domain":"' + domain + '","message":"Analysis started..."}\n'
            
            try:
                # Run analysis code here
                result = analyze_domain_stream(domain)
                yield json.dumps(result)
            except Exception as e:
                logger.error(f"Error during streaming analysis: {str(e)}")
                yield json.dumps({
                    'error': 'Analysis failed',
                    'message': str(e),
                    'domain': domain
                })
        
        # Return a streaming response
        response = StreamingHttpResponse(
            generate_analysis(),
            content_type='application/json'
        )
        response['Access-Control-Allow-Origin'] = '*'  # CORS headers if needed
        return response
    
    # Non-streaming standard response
    try:
        # Check if the domain is flagged for investigation
        is_flagged = DomainScan.objects.filter(domain=domain, is_flagged=True).exists()
        
        # If domain is flagged, use cached results if available
        if is_flagged:
            cached_scan = DomainScan.objects.filter(domain=domain).first()
            if cached_scan and (timezone.now() - cached_scan.scan_date).total_seconds() < 3600:  # 1 hour
                logger.info(f"Using cached results for flagged domain {domain}")
                return JsonResponse({
                    'Domain': domain,
                    'Summary': f"Host IP Address: {cached_scan.ip_address or 'N/A'}, Location: {cached_scan.city or 'Unknown'}, {cached_scan.country or 'Unknown'}",
                    'Location Link': cached_scan.scan_result.get('location_link'),
                    'Registrar': cached_scan.registrar or 'N/A',
                    'IP_Address': cached_scan.ip_address or 'N/A',
                    'ASN_Info': cached_scan.scan_result.get('location_info', {}),
                    'Country': cached_scan.country or 'N/A',
                    'Updated_Date': cached_scan.scan_result.get('whois_info', {}).get('updated_date', 'N/A'),
                    'Creation_Date': cached_scan.scan_result.get('whois_info', {}).get('creation_date', 'N/A'),
                    'Expiration_Date': cached_scan.scan_result.get('whois_info', {}).get('expiration_date', 'N/A'),
                    'Registrant_Name': cached_scan.scan_result.get('whois_info', {}).get('registrant_name', 'N/A'),
                    'Registrant_Organization': cached_scan.scan_result.get('whois_info', {}).get('registrant_organization', 'N/A'),
                    'Subdomains': cached_scan.scan_result.get('subdomains', []),
                    'Historical_DNS': cached_scan.scan_result.get('historical_dns', []),
                    'Server_Location': cached_scan.scan_result.get('server_location', 'Location data not available'),
                    'Security_Analysis': {
                        'result': cached_scan.scan_result.get('risk_analysis', {}).get('factors', []),
                        'is_suspicious': cached_scan.is_suspicious,
                        'risk_score': cached_scan.risk_score
                    },
                    'AI_Summary': cached_scan.scan_result.get('ai_summary', '')
                })
                
        # Perform the standard analysis and return the response
        result = analyze_domain_for_response(domain)
        return JsonResponse(result)
        
    except Exception as e:
        logger.error(f"Error in check_domain: {str(e)}")
        return JsonResponse({
            'error': 'Analysis failed',
            'message': str(e),
            'domain': domain
        }, status=500)
    finally:
        # Restore original timeout setting if modified
        if hasattr(settings, 'DATA_UPLOAD_MAX_MEMORY_SIZE') and 'original_timeout' in locals():
            settings.DATA_UPLOAD_MAX_MEMORY_SIZE = original_timeout

# Refactored analyze_domain function for streaming
def analyze_domain_stream(domain):
    # This version is for streaming responses
    result = analyze_domain_for_response(domain)
    return result

# Refactored analyze_domain function for the response path
def analyze_domain_for_response(domain):
    """Analyze a domain and prepare the response data."""
    logger.info(f"Analyzing domain for response: {domain}")
    start_time = time.time()
    
    try:
        # Collect all necessary data in parallel if possible
        whois_info = get_whois_info(domain)
        dns_info = get_dns_info(domain)
        
        # Check if domain doesn't exist
        domain_exists = True
        if isinstance(dns_info, dict) and "error" in dns_info:
            if dns_info["error"] == "non_existent_domain":
                logger.info(f"Domain {domain} does not exist")
                domain_exists = False
                risk_score = 0
                is_suspicious = False
                risk_factors = ["Domain does not exist"]
                
                # Prepare the response for non-existent domain
                response_data = {
                    'Domain': domain,
                    'Summary': f"Domain does not exist",
                    'Domain_Exists': False,
                    'Security_Analysis': {
                        'result': risk_factors,
                        'is_suspicious': False,
                        'risk_score': 0
                    },
                    'AI_Summary': "Domain does not exist. This domain is not registered and cannot be resolved to an IP address."
                }
                
                logger.info(f"Domain check for non-existent domain completed in {time.time() - start_time:.2f}s")
                return response_data
        
        # Continue with analysis for existing domains
        historical_dns = get_historical_dns(domain)
        subdomains = enumerate_subdomains(domain)
        
        # If DNS info is available, we can get the ASN info for the first IP
        ip_address = dns_info[0] if isinstance(dns_info, list) and dns_info else None
        asn_info = get_asn_info(ip_address) if ip_address else {}
        
        # SSL certificate logs
        ssl_info = get_ssl_cert_logs(domain)
        
        # Shodan information
        shodan_info = get_shodan_info(ip_address) if ip_address else {}

        location_link = (
            f"https://www.google.com/maps?q={asn_info.get('latitude')},{asn_info.get('longitude')}"
            if asn_info.get('latitude') and asn_info.get('longitude') 
            else None
        )

        # Prepare the summary
        location = f"{asn_info.get('city', 'Unknown')}, {asn_info.get('region', 'Unknown')}, {asn_info.get('country', 'Unknown')}"
        summary = f"Host IP Address: {ip_address or 'N/A'}, Location: {location}"

        # Calculate risk score using AI
        risk_score = calculate_ai_risk_score(domain, whois_info, dns_info, asn_info)
        is_suspicious = risk_score > 60
        
        # Get risk factors
        risk_factors = get_risk_factors(whois_info, dns_info, asn_info)
        
        # Add latitude and longitude if available
        lat = asn_info.get('latitude')
        lon = asn_info.get('longitude')
        
        server_location = 'Location data not available'
        if lat and lon:
            # Add the location to the response
            server_location = {
                'lat': lat,
                'lng': lon
            }
        
        # Prepare the scan result (for potential storage if flagged later)
        scan_result = {
            'whois_info': whois_info,
            'dns_info': dns_info,
            'location_info': asn_info,
            'shodan_info': shodan_info,
            'historical_dns': historical_dns,
            'subdomains': subdomains,
            'server_location': server_location,
            'location_link': location_link,
            'risk_analysis': {
                'score': risk_score,
                'is_suspicious': is_suspicious,
                'factors': risk_factors
            }
        }
        
        # Generate domain summary using Gemini API
        ai_summary = generate_domain_summary({
            'Domain': domain,
            'Domain_Exists': domain_exists,
            'IP_Address': ip_address,
            'ASN_Info': asn_info,
            'Registrar': whois_info.get('registrar', 'N/A'),
            'Creation_Date': whois_info.get('creation_date', 'N/A'),
            'Updated_Date': whois_info.get('updated_date', 'N/A'),
            'Expiration_Date': whois_info.get('expiration_date', 'N/A'),
            'Registrant_Name': whois_info.get('registrant_name', 'N/A'),
            'Registrant_Organization': whois_info.get('registrant_organization', 'N/A'),
            'Security_Analysis': {
                'risk_score': risk_score,
                'is_suspicious': is_suspicious
            },
            'Historical_DNS': historical_dns,
            'Subdomains': subdomains
        })
        
        # Add AI summary to scan result for potential storage
        scan_result['ai_summary'] = ai_summary
        
        # Prepare the response data
        response_data = {
            'Domain': domain,
            'Domain_Exists': domain_exists,
            'Summary': summary,
            'Location Link': location_link,
            'Registrar': whois_info.get('registrar', 'N/A'),
            'IP_Address': ip_address or 'N/A',
            'ASN_Info': asn_info,
            'Country': whois_info.get('country', 'N/A'),
            'Updated_Date': whois_info.get('updated_date', 'N/A'),
            'Creation_Date': whois_info.get('creation_date', 'N/A'),
            'Expiration_Date': whois_info.get('expiration_date', 'N/A'),
            'Registrant_Name': whois_info.get('registrant_name', 'N/A'),
            'Registrant_Organization': whois_info.get('registrant_organization', 'N/A'),
            'Subdomains': subdomains,
            'Historical_DNS': historical_dns,
            'Server_Location': server_location,
            'Security_Analysis': {
                'result': risk_factors,
                'is_suspicious': is_suspicious,
                'risk_score': risk_score
            },
            'AI_Summary': ai_summary
        }
        
        # Check if domain is flagged and update database if needed
        is_flagged = DomainScan.objects.filter(domain=domain, is_flagged=True).exists()
        if is_flagged:
            # Check if an entry already exists
            scan_entry = DomainScan.objects.filter(domain=domain).first()
            
            if scan_entry:
                logger.info(f"Updating existing scan entry for flagged domain {domain}")
                scan_entry.is_suspicious = is_suspicious
                scan_entry.risk_score = risk_score
                scan_entry.scan_result = scan_result
                scan_entry.ip_address = ip_address
                scan_entry.country = whois_info.get('country')
                scan_entry.city = asn_info.get('city')
                scan_entry.registrar = whois_info.get('registrar')
                scan_entry.creation_date = whois_info.get('creation_date')
                scan_entry.expiration_date = whois_info.get('expiration_date')
                scan_entry.last_scan_date = timezone.now()
                scan_entry.save()
            else:
                logger.error(f"Domain {domain} is flagged but no entry exists, this shouldn't happen")
        
        logger.info(f"Domain analysis for response completed in {time.time() - start_time:.2f}s")
        return response_data
        
    except Exception as e:
        logger.error(f"Error in analyze_domain_for_response: {str(e)}")
        # Return a basic error response
        return {
            'Domain': domain,
            'error': f"Analysis failed: {str(e)}",
            'Domain_Exists': True  # We don't know, so assume it exists
        }

# Function to generate domain summary using Gemini API
def generate_domain_summary(domain_data):
    logger.info(f"Generating domain summary using Gemini API")
    start_time = time.time()
    
    # Get domain from data
    domain = domain_data.get('Domain', 'N/A')
    
    # Check if this is a trusted domain first
    trusted_tlds = ['.edu', '.gov', '.ac', '.sch', '.mil']
    is_trusted_domain = any(domain.lower().endswith(tld) for tld in trusted_tlds)
    
    # For non-existent domains, return a simple message
    if not domain_data.get('Domain_Exists', True):
        return "Domain does not exist. This domain is not registered and cannot be resolved to an IP address."
    
    try:
        # Create a structured prompt for Gemini with more comprehensive information
        prompt = f"""
        Analyze the following domain information and provide a comprehensive security assessment:
        
        DOMAIN INFORMATION:
        Domain: {domain}
        IP Address: {domain_data.get('IP_Address', 'N/A')}
        Server Location: {domain_data.get('ASN_Info', {}).get('city', 'Unknown')}, {domain_data.get('ASN_Info', {}).get('country', 'Unknown')}
        ASN: {domain_data.get('ASN_Info', {}).get('asn', 'Unknown')}
        
        REGISTRATION DETAILS:
        Registrar: {domain_data.get('Registrar', 'N/A')}
        Creation Date: {domain_data.get('Creation_Date', 'N/A')}
        Updated Date: {domain_data.get('Updated_Date', 'N/A')}
        Expiration Date: {domain_data.get('Expiration_Date', 'N/A')}
        Registrant Name: {domain_data.get('Registrant_Name', 'N/A')}
        Registrant Organization: {domain_data.get('Registrant_Organization', 'N/A')}
        
        SECURITY ASSESSMENT:
        Risk Score: {domain_data.get('Security_Analysis', {}).get('risk_score', 0)}/100
        Suspicious: {domain_data.get('Security_Analysis', {}).get('is_suspicious', False)}
        
        DNS INFORMATION:
        DNS Records Available: {"Yes" if domain_data.get('Historical_DNS') else "No"}
        Number of Subdomains Detected: {len(domain_data.get('Subdomains', []))}
        
        {"IMPORTANT - TRUSTED DOMAIN: This domain belongs to a trusted TLD category (.edu, .gov, .ac, .sch, or .mil) and should be considered low risk by default unless there are clear security issues." if is_trusted_domain else ""}
        
        Provide a brief but comprehensive security analysis in under 500 words covering:
        1. Domain Reputation (age, registration details)
        2. Technical Security Assessment (hosting location, technical indicators)
        3. Risk Evaluation (explaining the score briefly)
        4. Specific Security Concerns (if any)
        5. User Recommendations (concise advice)
        
        Format with these sections:
        - Summary (1-2 sentences)
        - Domain Analysis
        - Technical Analysis
        - Risk Factors 
        - Recommendations
        
        IMPORTANT: Do not use any asterisks (*) or hash symbols (#) in your response. Use plain text formatting only.
        """
        
        # Create Gemini model and generate response with retry
        try:
            model = genai.GenerativeModel('gemini-2.0-flash')
            # Use timeout from settings if available
            timeout = getattr(settings, 'GEMINI_API_TIMEOUT', 30)
            
            # Set safety settings to avoid content filtering issues
            safety_settings = {
                "HARASSMENT": "BLOCK_NONE",
                "HATE": "BLOCK_NONE",
                "SEXUAL": "BLOCK_NONE",
                "DANGEROUS": "BLOCK_NONE",
            }
            
            # Use a more compact generation configuration to reduce response time
            generation_config = {
                "temperature": 0.2,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 512,
            }
            
            response = call_with_retry(
                model.generate_content, 
                prompt, 
                safety_settings=safety_settings,
                generation_config=generation_config,
                max_retries=3
            )
            
            # Log the generation time
            logger.info(f"Gemini summary generated in {time.time() - start_time:.2f}s")
            
            # Clean up the response by removing asterisks and hash symbols
            cleaned_text = response.text.replace('*', '').replace('#', '')
            
            # Return the cleaned response text
            return cleaned_text
        except Exception as api_error:
            logger.error(f"Gemini API error: {str(api_error)}")
            raise
            
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        
        # For trusted domains, provide a fallback message if the API fails
        if is_trusted_domain:
            return f"""
Summary
This domain ({domain}) belongs to a trusted top-level domain category (.edu, .gov, .ac, .sch, or .mil), which are generally legitimate and low-risk. These domains are regulated and have strict registration requirements.

Domain Analysis
Domains with these trusted TLDs are operated by educational institutions, government agencies, or military organizations. They typically have strong security measures in place and are less likely to be involved in malicious activities.

Technical Analysis
These domains are generally hosted on secure infrastructure with proper monitoring and security controls.

Risk Factors
No significant risk factors identified. The domain belongs to a trusted TLD category.

Recommendations
This domain appears to be a legitimate institutional domain. You can generally interact with it safely, but as with any website, maintain standard security practices.
"""
        
        return "Could not generate domain summary due to an error with the AI analysis service."

# View to retrieve domain analysis results
def suspicious_view(request):
    domain = request.GET.get("domain", "").strip()  # Strip whitespace
    logger.info(f"Suspicious view request received for {domain}")

    if not domain:
        logger.warning("Domain parameter is empty or missing")
        return JsonResponse({"error": "Domain parameter is required and cannot be empty."}, status=400)
    
    # Analyze the domain
    start_time = time.time()
    result = analyze_domain_for_response(domain)
    
    if isinstance(result, dict) and "error" in result:
        logger.error(f"Error analyzing domain: {result['error']}")
        return JsonResponse(result, status=500)
    
    logger.info(f"Suspicious view request completed in {time.time() - start_time:.2f}s")
    # Return the security analysis
    return JsonResponse({"domain": domain, "analysis": result})

def get_dashboard_data(request):
    logger.info("Dashboard data request received")
    try:
        # Try to get cached data
        cache_key = 'dashboard_data'
        dashboard_data = cache.get(cache_key)
        
        if dashboard_data:
            logger.info("Returning cached dashboard data")
            return JsonResponse(dashboard_data)

        logger.info("Generating fresh dashboard data")
        start_time = time.time()
        
        # Get current date and time ranges
        now = timezone.now()
        today = now.date()
        last_week = today - timedelta(days=7)
        last_month = today - timedelta(days=30)

        # Basic Statistics
        basic_stats = DomainScan.objects.aggregate(
            total_scans=Count('id'),
            total_domains=Count('domain', distinct=True),
            avg_risk_score=Avg('risk_score'),
            suspicious_domains=Count('id', filter=Q(is_suspicious=True)),
            safe_domains=Count('id', filter=Q(is_suspicious=False))
        )

        # Time-based Statistics
        time_based_stats = {
            'today_scans': DomainScan.objects.filter(scan_date__date=today).count(),
            'week_scans': DomainScan.objects.filter(scan_date__date__gte=last_week).count(),
            'month_scans': DomainScan.objects.filter(scan_date__date__gte=last_month).count(),
        }

        # Risk Score Distribution
        risk_ranges = [
            ('Very Low', 0, 20),
            ('Low', 21, 40),
            ('Medium', 41, 60),
            ('High', 61, 80),
            ('Very High', 81, 100)
        ]

        risk_distribution = []
        for label, min_score, max_score in risk_ranges:
            count = DomainScan.objects.filter(
                risk_score__gte=min_score,
                risk_score__lte=max_score
            ).count()
            risk_distribution.append({
                'range': label,
                'count': count,
                'percentage': round((count / basic_stats['total_scans'] * 100) if basic_stats['total_scans'] > 0 else 0, 2)
            })

        # Add pagination for recent scans
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        
        # Recent Scans with Details
        recent_scans = DomainScan.objects.order_by('-scan_date')[
            (page-1)*page_size:page*page_size
        ].values(
            'domain',
            'risk_score',
            'scan_date',
            'is_suspicious',
            'ip_address',
            'country'
        )

        # Daily Scan Trends
        daily_trends = (
            DomainScan.objects
            .filter(scan_date__date__gte=last_week)
            .annotate(date=TruncDate('scan_date'))
            .values('date')
            .annotate(
                total_scans=Count('id'),
                suspicious_count=Count('id', filter=Q(is_suspicious=True)),
                avg_risk_score=Avg('risk_score')
            )
            .order_by('date')
        )

        # Top Suspicious Domains
        top_suspicious = (
            DomainScan.objects
            .filter(is_suspicious=True)
            .order_by('-risk_score')[:5]
            .values('domain', 'risk_score', 'scan_date')
        )

        # Geographic Distribution
        geo_distribution = (
            DomainScan.objects
            .exclude(country__isnull=True)
            .values('country')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )

        response_data = {
            'basic_stats': {
                'total_scans': basic_stats['total_scans'],
                'total_domains': basic_stats['total_domains'],
                'avg_risk_score': round(basic_stats['avg_risk_score'] or 0, 2),
                'suspicious_domains': basic_stats['suspicious_domains'],
                'safe_domains': basic_stats['safe_domains'],
            },
            'time_based_stats': time_based_stats,
            'risk_distribution': risk_distribution,
            'recent_scans': list(recent_scans),
            'daily_trends': list(daily_trends),
            'top_suspicious': list(top_suspicious),
            'geo_distribution': list(geo_distribution),
            'last_updated': timezone.now().isoformat(),
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': DomainScan.objects.count()
            }
        }

        # Cache the response for 5 minutes
        cache.set(cache_key, response_data, 300)
        logger.info(f"Dashboard data generated in {time.time() - start_time:.2f}s")

        return JsonResponse(response_data)

    except Exception as e:
        logger.error(f"Error generating dashboard data: {str(e)}")
        return JsonResponse({
            'error': 'Internal server error',
            'details': str(e)
        }, status=500)

# Helper functions
def get_risk_factors(whois_info, dns_info, location_info):
    logger.info("Determining risk factors")
    factors = []
    
    # Check domain age
    if whois_info.get('creation_date'):
        domain_age = timezone.now().date() - whois_info['creation_date'].date()
        if domain_age.days < 30:
            factors.append("Recently registered domain")
            logger.info("Risk factor: Recently registered domain")
    
    # Check suspicious locations
    suspicious_countries = ['XX', 'Unknown']  # Add more as needed
    if location_info.get('country') in suspicious_countries:
        factors.append("Suspicious server location")
        logger.info(f"Risk factor: Suspicious server location ({location_info.get('country')})")
    
    # Add more risk factors as needed
    logger.info(f"Identified {len(factors)} risk factors")
    return factors

def suspicious_domains_list(request):
    logger.info("Suspicious domains list request received")
    try:
        # Get pagination parameters
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        search = request.GET.get('search', '')
        filter_category = request.GET.get('filter', None)

        logger.info(f"Query parameters: page={page}, limit={limit}, search='{search}', filter={filter_category}")
        start_time = time.time()

        # Calculate offset
        offset = (page - 1) * limit

        # Build query
        queryset = DomainScan.objects.filter(is_suspicious=True)

        # Apply search if provided
        if search:
            logger.info(f"Filtering by search term: {search}")
            queryset = queryset.filter(domain__icontains=search)

        # Apply category filter if provided
        if filter_category:
            logger.info(f"Filtering by category: {filter_category}")
            queryset = queryset.filter(category=filter_category)

        # Get total count
        total = queryset.count()
        logger.info(f"Total matching domains: {total}")

        # Get paginated results
        domains = queryset.order_by('-scan_date')[offset:offset + limit]

        # Prepare response data
        domains_data = [{
            'id': scan.id,
            'domain': scan.domain,
            'risk_score': scan.risk_score,
            'category': scan.category if hasattr(scan, 'category') else 'Suspicious',
            'status': scan.status if hasattr(scan, 'status') else 'Flagged',
            'scan_date': scan.scan_date.isoformat(),
            'is_suspicious': scan.is_suspicious
        } for scan in domains]

        logger.info(f"Returning {len(domains_data)} domains on page {page}")
        logger.info(f"Suspicious domains list generated in {time.time() - start_time:.2f}s")

        return JsonResponse({
            'domains': domains_data,
            'total': total
        })

    except Exception as e:
        logger.error(f"Error processing suspicious domains list: {str(e)}")
        return JsonResponse({
            'error': str(e)
        }, status=500)

# Function to flag a domain for investigation
def flag_domain(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is supported'}, status=405)
    
    try:
        data = json.loads(request.body)
        domain = data.get('domain')
        flag_action = data.get('flag', True)  # Default to flagging if not specified
        
        if not domain:
            logger.warning("No domain provided in flag request")
            return JsonResponse({'error': 'Domain is required'}, status=400)
        
        logger.info(f"Flag domain request received for {domain}, action: {'flag' if flag_action else 'unflag'}")
        
        # Check if we have this domain in our database
        domain_scan = DomainScan.objects.filter(domain=domain).first()
        
        if domain_scan:
            if flag_action:
                # Update the flag status for existing entry
                domain_scan.is_flagged = True
                domain_scan.last_flagged_date = timezone.now()
                domain_scan.save()
                
                logger.info(f"Domain {domain} flagged for investigation successfully")
                return JsonResponse({
                    'success': True,
                    'domain': domain,
                    'is_flagged': True,
                    'message': f"Domain {domain} flagged for investigation successfully"
                })
            else:
                # If unflagging, delete the entry from the database
                domain_scan.delete()
                logger.info(f"Domain {domain} unflagged and removed from database successfully")
                return JsonResponse({
                    'success': True,
                    'domain': domain,
                    'is_flagged': False,
                    'message': f"Domain {domain} unflagged and removed from database successfully"
                })
        else:
            # Only proceed if flagging (not unflagging)
            if not flag_action:
                logger.info(f"Domain {domain} not found in database, nothing to unflag")
                return JsonResponse({
                    'success': True,
                    'domain': domain,
                    'is_flagged': False,
                    'message': f"Domain {domain} was not flagged"
                })
            
            # If domain doesn't exist in database, we need to analyze it first
            logger.info(f"Domain {domain} not found in database, performing analysis before flagging")
            
            # Perform fresh analysis
            # Collect all necessary data
            whois_info = get_whois_info(domain)
            dns_info = get_dns_info(domain)
            
            # Check if domain doesn't exist
            if isinstance(dns_info, dict) and "error" in dns_info:
                if dns_info["error"] == "non_existent_domain":
                    logger.warning(f"Attempting to flag non-existent domain {domain}")
                    return JsonResponse({
                        'success': False,
                        'domain': domain,
                        'is_flagged': False,
                        'message': f"Cannot flag {domain} as it does not exist"
                    }, status=400)
            
            historical_dns = get_historical_dns(domain)
            subdomains = enumerate_subdomains(domain)
            
            # If DNS info is available, we can get the ASN info for the first IP
            ip_address = dns_info[0] if isinstance(dns_info, list) and dns_info else None
            asn_info = get_asn_info(ip_address) if ip_address else {}
            
            # Calculate risk score
            risk_score = calculate_ai_risk_score(domain, whois_info, dns_info, asn_info)
            is_suspicious = risk_score > 60
            
            # Get risk factors
            risk_factors = get_risk_factors(whois_info, dns_info, asn_info)
            
            # Prepare scan result
            scan_result = {
                'whois_info': whois_info,
                'dns_info': dns_info,
                'location_info': asn_info,
                'historical_dns': historical_dns,
                'subdomains': subdomains,
                'risk_analysis': {
                    'score': risk_score,
                    'is_suspicious': is_suspicious,
                    'factors': risk_factors
                }
            }
            
            # Create the database entry with flagged status
            DomainScan.objects.create(
                domain=domain,
                is_suspicious=is_suspicious,
                risk_score=risk_score,
                scan_result=scan_result,
                ip_address=ip_address,
                country=asn_info.get('country'),
                city=asn_info.get('city'),
                registrar=whois_info.get('registrar'),
                creation_date=whois_info.get('creation_date'),
                expiration_date=whois_info.get('expiration_date'),
                is_flagged=True,
                last_flagged_date=timezone.now()
            )
            
            logger.info(f"Domain {domain} analyzed and flagged for investigation")
            return JsonResponse({
                'success': True,
                'domain': domain,
                'is_flagged': True,
                'message': f"Domain {domain} analyzed and flagged for investigation"
            })
            
    except json.JSONDecodeError:
        logger.error("Invalid JSON in request body")
        return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
    except Exception as e:
        logger.error(f"Error flagging domain: {str(e)}")
        return JsonResponse({'error': f'Internal server error: {str(e)}'}, status=500)
