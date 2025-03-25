"use client";

import { Card } from "@/components/ui/card";

interface MapComponentProps {
  lat?: string | number;
  lng?: string | number;
}

export default function MapComponent({ lat, lng }: MapComponentProps) {
  if (!lat || !lng) {
    return (
      <Card className="w-full h-48 flex items-center justify-center">
        <p className="text-muted-foreground">Location data not available</p>
      </Card>
    );
  }

  return (
    <Card className="w-full h-48 flex items-center justify-center">
      <p>Map would display here at coordinates: {lat}, {lng}</p>
    </Card>
  );
} 