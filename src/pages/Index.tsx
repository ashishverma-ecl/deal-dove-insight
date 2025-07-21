import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
            A GenAI-powered browser-based tool that automates and streamlines the Environmental and Social Due Diligence (ESDD) process for banks engaged in corporate lending.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started
            </Button>
          </Link>
        </div>
      </main>

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
