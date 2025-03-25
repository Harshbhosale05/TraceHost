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
import { formatDistanceToNow } from "date-fns";

interface Scan {
  id: string;
  domain: string;
  riskScore: number;
  date: Date;
  status: "safe" | "suspicious" | "malicious";
}

interface RecentScansProps {
  scans: Scan[];
  isLoading?: boolean;
  error?: string;
}

export function RecentScans({ scans, isLoading, error }: RecentScansProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p>Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <p>Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Scans</CardTitle>
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent scans available</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Scanned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="font-medium">
                    <a 
                      href={`/analyze/results?domain=${encodeURIComponent(scan.domain)}`}
                      className="hover:underline"
                    >
                      {scan.domain}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-full max-w-24 rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full ${
                            scan.riskScore < 30
                              ? "bg-green-500"
                              : scan.riskScore < 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${scan.riskScore}%` }}
                        />
                      </div>
                      <span className="text-xs">{scan.riskScore}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        scan.status === "safe"
                          ? "outline"
                          : scan.status === "suspicious"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {scan.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatDistanceToNow(scan.date, { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}