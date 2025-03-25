'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DomainResults } from '@/components/analyze/domain-results';
import { analyzeDomain, DomainAnalysisResponse } from '@/lib/api';

export default function DomainAnalysisPage({
  params,
}: {
  params: { domain: string };
}) {
  const { toast } = useToast();
  const [data, setData] = useState<DomainAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Decode the domain from the URL
  const decodedDomain = decodeURIComponent(params.domain);

  useEffect(() => {
    async function fetchData() {
      if (!decodedDomain) {
        setError('No domain specified');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        toast({
          title: "Analyzing domain...",
          description: `Gathering information about ${decodedDomain}`,
        });

        // Use the axios-based API helper
        const result = await analyzeDomain(decodedDomain);
        setData(result);
        
        toast({
          title: "Analysis complete",
          description: "Domain information retrieved successfully",
        });
      } catch (err: any) {
        console.error('Error fetching domain data:', err);
        setError(err.message || 'Failed to analyze domain. Please try again later.');
        
        toast({
          title: "Analysis failed",
          description: err.message || "Failed to analyze domain. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [decodedDomain, toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <h1 className="text-xl font-bold">Analyzing {decodedDomain}...</h1>
        <p className="text-muted-foreground mt-2">
          This may take up to 30 seconds for comprehensive analysis
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Analysis Failed</h1>
          <p>{error}</p>
          <a 
            href="/" 
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">No Data Available</h1>
          <p>No data could be retrieved for this domain. Please try again or analyze a different domain.</p>
          <a 
            href="/" 
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return <DomainResults domain={decodedDomain} />;
} 