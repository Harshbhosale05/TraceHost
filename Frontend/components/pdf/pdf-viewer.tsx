import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';

// Initialize PDF.js worker
const workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

interface PDFViewerProps {
  url: string;
  fileName?: string;
}

export function PDFViewer({ url, fileName = 'document.pdf' }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        const loadingTask = pdfjs.getDocument(url);
        const pdf = await loadingTask.promise;
        setPdf(pdf);
        setTotalPages(pdf.numPages);
        await renderPage(pdf, 1);
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [url]);

  const renderPage = async (pdf: PDFDocumentProxy, pageNumber: number) => {
    if (!canvasRef.current) return;

    const page = await pdf.getPage(pageNumber);
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
  };

  const changePage = async (delta: number) => {
    if (!pdf) return;

    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      await renderPage(pdf, newPage);
    }
  };

  const handleZoom = (delta: number) => {
    const newScale = scale + delta;
    if (newScale >= 0.5 && newScale <= 3) {
      setScale(newScale);
      if (pdf) {
        renderPage(pdf, currentPage);
      }
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <Card className="p-6 w-full max-w-4xl mx-auto card-modern">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => changePage(-1)}
              disabled={currentPage <= 1}
              className="button-modern h-9 w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changePage(1)}
              disabled={currentPage >= totalPages}
              className="button-modern h-9 w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleZoom(-0.2)}
              disabled={scale <= 0.5}
              className="button-modern h-9 w-9"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground min-w-[4rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleZoom(0.2)}
              disabled={scale >= 3}
              className="button-modern h-9 w-9"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={downloadPDF}
              className="button-modern h-9 w-9"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative w-full overflow-hidden rounded-lg glass">
          <canvas
            ref={canvasRef}
            className="mx-auto"
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 