// API service for communicating with the Django backend

import axios from 'axios';

// API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Cache duration from environment variables or default to 5 minutes
const CACHE_DURATION = parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || '300') * 1000;

// Request timeout from environment variables or default to 2 minutes
const REQUEST_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT || '120000');

// Configure axios defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization token if available
api.interceptors.request.use((config) => {
  const token = process.env.NEXT_PUBLIC_API_TOKEN;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Cache to store API results and reduce redundant requests
const apiCache = new Map();

export interface DomainAnalysisResponse {
  Domain: string;
  Domain_Exists?: boolean;
  Summary: string;
  IP_Address?: string;
  ASN_Info?: {
    asn: string;
    city: string;
    region: string;
    country: string;
    latitude: string;
    longitude: string;
  };
  Registrar?: string;
  Country?: string;
  Updated_Date?: string;
  Creation_Date?: string;
  Expiration_Date?: string;
  Registrant_Name?: string;
  Registrant_Organization?: string;
  Subdomains?: string[];
  Historical_DNS?: any[];
  Server_Location?: {
    lat: string;
    lng: string;
  } | string;
  Security_Analysis?: {
    result: string[] | string;
    is_suspicious: boolean;
    risk_score: number;
  };
  AI_Summary?: string;
}

export interface DashboardDataResponse {
  stats: {
    total_scanned_domains: number;
    safe_domains: number;
    suspicious_domains: number;
  };
  daily_scans: {
    date: string;
    count: number;
  }[];
  risk_levels: {
    risk_score: string;
    count: number;
  }[];
  recent_scans: {
    domain: string;
    risk_score: number;
    scan_date: string;
    is_suspicious: boolean;
  }[];
}

export interface SuspiciousDomainsParams {
  page: number;
  limit: number;
  search: string;
  filter: string | null;
}

export interface SuspiciousDomainsResponse {
  domains: {
    id: string;
    domain: string;
    risk_score: number;
    detection_date: string;
    status: string;
  }[];
  total: number;
}

export interface ExportParams {
  search?: string;
  filter?: string | null;
}

/**
 * Cached fetch function to handle API requests with built-in caching and verbose logging
 */
async function cachedFetch(url: string, options?: RequestInit, bypassCache = false): Promise<any> {
  const cacheKey = `${url}${options ? JSON.stringify(options) : ''}`;
  const now = Date.now();
  
  // Enable/disable logging based on environment
  const enableLogging = process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === 'true';
  if (enableLogging) {
    console.log(`API Request: ${options?.method || 'GET'} ${url}`);
  }

  // Check if using mock data
  const isUsingMock = process.env.NODE_ENV !== 'production';
  if (isUsingMock && enableLogging) {
    console.log(`API: Using mock data (process.env.NODE_ENV = ${process.env.NODE_ENV})`);
  }

  // Check cache unless told to bypass
  if (!bypassCache && apiCache.has(cacheKey)) {
    const { data, timestamp } = apiCache.get(cacheKey);
    if (now - timestamp < CACHE_DURATION) {
      if (enableLogging) console.log(`API: Using cached response for ${url}`);
      return data; // Return cached data if not expired
    }
    if (enableLogging) console.log(`API: Cache expired for ${url}`);
  }

  try {
    if (enableLogging) console.log(`API: Fetching data from ${url}`);
    
    // Add timeout for better error handling
    const controller = new AbortController();
    const timeoutMs = parseInt(process.env.NEXT_PUBLIC_FETCH_TIMEOUT || '10000');
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const requestOptions = {
      ...options,
      signal: controller.signal,
    };
    
    const response = await fetch(url, requestOptions);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      if (enableLogging) console.error(`API Error: ${response.status} - ${response.statusText}`, errorText);
      throw new Error(`API request failed with status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    if (enableLogging) console.log(`API Success: ${url}`);
    
    // Cache the result
    apiCache.set(cacheKey, { data, timestamp: now });
    
    return data;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error(`API Timeout: Request to ${url} took too long`);
      throw new Error('Request timed out. Please check your network connection or try again later.');
    }
    
    console.error('API Request Error:', error);
    
    // Try to check if the server is running
    if (!isUsingMock) {
      try {
        await fetch(`${API_BASE_URL}/health`, { method: 'HEAD', mode: 'no-cors' });
        console.log('API: Server appears to be running but returned an error');
      } catch (serverCheckError) {
        console.error('API: Server does not appear to be running', serverCheckError);
        throw new Error('Cannot connect to the backend server. Please ensure it is running.');
      }
    }
    
    throw error;
  }
}

/**
 * Analyze a domain and get detailed security information
 */
export const analyzeDomain = async (domain: string): Promise<DomainAnalysisResponse> => {
  try {
    const response = await api.get('/api/analyze', {
      params: { domain },
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing domain:', error);
    throw error;
  }
};

/**
 * Get suspicious analysis for a domain
 */
export const getSuspiciousAnalysis = async (domain: string) => {
  try {
    const response = await api.get('/api/suspicious', {
      params: { domain },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting suspicious analysis:', error);
    throw error;
  }
};

/**
 * Flag or unflag a domain
 */
export const flagDomain = async (domain: string, flag: boolean = true) => {
  try {
    const response = await api.post('/api/flag_domain', {
      domain,
      flag,
    });
    return response.data;
  } catch (error) {
    console.error('Error flagging domain:', error);
    throw error;
  }
};

/**
 * Get dashboard data
 */
export const getDashboardData = async () => {
  try {
    const response = await api.get('/api/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    throw error;
  }
};

/**
 * Get list of suspicious domains
 */
export const getSuspiciousDomains = async (page: number = 1, limit: number = 10, search: string = '', filter: string = '') => {
  try {
    const response = await api.get('/api/suspicious_domains', {
      params: {
        page,
        limit,
        search,
        filter,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting suspicious domains:', error);
    throw error;
  }
};

export default api;