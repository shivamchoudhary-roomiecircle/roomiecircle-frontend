import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { Home as HomeIcon } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.login(email, password);
      login(response.accessToken, response.refreshToken, response.user);
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to login',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const response = await apiClient.googleLogin(credentialResponse.credential);
      login(response.accessToken, response.refreshToken, response.user);
      toast({
        title: 'Success',
        description: 'Logged in with Google successfully!',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to login with Google',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 px-4">
      <div className="w-full max-w-md">
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
          <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-muted-foreground text-center mb-6">
            Sign in to continue your search
          </p>

          <form onSubmit={handleLogin} className="space-y-4 mb-6">
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
              {loading ? 'Signing in...' : 'Sign In'}
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
              onClick={() => navigate('/auth/signup')}
              className="text-primary hover:underline font-medium"
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
