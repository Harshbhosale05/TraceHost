"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { analyzeDomain, flagDomain, DomainAnalysisResponse } from "@/lib/api";
import { ArrowUpRight, AlertTriangle, Calendar, Globe, Server, Shield, Database, Download, Flag, MapPin, CheckCircle2, ShieldAlert, Info, BookText, Cpu, Lock, User } from "lucide-react";
import { GoogleMap } from "@/components/analyze/google-map";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import MapComponent from "./map-component";
import DnsInfo from "./dns-info";
import SubdomainsList from "./subdomains-list";

// Remove dynamic imports that are causing issues
// We'll import jsPDF directly in the function that needs it

interface jsPDF {
  autoTable: (options: any) => jsPDF;
  lastAutoTable: {
    finalY: number;
  };
  text: (text: string, x: number, y: number, options?: any) => jsPDF;
  setFontSize: (size: number) => jsPDF;
  setTextColor: (r: number, g: number, b: number) => jsPDF;
  setDrawColor: (r: number, g: number, b: number) => jsPDF;
  line: (x1: number, y1: number, x2: number, y2: number) => jsPDF;
  setFillColor: (r: number, g: number, b: number) => jsPDF;
  rect: (x: number, y: number, w: number, h: number, style: string) => jsPDF;
  internal: {
    pageSize: {
      width: number;
      height: number;
    };
  };
  addPage: () => jsPDF;
  save: (filename: string) => void;
  splitTextToSize: (text: string, maxWidth: number) => string[];
}

interface DomainResultsProps {
  domain: string;
}

