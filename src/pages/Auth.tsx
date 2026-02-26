import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const SUPABASE_URL = "https://puoipjmzfxyrhhyvjqcj.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [email, setEmail] = useState("ashishverma.ecl@gmail.com");
  const [password, setPassword] = useState("Accenture25!@");
  const { toast } = useToast();
  const navigate = useNavigate();
  const isEmbeddedPreview = window.self !== window.top;

  const openInNewTab = () => {
    window.open(`${window.location.origin}/auth`, "_blank", "noopener,noreferrer");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDebugInfo(null);

    if (isEmbeddedPreview) {
      const message = `Sign-in is blocked in embedded preview. Open ${window.location.origin}/auth in a new tab.`;
      setDebugInfo(message);
      toast({
        title: "Open in new tab",
        description: message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Step 1: Pre-check connectivity to Supabase
    try {
      const healthCheck = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
        method: "GET",
        headers: { apikey: SUPABASE_ANON_KEY },
      });
      console.log("Health check status:", healthCheck.status);
    } catch (healthErr: any) {
      console.error("Health check failed:", healthErr);
      setDebugInfo(`Cannot reach Supabase from this browser context. Open directly in a new tab: ${window.location.origin}/auth`);
      toast({
        title: "Cannot reach Supabase",
        description: "Network request blocked. Open the preview URL in a separate browser tab.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Step 2: Attempt sign-in
    try {
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
        description = `The sign-in request was blocked. Open ${window.location.origin}/auth in a new browser tab.`;
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
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              {isEmbeddedPreview && (
                <div className="mb-4 rounded-md border border-border bg-muted p-3 text-sm text-muted-foreground">
                  Sign-in is blocked inside the embedded preview. Open this page in a new tab to continue.
                </div>
              )}

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

                {isEmbeddedPreview ? (
                  <Button type="button" className="w-full" onClick={openInNewTab}>
                    Open Auth in New Tab
                  </Button>
                ) : (
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                )}
              </form>

              {debugInfo && (
                <div className="mt-4 break-all rounded-md bg-muted p-3 text-xs text-muted-foreground">
                  <p className="mb-1 font-semibold">Debug Info:</p>
                  <p>{debugInfo}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>Copyright © 2025 Accenture. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Auth;