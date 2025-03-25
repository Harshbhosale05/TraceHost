"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

interface DnsInfoProps {
  dnsRecords?: string[] | string;
}

export default function DnsInfo({ dnsRecords }: DnsInfoProps) {
  const records = Array.isArray(dnsRecords) ? dnsRecords : dnsRecords ? [dnsRecords] : [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center">
          <Database className="mr-2 h-4 w-4" /> DNS Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        {records.length > 0 ? (
          <ul className="space-y-1">
            {records.map((record, i) => (
              <li key={i} className="text-sm">
                {record}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No DNS records available</p>
        )}
      </CardContent>
    </Card>
  );
} 