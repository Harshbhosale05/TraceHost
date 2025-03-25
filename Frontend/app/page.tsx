"use client";

import { Shield, Globe, Zap } from "lucide-react";
import { SearchDomain } from "@/components/common/search-domain";

export default function Home() {
  return (
    <main className="flex-1 p-0 md:p-0 relative min-h-screen flex flex-col">
      {/* Simplified background */}
      <div className="absolute inset-0 -z-10 bg-background">
        <div className="absolute top-[20%] left-[20%] w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-[10rem]"></div>
      </div>

      <section className="home-content">
        <div className="home-hero md:items-start">
          <div className="domain-badge">
            Domain Intelligence
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-2xl lg:text-2xl font-semibold text-foreground leading-tight">
              Secure Domain Intelligence
            </h1>
            <h2 className="text-xl md:text-2xl font-medium text-muted-foreground">
              for Modern Threats
            </h2>
          </div>
          {/* <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Analyze domains in real-time to detect security threats, phishing attempts, and
            malicious behavior with our advanced threat intelligence platform.
          </p> */}

          <SearchDomain 
            variant="hero" 
            buttonText="Analyze" 
            className="mt-8" 
            buttonClassName="font-normal px-6"
            inputClassName="border-border bg-background/80 shadow-none"
          />
        </div>

        <div className="home-features">
          <div className="feature-box">
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-background border border-border mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Threat Detection</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Identify malicious domains, phishing attempts, and fraud with our advanced AI analysis system.
            </p>
          </div>

          <div className="feature-box">
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-background border border-border mb-4">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Domain Intelligence</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get comprehensive information about any domain including WHOIS data, DNS records, and SSL certificates.
            </p>
          </div>

          <div className="feature-box">
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-background border border-border mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Real-time Analysis</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get instant results with our scanning engine that analyzes domains in real-time.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}