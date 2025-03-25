"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Download, Filter, Search, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getSuspiciousDomains, exportSuspiciousDomains, SuspiciousDomainsParams, ExportParams } from "@/lib/api";

export default function SuspiciousPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [domains, setDomains] = useState<any[]>([]);
  const [totalDomains, setTotalDomains] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const itemsPerPage = 10;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch domains when filters change
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setIsLoading(true);
        
        const params: SuspiciousDomainsParams = {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchQuery,
          filter: activeFilter
        };
        
        const data = await getSuspiciousDomains(params);
        
        setDomains(data.domains || []);
        setTotalDomains(data.total || 0);
        setError(null);
      } catch (err) {
        console.error("Error fetching suspicious domains:", err);
        setError("Failed to load suspicious domains. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDomains();
  }, [currentPage, debouncedSearchQuery, activeFilter]);

  // Handle export function
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const params: ExportParams = {
        search: debouncedSearchQuery,
        filter: activeFilter
      };
      
      const pdfData = await exportSuspiciousDomains(params);
      
      // Create blob and download
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'suspicious-domains.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Successful",
        description: "The PDF has been downloaded to your device.",
      });
    } catch (err) {
      console.error("Error exporting domains:", err);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was an error exporting the data. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <main className="flex-1 animate-fade-in suspicious-page-content mt-5">
      <div className="flex flex-col space-y-6 container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight header">Suspicious Domains</h1>
            <p className="text-muted-foreground">
              View and manage detected suspicious domains
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              className="gradient-button"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          <Card className="glass-card overflow-hidden">
            <CardHeader className="py-4 px-6 border-b border-accent/10 bg-gradient-to-r from-background to-card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="text-lg font-medium header">
                  All Suspicious Domains
                </CardTitle>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search domains..."
                      className="pl-8 h-9 md:w-[200px] lg:w-[300px] search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 border-accent/20 hover:border-accent/40">
                        <Filter className="mr-2 h-4 w-4" />
                        {activeFilter ? 
                          activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1) + " Risk" : 
                          "All Domains"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 glass-card">
                      <DropdownMenuCheckboxItem
                        checked={activeFilter === null}
                        onCheckedChange={() => setActiveFilter(null)}
                      >
                        All Domains
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={activeFilter === "high"}
                        onCheckedChange={() => setActiveFilter("high")}
                      >
                        High Risk
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={activeFilter === "medium"}
                        onCheckedChange={() => setActiveFilter("medium")}
                      >
                        Medium Risk
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={activeFilter === "low"}
                        onCheckedChange={() => setActiveFilter("low")}
                      >
                        Low Risk
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6">
                  <TableSkeleton />
                </div>
              ) : error ? (
                <div className="flex h-[300px] w-full items-center justify-center p-6">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                    <h3 className="font-semibold text-lg">Error loading domains</h3>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </div>
              ) : domains.length === 0 ? (
                <div className="flex h-[300px] w-full items-center justify-center p-6">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                    <h3 className="font-semibold text-lg">No domains found</h3>
                    <p className="text-sm text-muted-foreground">
                      {debouncedSearchQuery || activeFilter
                        ? "Try adjusting your search or filter"
                        : "Domain data will appear here once available"}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-card">
                          <TableHead className="w-[300px]">Domain</TableHead>
                          <TableHead>Risk Score</TableHead>
                          <TableHead className="hidden md:table-cell">Detection Date</TableHead>
                          <TableHead className="hidden md:table-cell">Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {domains.map((domain) => (
                          <TableRow key={domain.id} className="hover:bg-secondary/5">
                            <TableCell className="font-medium">
                              {domain.domain}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`px-2 py-1 ${
                                  domain.risk_score >= 70
                                    ? "badge-destructive"
                                    : domain.risk_score >= 40
                                    ? "badge-warning"
                                    : "badge-outline"
                                }`}
                              >
                                {domain.risk_score}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{formatDate(domain.detection_date)}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge
                                className={`px-2 py-1 ${
                                  domain.status === "active"
                                    ? "badge-destructive"
                                    : domain.status === "monitoring"
                                    ? "badge-warning"
                                    : "badge-outline"
                                }`}
                              >
                                {domain.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" className="gradient-border" asChild>
                                <a href={`/analyze?domain=${domain.domain}`}>
                                  View Details
                                </a>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center justify-between p-4 border-t border-accent/10">
                    <div className="text-sm text-muted-foreground">
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalDomains)} to {Math.min(currentPage * itemsPerPage, totalDomains)} of {totalDomains} domains
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) {
                                setCurrentPage(currentPage - 1);
                              }
                            }}
                            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        {Array.from(
                          { length: Math.min(3, Math.ceil(totalDomains / itemsPerPage)) },
                          (_, i) => {
                            const page = currentPage <= 2
                              ? i + 1
                              : currentPage >= Math.ceil(totalDomains / itemsPerPage) - 1
                                ? Math.ceil(totalDomains / itemsPerPage) - 2 + i
                                : currentPage - 1 + i;
                            
                            if (page > Math.ceil(totalDomains / itemsPerPage)) return null;
                            
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(page);
                                  }}
                                  isActive={currentPage === page}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                        )}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < Math.ceil(totalDomains / itemsPerPage)) {
                                setCurrentPage(currentPage + 1);
                              }
                            }}
                            className={currentPage >= Math.ceil(totalDomains / itemsPerPage) ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Custom badge styles
const styles = `
.badge-destructive {
  background: linear-gradient(135deg, hsl(0, 84%, 60%), hsl(350, 80%, 60%));
  color: white;
}

.badge-warning {
  background: linear-gradient(135deg, hsl(45, 100%, 60%), hsl(30, 100%, 60%));
  color: white;
}

.badge-outline {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
`;