"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { SearchDomain } from "@/components/common/search-domain";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { ApiStatus } from "@/components/common/api-status";
import Image from 'next/image';
// import { MobileNav } from '@/components/mobile-nav';
import image from "@/public/image.png"
export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Add scroll state to create transparent header effect
  const [scrolled, setScrolled] = useState(false);
  
  // Add scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearch = (domain: string) => {
    router.push(`/analyze?domain=${encodeURIComponent(domain)}`);
    setIsSearchOpen(false);
  };

  // Check if link is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 backdrop-blur-md border-b border-accent/10 bg-background/70">
      <div className="container px-4 sm:px-6 mx-auto flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-3 mr-8">
            <div className="w-50 h-50 relative">
              <Image 
                src={image} 
                alt="TraceHost Shield Logo" 
                width={50} 
                height={50}
                className="object-contain"
              />
            </div>
            <span className="text-3xl font-bold gradient">TraceHost</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
            <Link href="/suspicious" className={`nav-link ${isActive('/suspicious') ? 'active' : ''}`}>
              Suspicious Domains
            </Link>
            <Link href="/analyze" className={`nav-link ${isActive('/analyze') ? 'active' : ''}`}>
              Analyze
            </Link>
            <Link href="/api-docs" className={`nav-link ${isActive('/api-docs') ? 'active' : ''}`}>
              API Docs
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <SearchDomain 
              variant="minimal" 
              placeholder="Search domains..." 
              inputClassName="md:w-[200px] lg:w-[280px] focus:w-[300px] transition-all bg-card/60"
              onSearch={handleSearch}
            />
          </div>
          
          <div className="flex md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSearchOpen(true)}
              className="mr-1"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="glass-card border-0">
                <SheetHeader className="mb-4">
                  <SheetTitle className="header text-center text-xl">TraceHost</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4">
                  <SheetClose asChild>
                    <Link href="/" className={`nav-item hover:bg-accent/10 ${isActive('/') ? 'bg-accent/10' : ''}`}>
                      Home
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/suspicious" className={`nav-item hover:bg-accent/10 ${isActive('/suspicious') ? 'bg-accent/10' : ''}`}>
                      Suspicious Domains
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/analyze" className={`nav-item hover:bg-accent/10 ${isActive('/analyze') ? 'bg-accent/10' : ''}`}>
                      Analyze
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/api-docs" className={`nav-item hover:bg-accent/10 ${isActive('/api-docs') ? 'bg-accent/10' : ''}`}>
                      API Docs
                    </Link>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <ApiStatus />

          <Button
            className="hidden md:flex gradient-button shadow-lg"
            onClick={() => router.push('/analyze')}
          >
            Analyze Domain
          </Button>
        </div>
      </div>

      {/* Mobile search overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-start pt-10 px-4 animate-fade-in">
          <div className="w-full max-w-md mx-auto glass-card p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium header">Search Domains</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SearchDomain 
              placeholder="Enter domain name (e.g., example.com)" 
              buttonText="Search"
              inputClassName="h-12 text-lg pl-10"
              buttonClassName="w-full mt-4 h-12 gradient-button"
              fullWidth={true}
              onSearch={handleSearch}
            />
          </div>
        </div>
      )}
    </header>
  );
}