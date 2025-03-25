'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Terminal, Key, Shield, Globe, Server, Info } from 'lucide-react';

export default function APIDocsPage() {
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [id]: true });
    setTimeout(() => {
      setCopied({ ...copied, [id]: false });
    }, 2000);
  };

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2"
        onClick={() => copyToClipboard(code, id)}
      >
        {copied[id] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <div className="container max-w-6xl py-0 space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground">
            TraceHost provides a powerful API for domain analysis and security assessment.
          </p>
        </div>
        <Separator />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="errors">Errors & Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>API Overview</CardTitle>
              <CardDescription>
                Use our API to integrate domain security analysis into your applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The TraceHost API enables developers to analyze domains for security risks,
                retrieve detailed information about domains, and manage suspicious domain lists.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col space-y-2 border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Domain Analysis</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Analyze any domain for security risks and get detailed assessment reports.
                  </p>
                </div>
                <div className="flex flex-col space-y-2 border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Security Assessment</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered security analysis and risk scores for domains.
                  </p>
                </div>
                <div className="flex flex-col space-y-2 border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Server className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Dashboard Data</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Access aggregated statistics and trends for analyzed domains.
                  </p>
                </div>
                <div className="flex flex-col space-y-2 border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Suspicious Domains</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get lists of potentially suspicious domains and flag domains for tracking.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Base URL</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">All API requests should be made to the following base URL:</p>
              <CodeBlock 
                code="https://api.tracehost.com/api" 
                id="base-url" 
              />
              <p className="mt-4 text-sm text-muted-foreground">
                Note: Replace with your actual API domain if self-hosting the service.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Secure your API requests using API keys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                All API requests must include your API key in the request headers. You can obtain 
                an API key from your account dashboard.
              </p>
              <div className="flex items-center space-x-2 mb-4">
                <Key className="h-5 w-5 text-primary" />
                <h3 className="font-medium">API Key Authentication</h3>
              </div>
              <p className="mb-2">Include your API key in the request headers:</p>
              <CodeBlock 
                code={`Authorization: Bearer YOUR_API_KEY`} 
                id="auth-header" 
              />
              <div className="bg-muted p-4 rounded-md mt-4">
                <h4 className="font-medium mb-2">Security Best Practices</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Never expose your API key in client-side code</li>
                  <li>Rotate your API keys regularly</li>
                  <li>Use environment variables to store your API keys</li>
                  <li>Set appropriate CORS restrictions for your API</li>
                  <li>Monitor your API usage for unusual patterns</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                Available endpoints and their functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-500">GET</Badge>
                  <h3 className="font-medium">/analyze</h3>
                </div>
                <p>Analyze a domain and get detailed security information.</p>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Query Parameters</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><code>domain</code> (required) - The domain to analyze</li>
                    <li><code>streaming</code> (optional) - Set to 'true' to receive streaming response for long analyses</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Response</h4>
                  <CodeBlock 
                    code={`{
  "Domain": "example.com",
  "Domain_Exists": true,
  "Summary": "Host IP Address: 93.184.216.34, Location: Norwell, Massachusetts, United States",
  "IP_Address": "93.184.216.34",
  "ASN_Info": {
    "asn": "AS15133 EdgeCast Networks, Inc.",
    "city": "Norwell",
    "region": "Massachusetts",
    "country": "United States",
    "latitude": "42.1596",
    "longitude": "-70.8209"
  },
  "Security_Analysis": {
    "result": ["Domain has been registered for over 5 years"],
    "is_suspicious": false,
    "risk_score": 25
  },
  "AI_Summary": "Domain analysis and security assessment..."
}`} 
                    id="analyze-response" 
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-500">GET</Badge>
                  <h3 className="font-medium">/suspicious</h3>
                </div>
                <p>Get suspicious analysis for a domain.</p>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Query Parameters</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><code>domain</code> (required) - The domain to analyze</li>
                  </ul>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-500">POST</Badge>
                  <h3 className="font-medium">/flag_domain</h3>
                </div>
                <p>Flag or unflag a domain for further investigation.</p>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Request Body</h4>
                  <CodeBlock 
                    code={`{
  "domain": "example.com",
  "flag": true  // true to flag, false to unflag
}`} 
                    id="flag-request" 
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-500">GET</Badge>
                  <h3 className="font-medium">/dashboard</h3>
                </div>
                <p>Get dashboard data with statistics and trends.</p>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Query Parameters</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><code>page</code> (optional) - Page number for pagination</li>
                    <li><code>page_size</code> (optional) - Items per page</li>
                  </ul>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-500">GET</Badge>
                  <h3 className="font-medium">/suspicious_domains</h3>
                </div>
                <p>Get a list of suspicious domains with filtering options.</p>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Query Parameters</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><code>page</code> (optional) - Page number (default: 1)</li>
                    <li><code>limit</code> (optional) - Items per page (default: 10)</li>
                    <li><code>search</code> (optional) - Search term to filter domains</li>
                    <li><code>filter</code> (optional) - Category filter</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>
                Example API calls in different programming languages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">JavaScript (fetch)</h3>
                <CodeBlock 
                  code={`// Analyze a domain
const analyzeDomain = async (domain) => {
  try {
    const response = await fetch(\`https://api.tracehost.com/api/analyze?domain=\${domain}\`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(\`API request failed with status: \${response.status}\`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing domain:', error);
    throw error;
  }
};

// Usage
analyzeDomain('example.com')
  .then(data => console.log(data))
  .catch(error => console.error(error));`} 
                  id="js-example" 
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Python (requests)</h3>
                <CodeBlock 
                  code={`import requests

def analyze_domain(domain):
    """Analyze a domain using the TraceHost API"""
    url = f"https://api.tracehost.com/api/analyze"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    params = {"domain": domain}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error analyzing domain: {e}")
        return None

# Usage
result = analyze_domain("example.com")
print(result)`} 
                  id="python-example" 
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">cURL</h3>
                <CodeBlock 
                  code={`# Analyze a domain
curl -X GET "https://api.tracehost.com/api/analyze?domain=example.com" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"

# Flag a domain
curl -X POST "https://api.tracehost.com/api/flag_domain" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"domain": "example.com", "flag": true}'`} 
                  id="curl-example" 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Handling & Rate Limits</CardTitle>
              <CardDescription>
                Understanding API errors and limitations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Error Codes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left border">Status Code</th>
                        <th className="p-2 text-left border">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border">400</td>
                        <td className="p-2 border">Bad request (e.g., missing required parameters)</td>
                      </tr>
                      <tr>
                        <td className="p-2 border">401</td>
                        <td className="p-2 border">Unauthorized (invalid or missing API key)</td>
                      </tr>
                      <tr>
                        <td className="p-2 border">403</td>
                        <td className="p-2 border">Forbidden (insufficient permissions)</td>
                      </tr>
                      <tr>
                        <td className="p-2 border">404</td>
                        <td className="p-2 border">Resource not found</td>
                      </tr>
                      <tr>
                        <td className="p-2 border">429</td>
                        <td className="p-2 border">Too many requests (rate limit exceeded)</td>
                      </tr>
                      <tr>
                        <td className="p-2 border">500</td>
                        <td className="p-2 border">Internal server error</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Error Response Format</h3>
                <CodeBlock 
                  code={`{
  "error": "Error message here",
  "message": "Additional details about the error",
  "status_code": 400
}`} 
                  id="error-response" 
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Rate Limits</h3>
                <p>
                  To ensure fair usage and system stability, the API enforces rate limits:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Free tier:</strong> 100 requests per day</li>
                  <li><strong>Basic tier:</strong> 1,000 requests per day</li>
                  <li><strong>Premium tier:</strong> 10,000 requests per day</li>
                  <li><strong>Enterprise tier:</strong> Custom limits</li>
                </ul>
                <p className="mt-2">
                  Rate limit headers are included in API responses:
                </p>
                <CodeBlock 
                  code={`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 985
X-RateLimit-Reset: 1623459600`} 
                  id="rate-limit-headers" 
                />
              </div>
              
              <div className="p-4 border rounded-md bg-amber-50 text-amber-900">
                <h3 className="font-medium mb-2">Domain Analysis Timeout</h3>
                <p className="text-sm">
                  Domain analysis is a resource-intensive operation that may take up to 30 seconds for comprehensive results.
                  For consistent performance, consider using the streaming option for endpoint /analyze by setting the
                  <code>streaming=true</code> parameter.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 