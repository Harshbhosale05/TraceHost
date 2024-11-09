from django.shortcuts import render

# # # Create your views here.
# from django.shortcuts import render
# import requests
# from django.http import JsonResponse
# import whois
# import dns.resolver
# import ipinfo

# # SecurityTrails API key
# security_trails_api_key = 'TmJLR42vL_jRl1OltlUNdwhtB7zdcc7u'
# # Shodan API key
# shodan_api_key = 'tzBnZllididvL2yLVckJS56OyrdYL7A0'
# # IPinfo API key
# ipinfo_api_key = 'e2c418f72d039f'


# # Function to get Whois information
# def get_whois_info(domain):
#     return whois.whois(domain)


# # Function to get DNS information
# def get_dns_info(domain):
#     try:
#         answers = dns.resolver.resolve(domain, 'A')
#         return [answer.to_text() for answer in answers]
#     except dns.resolver.NoAnswer:
#         return []


# # Function for Subdomain Enumeration using SecurityTrails API
# def enumerate_subdomains(domain):
#     url = f"https://api.securitytrails.com/v1/domain/{domain}/subdomains"
#     headers = {'APIKEY': security_trails_api_key}

#     response = requests.get(url, headers=headers)

#     if response.status_code == 200:
#         return response.json().get('subdomains', [])
#     else:
#         return f"Error: {response.status_code}"


# # Function to get historical DNS records using SecurityTrails API
# def get_historical_dns(domain):
#     url = f"https://api.securitytrails.com/v1/domain/{domain}/history/dns/a"
#     headers = {'APIKEY': security_trails_api_key}

#     response = requests.get(url, headers=headers)

#     if response.status_code == 200:
#         return response.json().get('records', [])
#     else:
#         return f"Error: {response.status_code}"


# # Function to get SSL certificate logs using crt.sh
# def get_ssl_cert_logs(domain):
#     url = f"https://crt.sh/?q={domain}&output=json"

#     response = requests.get(url)
#     if response.status_code == 200:
#         return response.json()
#     else:
#         return f"Error: {response.status_code}"


# # Function to get server information from Shodan
# def get_shodan_info(ip):
#     url = f"https://api.shodan.io/shodan/host/{ip}?key={shodan_api_key}"

#     response = requests.get(url)
#     if response.status_code == 200:
#         return response.json()
#     else:
#         return f"Error: {response.status_code}"


# # Function to get ASN information from IPinfo
# def get_asn_info(ip):
#     # handler = ipinfo.getHandler(ipinfo_api_key)
#     # details = handler.getDetails(ip)
#     # return details.all
   
#     handler = ipinfo.getHandler(ipinfo_api_key)
#     details = handler.getDetails(ip)
#     return {
#         'asn': details.org,
#         'city': details.city,
#         'region': details.region,
#         'country': details.country_name,
#         'lat': details.latitude,
#         'lon': details.longitude
#     }


# # Main function to check domain details
# def check_domain(request):
#     domain = request.GET.get('domain', None)  # Get the domain from the request

#     if not domain:
#         return JsonResponse({'error': 'No domain provided'}, status=400)

#     whois_info = get_whois_info(domain)
#     dns_info = get_dns_info(domain)
#     subdomains = enumerate_subdomains(domain)
#     historical_dns = get_historical_dns(domain)
#     ssl_logs = get_ssl_cert_logs(domain)

#     # Shodan info, if DNS info is available (uses the first IP found)
#     if dns_info:
#         shodan_info = get_shodan_info(dns_info[0])
#         asn_info = get_asn_info(dns_info[0])
#     else:
#         shodan_info = "No IP found"
#         asn_info = "No IP found"

#     return JsonResponse({
#         'whois': str(whois_info),
#         'dns': dns_info,
#         'subdomains': subdomains,
#         'historical_dns': historical_dns,
#         'shodan': shodan_info,
#         'asn_info': asn_info,
#         'ssl_logs': ssl_logs,
#     })






