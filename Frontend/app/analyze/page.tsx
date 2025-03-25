import { DomainForm } from "@/components/analyze/domain-form";
import { Card, CardContent } from "@/components/ui/card";

export default function AnalyzePage() {
  return (
    <main className="flex-1 p-6 analyze-page-content flex flex-col items-center justify-center min-h-screen">
      {/* Simplified background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none flex flex-col items-center justify-center min-h-screen">
        <div className="fixed top-[15%] left-[5%] w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-[10rem]"></div>
      </div>
      
      <div className="container mx-auto">
        <div className="flex flex-col space-y-10 max-w-3xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Analyze Domain</h1>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Check a domain for suspicious activity and security risks
            </p>
          </div>

          <Card className="border overflow-hidden">
            <CardContent className="p-6 relative z-10">
              <DomainForm />
            </CardContent>
          </Card>

          <div className="space-y-8 mt-6">
            <h2 className="text-xl font-semibold text-center">How It Works</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border">
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-center mb-6">
                      <div className="rounded-full w-10 h-10 flex items-center justify-center border border-border">
                        <span className="text-lg font-medium">1</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium mb-3">Enter Domain</h3>
                      <p className="text-sm text-muted-foreground">
                        Input any domain name you want to analyze for potential security threats.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border">
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-center mb-6">
                      <div className="rounded-full w-10 h-10 flex items-center justify-center border border-border">
                        <span className="text-lg font-medium">2</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium mb-3">Analyze</h3>
                      <p className="text-sm text-muted-foreground">
                        Our system will scan the domain, checking for suspicious patterns and security risks.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border">
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-center mb-6">
                      <div className="rounded-full w-10 h-10 flex items-center justify-center border border-border">
                        <span className="text-lg font-medium">3</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium mb-3">Get Results</h3>
                      <p className="text-sm text-muted-foreground">
                        Review detailed analysis including threat score, security recommendations, and domain intelligence.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}