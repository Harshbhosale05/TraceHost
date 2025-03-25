"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface SearchDomainProps {
  buttonText?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  variant?: "default" | "hero" | "minimal";
  fullWidth?: boolean;
  onSearch?: (domain: string) => void;
}

export function SearchDomain({
  buttonText = "Analyze Domain",
  placeholder = "Enter domain name (e.g., example.com)",
  className = "",
  inputClassName = "",
  buttonClassName = "",
  variant = "default",
  fullWidth = false,
  onSearch,
}: SearchDomainProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        router.push(`/analyze?domain=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  // Different layouts based on variant
  if (variant === "hero") {
    return (
      <form onSubmit={handleSearch} className={`relative max-w-2xl mx-auto ${className}`}>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-2">
          <div className="relative flex-grow mb-3 md:mb-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={placeholder}
              className={`search-input pl-12 h-12 text-base border-border ${inputClassName}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            type="submit" 
            className={`h-12 text-base font-medium ${buttonClassName}`}
          >
            <Search className="mr-2 h-5 w-5" />
            {buttonText}
          </Button>
        </div>
      </form>
    );
  }

  if (variant === "minimal") {
    return (
      <form onSubmit={handleSearch} className={`relative ${className}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className={`pl-9 h-9 ${inputClassName}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>
    );
  }

  // Default variant
  return (
    <form onSubmit={handleSearch} className={`relative flex items-center space-x-2 ${className} ${fullWidth ? 'w-full' : ''}`}>
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className={`pl-9 ${inputClassName}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button 
        type="submit" 
        className={buttonClassName}
      >
        {buttonText}
      </Button>
    </form>
  );
} 