import { useState, useEffect } from 'react';
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

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const otpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const verifyOtpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

const Login = () => {
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [step, setStep] = useState<'credentials' | 'verify'>('credentials');
  const [tempId, setTempId] = useState('');
  const [loading, setLoading] = useState(false);
  const [highlightSignup, setHighlightSignup] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  });

  const verifyOtpForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
  });

  // Check for token expiration message on mount
  useEffect(() => {
    const tokenExpiredMessage = sessionStorage.getItem("tokenExpiredMessage");
    if (tokenExpiredMessage) {
      toast({
        title: "Session Expired",
        description: tokenExpiredMessage,
        variant: "destructive",
      });
      // Clear the message from sessionStorage
      sessionStorage.removeItem("tokenExpiredMessage");
    }
  }, [toast]);

  const handlePasswordLogin = async (data: LoginFormValues) => {
    setLoading(true);
    setHighlightSignup(false);

    try {
      const response = await authApi.login(data.email, data.password);
      login(response.accessToken, response.refreshToken, response.user as any);
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });
      navigate(redirectPath);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          loginForm.setError(field as keyof LoginFormValues, { message });
        });
      } else {
        const errorMessage = error.message || 'Failed to login';
        const shouldHighlight = errorMessage.toLowerCase().includes('sign up') ||
          errorMessage.toLowerCase().includes('signup') ||
          errorMessage.toLowerCase().includes('register');

        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
          duration: 2000,
        });

        if (shouldHighlight) {
          setTimeout(() => {
            setHighlightSignup(true);
            setTimeout(() => setHighlightSignup(false), 3000);
          }, 2000);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateOtpLogin = async (data: OtpFormValues) => {
    setLoading(true);
    setHighlightSignup(false);

    try {
      const response = await authApi.initiateOtpLogin(data.email);
      setTempId(response.tempId);
      setStep('verify');
      toast({
        title: 'OTP sent',
        description: 'Please check your email for the verification code.',
      });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          otpForm.setError(field as keyof OtpFormValues, { message });
        });
      } else {
        const errorMessage = error.message || 'Failed to send OTP';
        const shouldHighlight = errorMessage.toLowerCase().includes('sign up') ||
          errorMessage.toLowerCase().includes('signup') ||
          errorMessage.toLowerCase().includes('register');

        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
          duration: 2000,
        });

        if (shouldHighlight) {
          setTimeout(() => {
            setHighlightSignup(true);
            setTimeout(() => setHighlightSignup(false), 3000);
          }, 2000);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (data: VerifyOtpFormValues) => {
    setLoading(true);

    try {
      const response = await authApi.verifyOtpLogin(tempId, data.otp);
      login(response.accessToken, response.refreshToken, response.user as any);
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });
      navigate(redirectPath);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify OTP',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setHighlightSignup(false);
    try {
      const response = await authApi.googleLogin(credentialResponse.credential);
      login(response.accessToken, response.refreshToken, response.user as any);
      toast({
        title: 'Success',
        description: 'Logged in with Google successfully!',
      });
      navigate(redirectPath);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to login with Google';
      const shouldHighlight = errorMessage.toLowerCase().includes('sign up') ||
        errorMessage.toLowerCase().includes('signup') ||
        errorMessage.toLowerCase().includes('register');

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
        duration: 2000,
      });

      if (shouldHighlight) {
        setTimeout(() => {
          setHighlightSignup(true);
          setTimeout(() => setHighlightSignup(false), 3000);
        }, 2000);
      }
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
          <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-muted-foreground text-center mb-6">
            {step === 'credentials' ? 'Sign in to continue your search' : 'Enter the verification code sent to your email'}
          </p>

          {step === 'credentials' ? (
            <>
              <div className="flex gap-2 mb-6">
                <Button
                  type="button"
                  variant={loginMethod === 'password' ? 'default' : 'outline'}
                  onClick={() => setLoginMethod('password')}
                  className="flex-1"
                >
                  Password
                </Button>
                <Button
                  type="button"
                  variant={loginMethod === 'otp' ? 'default' : 'outline'}
                  onClick={() => setLoginMethod('otp')}
                  className="flex-1"
                >
                  Login with OTP
                </Button>
              </div>

              {loginMethod === 'password' ? (
                <form onSubmit={loginForm.handleSubmit(handlePasswordLogin)} className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...loginForm.register('email')}
                      className={loginForm.formState.errors.email ? 'border-destructive' : ''}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...loginForm.register('password')}
                      className={loginForm.formState.errors.password ? 'border-destructive' : ''}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={otpForm.handleSubmit(handleInitiateOtpLogin)} className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="email-otp">Email</Label>
                    <Input
                      id="email-otp"
                      type="email"
                      placeholder="you@example.com"
                      {...otpForm.register('email')}
                      className={otpForm.formState.errors.email ? 'border-destructive' : ''}
                    />
                    {otpForm.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">{otpForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </form>
              )}
            </>
          ) : (
            <form onSubmit={verifyOtpForm.handleSubmit(handleVerifyOtp)} className="space-y-4 mb-6">
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  {...verifyOtpForm.register('otp')}
                  className={verifyOtpForm.formState.errors.otp ? 'border-destructive' : ''}
                />
                {verifyOtpForm.formState.errors.otp && (
                  <p className="text-sm text-destructive mt-1">{verifyOtpForm.formState.errors.otp.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('credentials')}
                disabled={loading}
              >
                Back
              </Button>
            </form>
          )}

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
              onSuccess={handleGoogleSuccess}
              onError={() => {
                toast({
                  title: 'Error',
                  description: 'Failed to login with Google',
                  variant: 'destructive',
                });
              }}
            />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => {
                setHighlightSignup(false);
                navigate(`/auth/signup${redirectPath !== '/' ? `?redirect=${redirectPath}` : ''}`);
              }}
              className={`text-primary hover:underline font-medium transition-all duration-300 ${highlightSignup
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded px-2 py-1'
                : ''
                }`}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