# from django.shortcuts import render
# import requests
# from django.http import JsonResponse
# import whois
# import dns.resolver
# import ipinfo

# # Define API keys
# ipinfo_api_key = 'your_actual_ipinfo_api_key'  # Replace with your real IPinfo API key
# securitytrails_api_key = 'your_actual_securitytrails_api_key'  # Replace with your SecurityTrails API key
# shodan_api_key = 'your_actual_shodan_api_key'  # Replace with your Shodan API key

# # Function to get Whois information
# def get_whois_info(domain):
#     try:
#         return whois.whois(domain)
#     except Exception as e:
#         return str(e)

# # Function to get DNS information
# def get_dns_info(domain):
#     try:
#         answers = dns.resolver.resolve(domain, 'A')
#         return [answer.to_text() for answer in answers]
#     except Exception as e:
#         return f"DNS error: {str(e)}"

# # Function for Subdomain Enumeration using SecurityTrails API
# def enumerate_subdomains(domain):
#     url = f"https://api.securitytrails.com/v1/domain/{domain}/subdomains"
#     headers = {'APIKEY': securitytrails_api_key}
    
#     response = requests.get(url, headers=headers)
    
#     if response.status_code == 200:
#         return response.json().get('subdomains', [])
#     else:
#         return f"Error fetching subdomains: {response.status_code}"

# # Function to get server information from Shodan
# def get_shodan_info(ip):
#     url = f"https://api.shodan.io/shodan/host/{ip}?key={shodan_api_key}"
    
#     response = requests.get(url)
#     if response.status_code == 200:
#         return response.json()
#     else:
#         return f"Error fetching Shodan info: {response.status_code}"

# # Function to get SSL certificate logs using crt.sh
# def get_ssl_cert_logs(domain):
#     url = f"https://crt.sh/?q={domain}&output=json"
    
#     response = requests.get(url)
#     if response.status_code == 200:
#         return response.json()  # Return list of certificate logs
#     else:
#         return f"Error fetching SSL logs: {response.status_code}"

# # Function to get ASN information using IPinfo API
# def get_asn_info(ip):
#     handler = ipinfo.getHandler(ipinfo_api_key)
#     details = handler.getDetails(ip)
#     return {
#         'asn': details.org,
#         'city': details.city,
#         'region': details.region,
#         'country': details.country_name,
#         'lat': details.latitude,
#         'lon': details.longitude
#     }

# # Main function to check domain details
# def check_domain(request):
#     domain = request.GET.get('domain', None)  # Get the domain from request
    
#     if not domain:
#         return JsonResponse({'error': 'No domain provided'}, status=400)
    
#     whois_info = get_whois_info(domain)
#     dns_info = get_dns_info(domain)
#     subdomains = enumerate_subdomains(domain)
    
#     # Shodan info, if DNS info is available (uses the first IP found)
#     if dns_info and isinstance(dns_info, list) and dns_info[0]:
#         shodan_info = get_shodan_info(dns_info[0])
#         asn_info = get_asn_info(dns_info[0])
#     else:
#         shodan_info = "No IP found"
#         asn_info = "No ASN info found"
    
#     # SSL certificate logs
#     ssl_logs = get_ssl_cert_logs(domain)
    
#     return JsonResponse({
#         'whois': str(whois_info),
#         'dns': dns_info,
#         'subdomains': subdomains,
#         'shodan': shodan_info,
#         'asn_info': asn_info,
#         'ssl_logs': ssl_logs,
#     })








from django.shortcuts import render
from django.http import JsonResponse
import requests
import whois
import dns.resolver
import ipinfo

# Define API keys for IPinfo, Shodan, and SecurityTrails
# ipinfo_api_key = 'e2c418f72d039f'  # Replace with your real IPinfo API key
ipinfo_api_key = '0e48f52537790e'  # Replace with your real IPinfo API key
  
