"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function TestPdfPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGeneratePdf = async () => {
    setIsLoading(true);
    
    try {
      // Create a simple PDF to test
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title
      doc.setFontSize(22);
      doc.setTextColor(63, 81, 181);
      doc.text('PDF Export Test', 105, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
      
      // Add a simple table
      const tableData = [
        ['Row 1', 'Test data 1'],
        ['Row 2', 'Test data 2'],
        ['Row 3', 'Test data 3']
      ];
      
      doc.autoTable({
        startY: 60,
        head: [['Header 1', 'Header 2']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [63, 81, 181], textColor: [255, 255, 255] },
        margin: { left: 20 }
      });
      
      // Save the PDF
      doc.save("test-pdf-export.pdf");
      
      toast({
        title: "PDF Created",
        description: "Test PDF was generated successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate test PDF",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 p-6 analyze-page-content mt-16">
      <div className="container max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>PDF Export Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This page tests the PDF export functionality using jsPDF directly. 
              Click the button below to generate a simple test PDF.
            </p>
            <Button 
              onClick={handleGeneratePdf} 
              disabled={isLoading}
              className="gradient-button"
            >
              {isLoading ? "Generating..." : "Generate Test PDF"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 