import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("ashishverma.ecl@gmail.com");
  const [password, setPassword] = useState("Accenture25!@");
  const { toast } = useToast();
  const navigate = useNavigate();


  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting sign in to:", "https://puoipjmzfxyrhhyvjqcj.supabase.co");
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
      toast({
        title: "Authentication failed",
        description: error.message || "Network error - please try again",
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
                <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>
                  Skip to Dashboard
                </Button>
              </form>
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