import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const SUPABASE_URL = "https://puoipjmzfxyrhhyvjqcj.supabase.co";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [email, setEmail] = useState("ashishverma.ecl@gmail.com");
  const [password, setPassword] = useState("Accenture25!@");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDebugInfo(null);

    // Step 1: Pre-check connectivity to Supabase
    try {
      const healthCheck = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
        method: "GET",
        headers: { "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b2lwam16Znh5cmhoeXZqcWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMDMxMTgsImV4cCI6MjA2ODY3OTExOH0.xWR3FlIMSpZa84nGywsj8K7L3MZTe9eZtZSC42ObZ1g" },
      });
      console.log("Health check status:", healthCheck.status);
    } catch (healthErr: any) {
      console.error("Health check failed:", healthErr);
      setDebugInfo(`Cannot reach Supabase at all. This is a network/CORS issue in this browser context. Try opening the app directly at: ${window.location.origin}/auth in a new browser tab (not inside the Lovable editor iframe).`);
      toast({
        title: "Cannot reach Supabase",
        description: "Network request blocked. Open the preview URL in a separate browser tab instead of the embedded preview.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Step 2: Attempt sign-in
    try {
      console.log("Attempting sign in...");
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Sign in result:", { data, error: signInError });

      if (signInError) throw signInError;

      toast({
        title: "Welcome!",
        description: "You have successfully signed in.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Auth error:", error);

      let description = error?.message || "Unknown error";
      if (error?.message === "Failed to fetch" || error?.status === 0) {
        description = "The sign-in request was blocked. Please open this URL in a new browser tab (not inside the Lovable editor): " + window.location.origin + "/auth";
      } else if (error?.message === "Invalid login credentials") {
        description = "Wrong email or password. Please check your credentials.";
      }

      setDebugInfo(`Error: ${error?.message} | Status: ${error?.status} | Origin: ${window.location.origin}`);

      toast({
        title: "Authentication failed",
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/61690229-7cfd-4603-b3d7-cf1f5b7ccd95.png" 
              alt="Logo" 
              className="h-10 w-auto"
            />
            <div>
              <p className="text-lg font-bold text-foreground">Reputational Risk Assessment Solution</p>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Form */}
      <div className="flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              {debugInfo && (
                <div className="mt-4 p-3 rounded-md bg-muted text-xs text-muted-foreground break-all">
                  <p className="font-semibold mb-1">Debug Info:</p>
                  <p>{debugInfo}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>Copyright © 2025 Accenture. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Auth;