import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

import { useAuth } from '@/contexts/AuthContext';
import { Home as HomeIcon, ArrowLeft } from 'lucide-react';

const Signup = () => {
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [tempId, setTempId] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInitiateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.initiateSignup(email, password, name);
      setTempId(response.tempId);
      setStep('verify');
      toast({
        title: 'Verification code sent',
        description: 'Please check your email for the verification code.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send verification code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.verifySignup(tempId, otp);
      login(response.accessToken, response.refreshToken, response.user);
      toast({
        title: 'Success',
        description: 'Account created successfully!',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await apiClient.resendVerification(tempId);
      toast({
        title: 'Code resent',
        description: 'A new verification code has been sent to your email.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const response = await apiClient.googleSignup(credentialResponse.credential);
      login(response.accessToken, response.refreshToken, response.user);
      toast({
        title: 'Success',
        description: 'Signed up with Google successfully!',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign up with Google',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 px-4 py-8">
      <div className="container mx-auto max-w-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-8 hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div 
          className="flex items-center justify-center gap-2 mb-8 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
            <HomeIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            RoomieCircle
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-muted-foreground text-center mb-6">
            {step === 'email' ? 'Start your journey to find the perfect room' : 'Enter the verification code sent to your email'}
          </p>

          {step === 'email' ? (
            <>
              <form onSubmit={handleInitiateSignup} className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Continue'}
                </Button>
              </form>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Google signup temporarily disabled */}
              <div className="flex justify-center">
                <Button variant="outline" disabled>
                  Google signup unavailable
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/auth/login')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </>
          ) : (
            <form onSubmit={handleVerifySignup} className="space-y-4">
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleResendCode}
                disabled={loading}
              >
                Resend Code
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
