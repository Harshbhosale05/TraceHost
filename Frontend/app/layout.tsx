import './globals.css';
import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import image from "@/public/image.png"
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  fallback: ['Consolas', 'Monaco', 'monospace']
});

export const metadata: Metadata = {
  title: 'TraceHost - Domain Security Intelligence',
  description: 'Advanced platform for analyzing domains, detecting threats, and providing comprehensive security intelligence',
  keywords: 'security, domain analysis, threat detection, phishing, malware, cybersecurity, DNS analysis, domain intelligence',
  authors: [{ name: 'TraceHost Security' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${jetbrainsMono.className} antialiased min-h-screen bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* Simplified background */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-0 left-0 w-full h-full bg-background opacity-90"></div>
            <div className="absolute top-[5%] left-[10%] w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[10rem]"></div>
          </div>
          
          <Header />
          <main className="flex-1 animate-fade-in">
            {children}
          </main>
          <footer className="border-t border-accent/10 py-6 backdrop-blur-md z-10">
            <div className="container">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                  <div className="h-8 w-8 rounded flex items-center justify-center bg-gradient-to-br from-primary to-accent text-white text-xs font-bold shadow-lg">
                    TH
                  </div>
                  <span className="text-sm font-semibold header">TraceHost</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} TraceHost Security. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}