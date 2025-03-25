"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from "recharts";

interface DailyScansData {
  date: string;
  totalScans: number;
  suspicious: number;
  safe: number;
}

interface DailyScansChartProps {
  data: DailyScansData[];
}

export function DailyScansChart({ data }: DailyScansChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Scans (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="safe" fill="hsl(var(--chart-2))" name="Safe" />
                <Bar dataKey="suspicious" fill="hsl(var(--chart-1))" name="Suspicious" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}