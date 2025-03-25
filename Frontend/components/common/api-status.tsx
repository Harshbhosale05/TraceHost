"use client";

import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Component that displays the API connection status as a small colored dot
 */
export const ApiStatus = () => {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [apiUrl, setApiUrl] = useState<string>('');
  
  useEffect(() => {
    // Get the API URL from environment variables
    const url = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    setApiUrl(url);
    
    // Check if the backend is accessible
    const checkConnection = async () => {
      try {
        // Use the health endpoint if available, otherwise try a lightweight request
        const endpoint = `${url}/health`;
        
        const response = await fetch(endpoint, { 
          method: 'HEAD',
          mode: 'no-cors',
          // Short timeout to avoid blocking the UI
          signal: AbortSignal.timeout(2000)
        });
        
        setStatus('connected');
      } catch (error) {
        console.error('API Status: Backend connection failed', error);
        setStatus('disconnected');
      }
    };
    
    checkConnection();
    
    // Set check frequency from env or default to 30 seconds
    const checkFrequency = parseInt(process.env.NEXT_PUBLIC_API_CHECK_FREQUENCY || '30000');
    
    // Recheck connection periodically
    const interval = setInterval(checkConnection, checkFrequency);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center">
            <span className={`h-2.5 w-2.5 rounded-full ${
              status === 'connected' ? 'bg-green-500' : 
              status === 'connecting' ? 'bg-amber-500' : 'bg-red-500'
            } ${
              status === 'connected' ? 'shadow-green-500/50' : 
              status === 'connecting' ? 'shadow-amber-500/50' : 'shadow-red-500/50'
            }`} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>API Status: {status}</p>
          <p className="text-xs mt-1">
            {status === 'connected' 
              ? 'Successfully connected to backend'
              : status === 'connecting' 
                ? 'Attempting to connect to backend...'
                : 'Not connected to backend - using mock data'
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}; 