import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authApi, ValidationError } from '@/lib/api';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { Home as HomeIcon, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const verifySchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type SignupFormValues = z.infer<typeof signupSchema>;
type VerifyFormValues = z.infer<typeof verifySchema>;

const Signup = () => {
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [tempId, setTempId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const verifyForm = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
  });

  const handleInitiateSignup = async (data: SignupFormValues) => {
    setLoading(true);

    try {
      const response = await authApi.initiateSignup(data.email, data.password, data.name);
      setTempId(response.tempId);
      setStep('verify');
      toast({
        title: 'Verification code sent',
        description: 'Please check your email for the verification code.',
      });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          signupForm.setError(field as keyof SignupFormValues, { message });
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to send verification code',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignup = async (data: VerifyFormValues) => {
    setLoading(true);

    try {
      const response = await authApi.verifySignup(tempId, data.otp);
      login(response.accessToken, response.refreshToken, response.user as any);
      toast({
        title: 'Success',
        description: 'Account created successfully!',
      });
      navigate(redirectPath);
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
      await authApi.resendVerification(tempId);
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
      const response = await authApi.googleSignup(credentialResponse.credential);
      login(response.accessToken, response.refreshToken, response.user as any);
      toast({
        title: 'Success',
        description: 'Signed up with Google successfully!',
      });
      navigate(redirectPath);
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
            Roomiecircle
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-muted-foreground text-center mb-6">
            {step === 'email' ? 'Start your journey to find the perfect room' : 'Enter the verification code sent to your email'}
          </p>

          {step === 'email' ? (
            <>
              <form onSubmit={signupForm.handleSubmit(handleInitiateSignup)} className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    {...signupForm.register('name')}
                    className={signupForm.formState.errors.name ? 'border-destructive' : ''}
                  />
                  {signupForm.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...signupForm.register('email')}
                    className={signupForm.formState.errors.email ? 'border-destructive' : ''}
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...signupForm.register('password')}
                    className={signupForm.formState.errors.password ? 'border-destructive' : ''}
                  />
                  {signupForm.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.password.message}</p>
                  )}
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

              <div className="flex justify-center">
                <GoogleLogin
                  text="signup_with"
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    toast({
                      title: 'Error',
                      description: 'Failed to sign up with Google',
                      variant: 'destructive',
                    });
                  }}
                />
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{' '}
                <button
                  onClick={() => navigate(`/auth/login${redirectPath !== '/' ? `?redirect=${redirectPath}` : ''}`)}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </>
          ) : (
            <form onSubmit={verifyForm.handleSubmit(handleVerifySignup)} className="space-y-4">
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  {...verifyForm.register('otp')}
                  className={verifyForm.formState.errors.otp ? 'border-destructive' : ''}
                />
                {verifyForm.formState.errors.otp && (
                  <p className="text-sm text-destructive mt-1">{verifyForm.formState.errors.otp.message}</p>
                )}
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
