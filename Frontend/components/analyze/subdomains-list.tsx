"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";

interface SubdomainsListProps {
  subdomains?: string[];
  domain?: string;
}

export default function SubdomainsList({ subdomains, domain }: SubdomainsListProps) {
  if (!subdomains || subdomains.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center">
            <Globe className="mr-2 h-4 w-4" /> Subdomains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No subdomains discovered</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center">
          <Globe className="mr-2 h-4 w-4" /> Subdomains ({subdomains.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 max-h-48 overflow-y-auto">
          {subdomains.map((subdomain, i) => (
            <li key={i} className="text-sm">
              {subdomain}.{domain}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
} 