"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface GoogleMapProps {
  coordinates: { lat: number; lng: number };
  location: string;
  className?: string;
}

export function GoogleMap({ coordinates, location, className = "" }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!coordinates || !mapRef.current) return;
    
    // Get API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error("Google Maps API key is not set in environment variables");
      return;
    }
    
    // Initialize Google Maps with API key
    const loader = new Loader({
      apiKey,
      version: "weekly",
    });

    loader.load().then(() => {
      const map = new google.maps.Map(mapRef.current!, {
        center: coordinates,
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        // Simplified, minimalistic styling
        styles: [
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#999999" }]
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "all",
            elementType: "geometry.fill",
            stylers: [{ color: "#f5f5f5" }]
          },
          {
            featureType: "poi",
            elementType: "all",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "road",
            elementType: "all",
            stylers: [{ saturation: -100 }, { lightness: 45 }]
          },
          {
            featureType: "transit",
            elementType: "all",
            stylers: [{ visibility: "simplified" }]
          },
          {
            featureType: "water",
            elementType: "all",
            stylers: [{ color: "#e0e0e0" }]
          }
        ]
      });
      
      // Simple marker without animation
      new google.maps.Marker({
        position: coordinates,
        map: map,
        title: location
      });
    }).catch(error => {
      console.error("Error loading Google Maps:", error);
    });
  }, [coordinates, location]);

  return <div ref={mapRef} className={`w-full h-[160px] rounded border border-border ${className}`} />;
} 