# shodan_api_key = 'tzBnZllididvL2yLVckJS56OyrdYL7A0'  # Replace with your real Shodan API key
shodan_api_key = 'iy28xuQax9DSociONeAtReOq5S6nhlIq'

# security_trails_api_key = 'TmJLR42vL_jRl1OltlUNdwhtB7zdcc7u'  # SecurityTrails API key
security_trails_api_key = 'LUggU9k5ozhBWzGFUscd_EmT9Tb3MIp2'
#hello hii   hi

# Function to get Whois information
def get_whois_info(domain):
    try:
        whois_data = whois.whois(domain)
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
        return {'error': str(e)}

# Function to get DNS information
def get_dns_info(domain):
    try:
        answers = dns.resolver.resolve(domain, 'A')
        return [answer.to_text() for answer in answers]
    except Exception as e:
        return f"DNS error: {str(e)}"

# Function to get historical DNS records from SecurityTrails
def get_historical_dns(domain):
    url = f'https://api.securitytrails.com/v1/history/{domain}'
    headers = {
        'APIKEY': security_trails_api_key
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()  # Assuming it returns JSON with historical DNS info
    return []

# Function to enumerate subdomains using SecurityTrails
def enumerate_subdomains(domain):
    url = f'https://api.securitytrails.com/v1/domain/{domain}/subdomains'
    headers = {
        'APIKEY': security_trails_api_key
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json().get('subdomains', [])  # Return subdomains list
    return []

# Function for SSL certificate logs using crt.sh
def get_ssl_cert_logs(domain):
    url = f"https://crt.sh/?q={domain}&output=json"
    
    response = requests.get(url)
    if response.status_code == 200:
        cert_data = response.json()
        return cert_data if cert_data else "No SSL certificates found"
    else:
        return f"Error fetching SSL logs: {response.status_code}"

# Function to get Shodan information using IPinfo API
def get_shodan_info(ip):
    url = f"https://api.shodan.io/shodan/host/{ip}?key={shodan_api_key}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()  # Return Shodan info
    return "No Shodan information found here"

# Function to get ASN information using IPinfo API
def get_asn_info(ip):
    handler = ipinfo.getHandler(ipinfo_api_key)
    details = handler.getDetails(ip)
    return {
        'asn': details.org,
        'city': details.city,
        'region': details.region,
        'country': details.country_name
    }

# Main function to check domain details
def check_domain(request):
    domain = request.GET.get('domain', None)  # Get the domain from request
    
    if not domain:
        return JsonResponse({'error': 'No domain provided'}, status=400)
    
    whois_info = get_whois_info(domain)
    dns_info = get_dns_info(domain)
    historical_dns = get_historical_dns(domain)
    subdomains = enumerate_subdomains(domain)
    
    # If DNS info is available, we can get the ASN info for the first IP
    ip_address = dns_info[0] if dns_info else None
    asn_info = get_asn_info(ip_address) if ip_address else {}
    
    # SSL certificate logs
    ssl_info = get_ssl_cert_logs(domain)
    
    # Shodan information
    shodan_info = get_shodan_info(ip_address) if ip_address else {}
    
    # Prepare the response data (in a tabular format)
    response_data = {
        'Domain': domain,
        'Registrar': whois_info.get('registrar', 'N/A'),
        'IP Address': ip_address or 'N/A',
        'ASN Info': asn_info,
        'Country': whois_info.get('country', 'N/A'),
        'Updated Date': whois_info.get('updated_date', 'N/A'),
        'Creation Date': whois_info.get('creation_date', 'N/A'),
        'Expiration Date': whois_info.get('expiration_date', 'N/A'),
        'Registrant Name': whois_info.get('registrant_name', 'N/A'),
        'Registrant Organization': whois_info.get('registrant_organization', 'N/A'),
        'Subdomains': subdomains,
        'Historical DNS': historical_dns,
        'SSL Certificates': ssl_info,
        'Shodan Info': shodan_info
    }
    
    return JsonResponse(response_data)
