"use client";

import { useSearchParams } from "next/navigation";
import { DomainResults } from "@/components/analyze/domain-results";
import { DomainForm } from "@/components/analyze/domain-form";

// Add a timeout utility function to handle API timeouts
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 60000) => {
  const controller = new AbortController();
  const { signal } = controller;
  
  // Create a promise that rejects after the specified timeout
  const timeoutPromise = new Promise((_, reject) => {
    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timed out after ${timeout}ms`));
    }, timeout);
    
    // Clear the timeout if the fetch completes
    signal.addEventListener('abort', () => clearTimeout(timeoutId));
  });
  
  try {
    // Race the fetch against the timeout
    const response = await Promise.race([
      fetch(url, { ...options, signal }),
      timeoutPromise
    ]) as Response;
    
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const domain = searchParams.get("domain") || "";

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-6 pt-16 md:pt-20 analyze-page-content">
        <div className="container mx-auto py-6">
          <div className="flex flex-col space-y-6 max-w-5xl mx-auto">
            <DomainForm />
            <DomainResults domain={domain} />
          </div>
        </div>
      </main>
    </div>
  );
}