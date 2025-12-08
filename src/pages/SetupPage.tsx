import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createDemoUsers } from "@/lib/auth";
import { Shield, Users, CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface SetupResult {
  email: string;
  success: boolean;
  error?: string;
}

export function SetupPage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [results, setResults] = useState<SetupResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const handleCreateUsers = async () => {
    setIsCreating(true);
    setResults([]);
    
    try {
      const createResults = await createDemoUsers();
      setResults(createResults);
      setIsComplete(true);
    } catch (err) {
      console.error('Error creating users:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const demoUsers = [
    { email: 'admin@resq-unified.lk', password: 'Admin@123!', role: 'SUPER_ADMIN', description: 'Full system access' },
    { email: 'coordinator@resq-unified.lk', password: 'Coord@123!', role: 'COORDINATOR', description: 'Relief coordination' },
    { email: 'casemanager@resq-unified.lk', password: 'Case@123!', role: 'CASE_MANAGER', description: 'Case management' },
    { email: 'volunteer@resq-unified.lk', password: 'Vol@123!', role: 'VOLUNTEER', description: 'Field operations' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cyan-600/20 via-background to-purple-600/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold mb-2">
            <Shield className="h-8 w-8 text-cyan-400" />
            ResQ-Unified Setup
          </div>
          <p className="text-sm text-muted-foreground">
            Create demo admin accounts for testing
          </p>
        </div>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              Demo User Accounts
            </CardTitle>
            <CardDescription>
              Click the button below to create demo accounts with different roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User List */}
            <div className="space-y-3">
              {demoUsers.map((user, index) => {
                const result = results.find(r => r.email === user.email);
                return (
                  <motion.div
                    key={user.email}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.email}</span>
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Password: <code className="bg-white/10 px-1 rounded">{user.password}</code>
                        </p>
                        <p className="text-xs text-muted-foreground">{user.description}</p>
                      </div>
                      {result && (
                        <div>
                          {result.success ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-400" />
                              {result.error && (
                                <span className="text-xs text-green-400">Ready</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <XCircle className="h-5 w-5 text-red-400" />
                              <span className="text-xs text-red-400 max-w-[100px] truncate">
                                {result.error}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {!isComplete ? (
                <Button
                  onClick={handleCreateUsers}
                  disabled={isCreating}
                  className="w-full bg-cyan-600 hover:bg-cyan-500"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Accounts...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Create Demo Accounts
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                    <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-medium">Setup Complete!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You can now sign in with any of the demo accounts above
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate('/auth/signin')}
                    className="w-full bg-cyan-600 hover:bg-cyan-500"
                  >
                    Go to Sign In
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              )}
              
              <Button
                variant="outline"
                onClick={() => navigate('/auth/signin')}
                className="w-full border-white/20"
              >
                Skip Setup
              </Button>
            </div>

            {/* Info */}
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <p className="text-sm text-cyan-400 mb-2">💡 Role Permissions</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li><strong>SUPER_ADMIN:</strong> Full access to all features</li>
                <li><strong>COORDINATOR:</strong> Broadcasts, resources, case overview</li>
                <li><strong>CASE_MANAGER:</strong> Case management, beneficiary registration</li>
                <li><strong>VOLUNTEER:</strong> Assigned cases, status updates</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