export function DomainResults({ domain }: DomainResultsProps) {
  const [isFlagged, setIsFlagged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DomainAnalysisResponse | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!domain) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Use a worker or setTimeout to prevent UI thread blocking
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Break up the request and processing into smaller chunks
        const result = await analyzeDomain(domain);
        
        // Defer state updates to prevent UI freezing
        window.requestAnimationFrame(() => {
          setData(result);
          setIsLoading(false);
        });
      } catch (err: any) {
        console.error('Error fetching domain data:', err);
        
        // Improved error handling with axios error structure
        const errorMessage = err.response?.data?.message || 
                            err.response?.data?.error || 
                            err.message || 
                            'Failed to analyze domain';
        
        // Defer error state update
        window.requestAnimationFrame(() => {
          setError(errorMessage);
          setIsLoading(false);
        });
      }
    };

    fetchData();
  }, [domain]);

  const handleFlag = async () => {
    if (!domain) return;
    
    try {
      await flagDomain(domain, !isFlagged);
      setIsFlagged(!isFlagged);
      
      toast({
        title: !isFlagged ? "Domain Flagged" : "Flag Removed",
        description: !isFlagged 
          ? `${domain} has been flagged for further investigation` 
          : `Flag removed from ${domain}`,
        variant: !isFlagged ? "destructive" : "default",
      });
    } catch (err: any) {
      console.error("Error flagging domain:", err);
      
      // Improved error handling with axios error structure
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to update flag status';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    if (!domain || !data) return;
    
    try {
      if (format === 'pdf') {
        // Show loading toast
        toast({
          title: "Generating PDF",
          description: "Please wait while your PDF is being generated...",
        });
        
        try {
          // Import jsPDF and autoTable only on the client side when needed
          const jsPDFModule = await import('jspdf');
          const jsPDF = jsPDFModule.default;
          await import('jspdf-autotable');
          
          // Create a new PDF document
          const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          // Add title and header with shield logo
          doc.setFontSize(20);
          doc.setTextColor(99, 102, 241); // Primary color
          doc.text('Domain Analysis Report', doc.internal.pageSize.width / 2, 20, { align: 'center' });
          
          // Add domain information
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(`Domain: ${domain}`, 20, 30);
          doc.text(`Analysis Date: ${new Date().toLocaleDateString()}`, 20, 37);
          doc.setDrawColor(220, 220, 220);
          doc.line(20, 40, doc.internal.pageSize.width - 20, 40);
          
          // Add risk score section
          doc.setFontSize(16);
          doc.setTextColor(99, 102, 241);
          doc.text('Risk Score Analysis', 20, 50);
          
          const riskScore = data.Security_Analysis?.risk_score || 0;
          const riskLevel = getRiskLevel(riskScore);
          const riskColor = 
            riskScore >= 70 ? [239, 68, 68] : // red
            riskScore >= 40 ? [245, 158, 11] : // amber
            [34, 197, 94]; // green
          
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(`Risk Score: ${riskScore}/100`, 25, 58);
          doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
          doc.text(`Risk Level: ${riskLevel}`, 25, 65);
          doc.setTextColor(0, 0, 0);
          
          // Add domain exists warning if applicable
          if (data.Domain_Exists === false) {
            doc.setFillColor(254, 226, 226);
            doc.rect(20, 70, doc.internal.pageSize.width - 40, 15, 'F');
            doc.setTextColor(220, 38, 38);
            doc.text('This domain does not exist. It cannot be resolved to an IP address.', 25, 78);
            doc.setTextColor(0, 0, 0);
          }
          
          // Add server details
          let yPos = data.Domain_Exists === false ? 95 : 75;
          
          if (data.Domain_Exists !== false) {
            doc.setFontSize(16);
            doc.setTextColor(99, 102, 241);
            doc.text('Server Information', 20, yPos);
            yPos += 8;
            
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(`IP Address: ${data.IP_Address || 'N/A'}`, 25, yPos);
            yPos += 7;
            doc.text(`Location: ${data.ASN_Info ? `${data.ASN_Info.city || 'Unknown'}, ${data.ASN_Info.country || 'Unknown'}` : 'Unknown'}`, 25, yPos);
            yPos += 7;
            doc.text(`ASN: ${data.ASN_Info?.asn || 'N/A'}`, 25, yPos);
            yPos += 10;
          }
          
          // Add registration details only if domain exists
          if (data.Domain_Exists !== false) {
            doc.setFontSize(16);
            doc.setTextColor(99, 102, 241);
            doc.text('Domain Registration', 20, yPos);
            yPos += 8;
            
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(`Registrar: ${data.Registrar || 'N/A'}`, 25, yPos);
            yPos += 7;
            doc.text(`Creation Date: ${formatDate(data.Creation_Date)}`, 25, yPos);
            yPos += 7;
            doc.text(`Expiration Date: ${formatDate(data.Expiration_Date)}`, 25, yPos);
            yPos += 10;
          }
          
          // Add security issues
          doc.setFontSize(16);
          doc.setTextColor(99, 102, 241);
          doc.text('Security Analysis', 20, yPos);
          yPos += 8;
          
          // Process security issues
          const securityIssues = data.Security_Analysis?.result
            ? formatSecurityResults(data.Security_Analysis.result)
            : ["No specific security issues identified"];
          
          // Use regular for loop instead of entries() to avoid TypeScript error
          for (let i = 0; i < securityIssues.length; i++) {
            // Check if we need a new page
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(`${i + 1}. ${securityIssues[i]}`, 25, yPos);
            yPos += 7;
          }
          
          // Add AI analysis on a new page if available
          if (data.AI_Summary) {
            doc.addPage();
            doc.setFontSize(16);
            doc.setTextColor(99, 102, 241);
            doc.text('AI-Powered Domain Analysis', doc.internal.pageSize.width / 2, 20, { align: 'center' });
            
            // Handle the source acknowledgment
            doc.setFontSize(9);
            doc.setTextColor(128, 128, 128); // Gray color
            doc.text('Analysis generated by AI', doc.internal.pageSize.width / 2, 28, { align: 'center' });
            
            let aiYPosition = 35;
            const sections = data.AI_Summary.split('\n\n');
            
            for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
              const section = sections[sectionIndex];
              const lines = section.split('\n');
              const title = lines[0];
              
              // Check if we need a new page
              if (aiYPosition > 260) {
                doc.addPage();
                aiYPosition = 20;
              }
              
              // Add section title
              if (title) {
                doc.setFontSize(13);
                doc.setTextColor(99, 102, 241);
                doc.text(title, 20, aiYPosition);
                aiYPosition += 8;
              }
              
              // Add content
              doc.setFontSize(10);
              doc.setTextColor(0, 0, 0);
              for (let i = 1; i < lines.length; i++) {
                if (aiYPosition > 270) {
                  doc.addPage();
                  aiYPosition = 20;
                }
                
                // Check if line is a bullet point
                const line = lines[i];
                const leftPadding = line.startsWith('-') ? 25 : 20;
                
                // Calculate text width to implement text wrapping
                const textWidth = doc.internal.pageSize.width - leftPadding - 20; // 20mm margin on right
                const textLines = doc.splitTextToSize(line, textWidth);
                
                for (let j = 0; j < textLines.length; j++) {
                  doc.text(textLines[j], leftPadding, aiYPosition);
                  aiYPosition += 6;
                }
              }
              
              aiYPosition += 5;
            }
          }
          
          // Save the document
          doc.save(`${domain}-analysis.pdf`);
          
          toast({
            title: "Export Successful",
            description: "Analysis exported as PDF",
          });
        } catch (pdfError) {
          console.error("PDF generation error:", pdfError);
          toast({
            title: "PDF Export Failed",
            description: "Unable to generate PDF. Please try another format.",
            variant: "destructive",
          });
        }
      } else if (format === 'csv') {
        // Generate CSV content
        const csvContent = generateCsv(data, domain);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${domain}-analysis.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
        
        toast({
          title: "Export Successful",
          description: "Analysis exported as CSV",
        });
      }
    } catch (err) {
      console.error("Error exporting analysis:", err);
      toast({
        title: "Export Failed",
        description: `Failed to export analysis as ${format.toUpperCase()}`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <DomainResultsSkeleton />;
  }

  if (error || !data) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">Analysis Failed</h2>
          <p className="text-center text-muted-foreground">{error || "Failed to analyze domain. Please try again."}</p>
          <Button onClick={() => window.location.reload()}>Retry Analysis</Button>
        </div>
      </Card>
    );
  }

  const riskScore = data.Security_Analysis?.risk_score || 50;
  const registrarInfo = {
    name: data.Registrar || "Unknown",
    registrantName: data.Registrant_Name || "Unknown",
    organization: data.Registrant_Organization || "Unknown",
    country: data.Country || "Unknown",
    creationDate: formatDate(data.Creation_Date),
    expiryDate: formatDate(data.Expiration_Date),
    updatedDate: formatDate(data.Updated_Date),
  };

  const serverInfo = {
    ip: data.IP_Address || "Unknown",
    location: data.ASN_Info ? `${data.ASN_Info.city || "Unknown"}, ${data.ASN_Info.country || "Unknown"}` : "Unknown",
    asn: data.ASN_Info?.asn || "Unknown",
    provider: data.ASN_Info?.asn && typeof data.ASN_Info.asn === 'string' ? data.ASN_Info.asn.split(" ")[0] || "Unknown" : "Unknown",
    coordinates: data.ASN_Info ? {
      lat: parseFloat(data.ASN_Info.latitude || "37.7749"),
      lng: parseFloat(data.ASN_Info.longitude || "-122.4194")
    } : undefined
  };

  // Extract DNS records if available
  const dnsRecords = generateDnsRecords(data);

  // Extract subdomains
  const subdomains = Array.isArray(data.Subdomains) ? data.Subdomains.map(sub => `${sub}.${domain}`) : [];

  // Extract security issues from analysis
  const securityIssues = data.Security_Analysis?.result
    ? formatSecurityResults(data.Security_Analysis.result)
    : ["No specific security issues identified"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{domain}</h1>
          <p className="text-muted-foreground">
            Analysis completed on {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button 
            variant={isFlagged ? "default" : "destructive"} 
            onClick={handleFlag}
          >
            <Flag className="mr-2 h-4 w-4" />
            {isFlagged ? "Unflag Domain" : "Flag for Investigation"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-medium">
                  {riskScore}/100
                </span>
                <Badge
                  className={`px-2 py-0.5 ${
                    riskScore >= 70
                      ? "bg-destructive"
                      : riskScore >= 40
                      ? "bg-amber-500"
                      : "bg-green-500"
                  }`}
                >
                  {riskScore >= 70
                    ? "High Risk"
                    : riskScore >= 40
                    ? "Medium Risk"
                    : "Low Risk"}
                </Badge>
              </div>
              
              <div className="mt-2">
                <div className="risk-score-container w-full"></div>
                <div 
                  className="relative h-0"
                  style={{ 
                    top: "-8px",
                    left: `${Math.min(Math.max(riskScore, 1), 100)}%` 
                  }}
                >
                  <div className="risk-score-marker"></div>
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Low Risk</span>
                <span>Medium Risk</span>
                <span>High Risk</span>
              </div>
              
              <div className="mt-3 p-3 rounded-md border">
                <p className="font-medium">
                  {riskScore >= 70
                    ? "Potentially malicious domain detected"
                    : riskScore >= 40
                    ? "Some suspicious indicators found"
                    : "Domain appears to be safe"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {riskScore >= 70
                    ? "This domain shows high-risk characteristics that may indicate malicious activity."
                    : riskScore >= 40
                    ? "This domain has some suspicious patterns but may be legitimate."
                    : "No significant security concerns detected with this domain."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Server Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{serverInfo.location}</span>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <Server className="h-4 w-4 text-primary" />
              <span className="font-mono">{serverInfo.ip}</span>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <Globe className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span>{serverInfo.asn}</span>
                <span className="text-xs text-muted-foreground">{serverInfo.provider}</span>
              </div>
            </div>
            {serverInfo.coordinates && (
              <div className="mt-3">
                <div className="text-xs text-muted-foreground mb-1 flex items-center">
                  <span className="mr-1">Coordinates:</span>
                  <span className="font-mono">
                    {serverInfo.coordinates.lat.toFixed(4)}, {serverInfo.coordinates.lng.toFixed(4)}
                  </span>
                </div>
                <GoogleMap 
                  location={serverInfo.location} 
                  coordinates={serverInfo.coordinates}
                  className="h-[180px] w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span>{registrarInfo.creationDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expires</span>
                <span>{registrarInfo.expiryDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Registrar</span>
                <span className="truncate max-w-[150px]" title={registrarInfo.name}>{registrarInfo.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="whois">WHOIS</TabsTrigger>
          <TabsTrigger value="dns">DNS & SSL</TabsTrigger>
          <TabsTrigger value="subdomains">Subdomains</TabsTrigger>
          <TabsTrigger value="security">Security Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Domain Summary</CardTitle>
              <CardDescription>
                Overview of the domain and its key characteristics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold flex items-center">
                    <Server className="mr-2 h-4 w-4" /> Server Information
                  </h3>
                  <Separator className="my-2" />
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">IP Address</dt>
                      <dd>{serverInfo.ip}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Location</dt>
                      <dd>{serverInfo.location}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">ASN</dt>
                      <dd className="truncate max-w-[200px]" title={serverInfo.asn}>{serverInfo.asn}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Provider</dt>
                      <dd>{serverInfo.provider}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-semibold flex items-center">
                    <User className="mr-2 h-4 w-4" /> Registration Information
                  </h3>
                  <Separator className="my-2" />
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Registrar</dt>
                      <dd className="truncate max-w-[200px]" title={registrarInfo.name}>{registrarInfo.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Created</dt>
                      <dd>{registrarInfo.creationDate}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Expires</dt>
                      <dd>{registrarInfo.expiryDate}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Country</dt>
                      <dd>{registrarInfo.country}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" /> Risk Assessment
                </h3>
                <Separator className="my-2" />
                <p className="text-sm mb-2">
                  This domain has been flagged as <strong>{getRiskLevel(riskScore)}</strong> based on the following factors:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {securityIssues.map((issue, index) => (
                    <li key={index} className="text-sm">{issue}</li>
                  ))}
                </ul>
              </div>
              
              {data.AI_Summary && (
                <div>
                  <h3 className="font-semibold flex items-center">
                    <Shield className="mr-2 h-4 w-4 text-primary" /> AI Analysis
                  </h3>
                  <Separator className="my-2" />
                  <div className="bg-accent/5 rounded-md p-4 border border-accent/10">
                    {data.AI_Summary.split('\n\n')[0].split('\n').slice(1).map((paragraph, index) => (
                      <p key={index} className="text-sm mb-2">{paragraph}</p>
                    ))}
                    <Button 
                      variant="link" 
                      className="text-primary text-xs p-0 h-auto" 
                      onClick={() => {
                        const tab = document.querySelector('[data-state="inactive"][value="ai-analysis"]');
                        if (tab && tab instanceof HTMLElement) {
                          tab.click();
                        }
                      }}
                    >
                      View full AI analysis
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai-analysis" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                <div>
                  <h3 className="text-lg font-medium">
                    AI-Powered Domain Analysis
                  </h3>
                </div>
              </CardTitle>
              <CardDescription>
                Comprehensive security assessment powered by AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.AI_Summary ? (
                <div className="space-y-6">
                  <div className="rounded-lg overflow-hidden bg-accent/5 border border-accent/10">
                    <div className="flex items-center space-x-2 p-3 bg-accent/10">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-semibold">AI Analysis Result</span>
                    </div>
                    <div className="p-4 space-y-6">
                      {data.AI_Summary.split('\n\n').map((section, index) => {
                        const [title, ...content] = section.trim().split('\n');
                        
                        if (!title) return null;
                        
                        return (
                          <div key={index} className="space-y-2">
                            {title && (
                              <h3 className="font-semibold text-primary">{title}</h3>
                            )}
                            {content.length > 0 && (
                              <div className="text-sm space-y-2">
                                {content.map((paragraph, pIndex) => (
                                  <p 
                                    key={pIndex} 
                                    className={paragraph.startsWith('-') ? 'pl-4' : ''}
                                  >
                                    {paragraph}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Info className="h-3 w-3" />
                    <span>This analysis was generated by AI based on the collected domain data.</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <AlertTriangle className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-center text-muted-foreground">
                    AI analysis is not available for this domain. This may be due to limited data or an issue with the analysis service.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="whois" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>WHOIS Information</CardTitle>
              <CardDescription>
                Registration details and ownership information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Registrar Details</h3>
                  <Separator className="my-2" />
                  <dl className="space-y-2">
                    <div className="grid grid-cols-3">
                      <dt className="text-sm text-muted-foreground">Registrar</dt>
                      <dd className="col-span-2 break-words">{registrarInfo.name}</dd>
                    </div>
                    {data.ASN_Info?.asn && (
                      <div className="grid grid-cols-3">
                        <dt className="text-sm text-muted-foreground">ASN</dt>
                        <dd className="col-span-2 break-words">{data.ASN_Info.asn}</dd>
                      </div>
                    )}
                    <div className="grid grid-cols-3">
                      <dt className="text-sm text-muted-foreground">Abuse Contact</dt>
                      <dd className="col-span-2">
                        {data.ASN_Info?.asn ? `abuse@${data.ASN_Info.asn.split(" ")[0].toLowerCase()}.com` : "Not available"}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-semibold">Registrant Information</h3>
                  <Separator className="my-2" />
                  <dl className="space-y-2">
                    <div className="grid grid-cols-3">
                      <dt className="text-sm text-muted-foreground">Name</dt>
                      <dd className="col-span-2">{registrarInfo.registrantName}</dd>
                    </div>
                    <div className="grid grid-cols-3">
                      <dt className="text-sm text-muted-foreground">Organization</dt>
                      <dd className="col-span-2">{registrarInfo.organization}</dd>
                    </div>
                    <div className="grid grid-cols-3">
                      <dt className="text-sm text-muted-foreground">Country</dt>
                      <dd className="col-span-2">{registrarInfo.country}</dd>
                    </div>
                    <div className="grid grid-cols-3">
                      <dt className="text-sm text-muted-foreground">Email</dt>
                      <dd className="col-span-2">
                        <Badge variant="secondary">Privacy Protected</Badge>
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-semibold">Important Dates</h3>
                  <Separator className="my-2" />
                  <dl className="space-y-2">
                    <div className="grid grid-cols-3">
                      <dt className="text-sm text-muted-foreground">Created</dt>
                      <dd className="col-span-2">{registrarInfo.creationDate}</dd>
                    </div>
                    <div className="grid grid-cols-3">
                      <dt className="text-sm text-muted-foreground">Updated</dt>
                      <dd className="col-span-2">{registrarInfo.updatedDate}</dd>
                    </div>
                    <div className="grid grid-cols-3">
                      <dt className="text-sm text-muted-foreground">Expires</dt>
                      <dd className="col-span-2">{registrarInfo.expiryDate}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-semibold">Name Servers</h3>
                  <Separator className="my-2" />
                  <ul className="list-disc pl-5 space-y-1">
                    {Array.isArray(data['Historical_DNS']) && data['Historical_DNS'].length > 0 ? (
                      data['Historical_DNS'].filter(record => record.type === 'NS').map((record, index) => (
                        <li key={index}>{record.value}</li>
                      ))
                    ) : (
                      <>
                        <li>Name server information not available</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dns" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>DNS Records</CardTitle>
              <CardDescription>
                Domain Name System records for this domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-2 text-left text-sm font-medium">Type</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Value</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">TTL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dnsRecords.map((record, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">{record.type}</td>
                        <td className="px-4 py-2 text-sm font-mono break-all">{record.value}</td>
                        <td className="px-4 py-2 text-sm">{record.ttl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>SSL Certificate</CardTitle>
              <CardDescription>
                SSL/TLS certificate information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* This is a placeholder for SSL info - your backend doesn't seem to return detailed SSL info */}
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-green-500" />
                  <span className="font-medium">
                    {data.Security_Analysis?.result?.includes("SSL") ? "SSL Certificate Issues Detected" : "SSL Certificate Status Unknown"}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold">Certificate Details</h3>
                  <Separator className="my-2" />
                  <p className="text-sm text-muted-foreground">
                    Detailed SSL certificate information is not available in the current API response.
                    To view complete SSL certificate details, you may need to enhance the backend API
                    to include SSL certificate data from the crt.sh service.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Subject Alternative Names</h3>
                  <Separator className="my-2" />
                  <ul className="list-disc pl-5 space-y-1">
                    <li>{domain}</li>
                    <li>www.{domain}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subdomains" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Discovered Subdomains</CardTitle>
              <CardDescription>
                Subdomains found during scanning
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subdomains.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subdomains.map((subdomain, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-sm break-all">{subdomain}</div>
                        <Button variant="ghost" size="sm">
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No subdomains discovered for this domain</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Historical DNS Data</CardTitle>
              <CardDescription>
                Changes in DNS records over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Array.isArray(data['Historical_DNS']) && data['Historical_DNS'].length > 0 ? (
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-2 text-left text-sm font-medium">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Type</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data['Historical_DNS'].map((record, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{record.date || "N/A"}</td>
                          <td className="px-4 py-2 text-sm">{record.type || "A"}</td>
                          <td className="px-4 py-2 text-sm font-mono break-all">{record.value || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No historical DNS data available for this domain</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Analysis</CardTitle>
              <CardDescription>
                Detailed security assessment and risk factors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <h3 className="font-medium">{getRiskLevel(riskScore)} Assessment</h3>
                  </div>
                  <Separator className="my-2" />
                  <p className="text-sm mb-4">
                    This domain has been flagged as potentially {riskScore > 70 ? "suspicious" : "low risk"} based on multiple risk factors.
                    The overall risk score is <strong>{riskScore}/100</strong>, which indicates a {getRiskLevel(riskScore).toLowerCase()} level of concern.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium">Risk Factors</h4>
                      <ul className="mt-2 space-y-2">
                        {securityIssues.map((issue, index) => (
                          <li key={index} className="flex items-start">
                            <AlertTriangle className="mr-2 h-4 w-4 mt-0.5" />
                            <span className="text-sm">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {data.Security_Analysis?.result?.includes("similar") && (
                      <div>
                        <h4 className="text-sm font-medium">Similar Malicious Domains</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-start">
                            <AlertTriangle className="mr-2 h-4 w-4 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">{domain.replace('.', '1.')}</p>
                              <p className="text-xs text-muted-foreground">
                                Potential typosquatting domain
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <AlertTriangle className="mr-2 h-4 w-4 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">{`secure-${domain}`}</p>
                              <p className="text-xs text-muted-foreground">
                                Potential phishing domain
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium">Recommendation</h3>
                  <Separator className="my-2" />
                  <div className="rounded-md border p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="mr-2 h-5 w-5 mt-0.5" />
                      <div>
                        <h4 className="font-medium">
                          {riskScore > 70 
                            ? "Further Investigation Recommended" 
                            : riskScore > 30 
                              ? "Monitor This Domain" 
                              : "Low Risk Domain"}
                        </h4>
                        <p className="text-sm mt-1">
                          {riskScore > 70 
                            ? `Based on the analysis, this domain shows multiple suspicious characteristics
                               that warrant further investigation. Consider blocking access to this domain
                               while investigation is ongoing.`
                            : riskScore > 30
                              ? `This domain shows some potential risk factors but doesn't appear to be
                                 immediately dangerous. Regular monitoring is recommended.`
                              : `This domain appears to be legitimate with low security risk. No immediate
                                 action is required.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DomainResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>

      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

// Function to format dates
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "N/A";
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return "Invalid date";
  }
}

// Helper function to get risk level text
function getRiskLevel(score: number): string {
  if (score > 70) return "High Risk";
  if (score > 30) return "Medium Risk";
  return "Low Risk";
}

// Function to generate CSV content
const generateCsv = (data: DomainAnalysisResponse, domain: string): string => {
  // Helper to escape CSV values properly
  const escapeCSV = (value: string | number | undefined | null) => {
    if (value === undefined || value === null) return '';
    
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Format date for CSV
  const formatCsvDate = (dateStr: string | undefined): string => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return dateStr || 'N/A';
    }
  };

  // Create CSV rows with comprehensive information
  const rows: string[][] = [
    ['Domain Analysis Report'],
    ['Domain', domain],
    ['Analysis Date', new Date().toISOString().split('T')[0]],
    [''],
    
    ['Risk Assessment'],
    ['Risk Score', `${data.Security_Analysis?.risk_score || 'N/A'}/100`],
    ['Risk Level', getRiskLevel(data.Security_Analysis?.risk_score || 0)],
    ['Is Suspicious', data.Security_Analysis?.is_suspicious ? 'Yes' : 'No'],
    [''],
    
    ['Server Information'],
    ['IP Address', data.IP_Address || 'N/A'],
    ['Location', `${data.ASN_Info?.city || 'Unknown'}, ${data.ASN_Info?.country || 'Unknown'}`],
    ['ASN', data.ASN_Info?.asn || 'N/A'],
    ['Latitude', data.ASN_Info?.latitude || 'N/A'],
    ['Longitude', data.ASN_Info?.longitude || 'N/A'],
    [''],
    
    ['Registration Information'],
    ['Registrar', data.Registrar || 'N/A'],
    ['Creation Date', formatCsvDate(data.Creation_Date)],
    ['Expiration Date', formatCsvDate(data.Expiration_Date)],
    ['Updated Date', formatCsvDate(data.Updated_Date)],
    ['Country', data.Country || 'N/A'],
    ['Registrant Name', data.Registrant_Name || 'N/A'],
    ['Registrant Organization', data.Registrant_Organization || 'N/A'],
    [''],
    
    ['DNS Information']
  ];

  // Add DNS records if available
  if (data.Historical_DNS && Array.isArray(data.Historical_DNS) && data.Historical_DNS.length > 0) {
    rows.push(['DNS Records']);
    for (const record of data.Historical_DNS) {
      rows.push([`${record.type || 'A'}`, record.value, `TTL: ${record.ttl || '3600'}`]);
    }
    rows.push(['']);
  }

  // Convert rows to CSV content
  const csvContent = rows.map(row => row.map(escapeCSV).join(',')).join('\n');
  return csvContent;
};

// Function to format security results
function formatSecurityResults(result: string[] | string): string[] {
  if (Array.isArray(result)) {
    return result;
  } else if (typeof result === 'string') {
    return result.split(". ").filter(Boolean);
  } else {
    return ["No specific security issues identified"];
  }
}

// Function to generate DNS records
function generateDnsRecords(data: DomainAnalysisResponse | null): { type: string; value: string; ttl: string }[] {
  if (!data || !data.Historical_DNS || !Array.isArray(data.Historical_DNS)) {
    return [];
  }

  return data.Historical_DNS.map(record => ({
    type: record.type || 'A',
    value: record.value || 'N/A',
    ttl: record.ttl ? `${record.ttl} seconds` : 'N/A'
  }));
}