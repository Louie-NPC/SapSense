import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Password recovery state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome to SapSense Monitor!",
        });
        navigate('/');
      } else {
        setError('Invalid email or password. Make sure the backend server is running.');
      }
    } catch (error) {
      setError('An error occurred during login. Make sure the backend server is running.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    
    setIsRecoveryLoading(true);
    
    // Simulate password recovery email (in real app, call API)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsRecoveryLoading(false);
    setRecoverySuccess(true);
    
    toast({
      title: "Recovery Email Sent",
      description: "Check your inbox for password reset instructions.",
    });
  };

  const closeForgotPasswordDialog = () => {
    setShowForgotPassword(false);
    setRecoveryEmail('');
    setRecoverySuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-800 dark:text-green-400">🥥 SapSense Monitor</CardTitle>
          <CardDescription className="text-green-600 dark:text-green-500">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="dark:text-gray-200">Password</Label>
                <Button 
                  type="button" 
                  variant="link" 
                  className="px-0 h-auto text-sm text-green-600 dark:text-green-400 hover:text-green-700"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-green-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="font-medium text-green-800 dark:text-green-400 mb-2">Database Demo Accounts:</h3>
            <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <div><strong>Admin:</strong> admin@sapsense.com / admin123</div>
              <div><strong>Farmer 1:</strong> juan@sapsense.com / farmer123</div>
              <div><strong>Farmer 2:</strong> maria@sapsense.com / farmer123</div>
              <div><strong>Farmer 3:</strong> pedro@sapsense.com / farmer123</div>
            </div>
            <p className="text-xs text-green-600 dark:text-green-500 mt-2">Note: Backend server must be running (npm run dev in server folder)</p>
          </div>
        </CardContent>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={closeForgotPasswordDialog}>
        <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-white">
              <Mail className="h-5 w-5 text-green-600" />
              Reset Password
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {recoverySuccess 
                ? "We've sent you an email with instructions to reset your password."
                : "Enter your email address and we'll send you a link to reset your password."
              }
            </DialogDescription>
          </DialogHeader>
          
          {!recoverySuccess ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-email" className="dark:text-gray-200">Email Address</Label>
                <Input
                  id="recovery-email"
                  type="email"
                  placeholder="Enter your email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  required
                  disabled={isRecoveryLoading}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeForgotPasswordDialog}
                  className="dark:border-gray-600 dark:text-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isRecoveryLoading || !recoveryEmail}
                >
                  {isRecoveryLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : 'Send Reset Link'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <Mail className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-green-700 dark:text-green-400">
                  Check your inbox at <strong>{recoveryEmail}</strong>
                </p>
              </div>
              <DialogFooter>
                <Button 
                  onClick={closeForgotPasswordDialog}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
