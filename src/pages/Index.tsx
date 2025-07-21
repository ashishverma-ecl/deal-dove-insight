import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileCheck, Globe, Settings, Zap, CheckCircle } from "lucide-react";

const Index = () => {
  const benefits = [
    {
      icon: Zap,
      title: "AI-Powered Risk Discovery",
      description: "Leverage advanced AI to automatically identify and assess reputational and ESG risks across global data sources."
    },
    {
      icon: FileCheck,
      title: "Automated, Auditable Reports",
      description: "Generate consistent, comprehensive due diligence reports with full audit trails for regulatory compliance."
    },
    {
      icon: Shield,
      title: "Regulatory Compliance",
      description: "Ensure adherence to international standards and regulatory requirements with built-in compliance frameworks."
    },
    {
      icon: Settings,
      title: "Customizable Assessments",
      description: "Tailor risk assessment criteria and reporting formats to meet your organization's specific requirements."
    },
    {
      icon: Globe,
      title: "Seamless Integration",
      description: "Integrate effortlessly with existing banking systems and workflows for maximum operational efficiency."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">ESDD Solution</h2>
          <Button variant="outline">Sign In</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Reputational Risk Assessment Solution
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            A GenAI-powered browser-based tool that automates and streamlines the Environmental and Social Due Diligence (ESDD) process for banks engaged in corporate lending.
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="text-lg px-8 py-6">
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Transform Your Due Diligence Process</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Scan global data sources to identify reputational and ESG risks, generate consistent due diligence reports, 
              and support compliance with international standards—enabling faster, smarter, and more sustainable lending decisions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader>
                <CheckCircle className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Faster Decisions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Reduce assessment time from weeks to hours with automated risk scanning</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CheckCircle className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Smarter Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">AI-powered insights reveal hidden risks across global data sources</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CheckCircle className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Sustainable Lending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Support ESG compliance and responsible banking practices</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Benefits</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive features designed to revolutionize your due diligence workflow
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <benefit.icon className="w-12 h-12 text-primary mb-4" />
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 ESDD Solution. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
