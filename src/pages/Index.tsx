import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Brain, FileCheck, Shield, Settings, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <img src="/lovable-uploads/6138e639-0cf1-4201-9a1a-074d552e6c9f.png" alt="Company Logo" className="h-8" />
          <Link to="/auth">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Reputational Risk Assessment Solution
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Reputational Risk Assessment Solution is a GenAI-powered browser-based tool that automates and streamlines the Environmental and Social Due Diligence (ESDD) process for banks engaged in corporate lending. It scans global data sources to identify reputational and ESG risks, generates consistent due diligence reports, and supports compliance with international standards—enabling faster, smarter, and more sustainable lending decisions.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-6">
              Sign In
            </Button>
          </Link>
        </div>
      </main>

      {/* Key Benefits */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-8">Key Benefits</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <CardContent className="text-center p-0">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">AI-Powered Risk Discovery</h3>
                  <p className="text-muted-foreground">Leverage advanced AI to automatically identify and assess reputational and ESG risks across global data sources.</p>
                </CardContent>
              </Card>
              <Card className="p-6">
                <CardContent className="text-center p-0">
                  <FileCheck className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Automated, Auditable Reports</h3>
                  <p className="text-muted-foreground">Generate consistent, comprehensive due diligence reports with full audit trails for regulatory compliance.</p>
                </CardContent>
              </Card>
              <Card className="p-6">
                <CardContent className="text-center p-0">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Regulatory Compliance</h3>
                  <p className="text-muted-foreground">Ensure adherence to international standards and regulatory requirements with built-in compliance frameworks.</p>
                </CardContent>
              </Card>
              <Card className="p-6">
                <CardContent className="text-center p-0">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Customizable Assessments</h3>
                  <p className="text-muted-foreground">Tailor risk assessment criteria and reporting formats to meet your organization's specific requirements.</p>
                </CardContent>
              </Card>
              <Card className="p-6">
                <CardContent className="text-center p-0">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Seamless Integration</h3>
                  <p className="text-muted-foreground">Integrate effortlessly with existing banking systems and workflows for maximum operational efficiency.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 mt-auto">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>Copyright © 2025 Accenture. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
