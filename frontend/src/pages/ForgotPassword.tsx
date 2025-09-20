import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Factory, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Missing Email",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await authAPI.forgotPassword(email);
      setIsEmailSent(true);
      toast({
        title: "Reset Email Sent!",
        description: "Please check your email for password reset instructions.",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email. Please try again.';
      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-xl">
              <Factory className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              {isEmailSent 
                ? "Check your email for reset instructions" 
                : "Enter your email to receive password reset instructions"
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          {!isEmailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Sending Reset Email...' : 'Send Reset Email'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  A password reset link has been sent to <strong>{email}</strong>
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Please check your email and click the reset link to create a new password. 
                If you don't see the email, check your spam folder.
              </p>
              <Button 
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail('');
                }}
                variant="outline"
                className="w-full"
              >
                Send to Different Email
              </Button>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>
          
          {!isEmailSent && (
            <div className="mt-4 text-center">
              <Link 
                to="/signup" 
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                Don't have an account? Sign up
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}