import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp, signInDemo } from "@/lib/auth";
import { Shield, Mail, Lock, User, Loader2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface AuthPageProps {
  mode: 'signin' | 'signup';
}

export function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        await signUp(formData.email, formData.password, formData.fullName);
        navigate("/auth/signin?registered=true");
      } else {
        // Use signInDemo for demo accounts, regular signIn for others
        const demoEmails = ['admin@resq-unified.lk', 'coordinator@resq-unified.lk', 'casemanager@resq-unified.lk', 'volunteer@resq-unified.lk'];
        if (demoEmails.includes(formData.email)) {
          await signInDemo(formData.email, formData.password);
        } else {
          await signIn(formData.email, formData.password);
        }
        // Wait a moment for auth state to propagate then do a full page reload
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.href = "/";
        return;
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Hardcoded demo credentials
  const demoCredentials: Record<string, { email: string; password: string; role: string }> = {
    admin: { email: 'admin@resq-unified.lk', password: 'Admin@123!', role: 'SUPER_ADMIN' },
    coordinator: { email: 'coordinator@resq-unified.lk', password: 'Coord@123!', role: 'COORDINATOR' },
    casemanager: { email: 'casemanager@resq-unified.lk', password: 'Case@123!', role: 'CASE_MANAGER' },
    volunteer: { email: 'volunteer@resq-unified.lk', password: 'Vol@123!', role: 'VOLUNTEER' },
  };

  const handleDemoLogin = async (demoType: string) => {
    const creds = demoCredentials[demoType];
    if (!creds) return;
    
    setError("");
    setIsLoading(true);
    setFormData({ ...formData, email: creds.email, password: creds.password });
    
    try {
      await signInDemo(creds.email, creds.password);
      // Wait a moment for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Demo login failed. Please create demo accounts first at /setup");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cyan-600/20 via-background to-purple-600/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/landing" className="inline-flex items-center gap-2 text-2xl font-bold">
            <Shield className="h-8 w-8 text-cyan-400" />
            ResQ-Unified
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            Disaster Response Platform
          </p>
        </div>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</CardTitle>
            <CardDescription>
              {mode === 'signin' 
                ? 'Sign in to access your dashboard' 
                : 'Join the disaster response network'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-white/5 border-white/10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 bg-white/5 border-white/10"
                    required
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10"
                      required
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  mode === 'signin' ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {mode === 'signin' ? (
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/auth/signup" className="text-cyan-400 hover:underline">
                    Sign up
                  </Link>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/auth/signin" className="text-cyan-400 hover:underline">
                    Sign in
                  </Link>
                </p>
              )}
            </div>

            {mode === 'signin' && (
              <div className="mt-4 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <p className="text-sm text-cyan-400 mb-3">🔑 Quick Demo Login</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs border-red-500/30 hover:bg-red-500/10"
                    onClick={() => handleDemoLogin('admin')}
                    disabled={isLoading}
                  >
                    Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs border-purple-500/30 hover:bg-purple-500/10"
                    onClick={() => handleDemoLogin('coordinator')}
                    disabled={isLoading}
                  >
                    Coordinator
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs border-blue-500/30 hover:bg-blue-500/10"
                    onClick={() => handleDemoLogin('casemanager')}
                    disabled={isLoading}
                  >
                    Case Manager
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs border-green-500/30 hover:bg-green-500/10"
                    onClick={() => handleDemoLogin('volunteer')}
                    disabled={isLoading}
                  >
                    Volunteer
                  </Button>
                </div>
                <Link to="/setup" className="text-xs text-cyan-400 hover:underline mt-3 block text-center">
                  → First time? Create demo accounts
                </Link>
              </div>
            )}

            <div className="mt-4 text-center">
              <Link to="/landing" className="text-sm text-muted-foreground hover:text-cyan-400">
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
