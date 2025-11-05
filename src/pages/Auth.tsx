import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        console.log('Attempting signup with email:', email);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
          }
        });

        console.log('Signup response:', { data, error });

        if (error) throw error;

        if (data.user) {
          if (data.session) {
            toast({
              title: 'Account created!',
              description: 'Welcome to Firehouse Fit.',
            });
            navigate('/onboarding');
          } else {
            toast({
              title: 'Check your email',
              description: 'We sent you a confirmation link. Please check your email to verify your account.',
            });
          }
        }
      } else {
        console.log('Attempting login with email:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log('Login response:', { data, error });

        if (error) throw error;

        if (data.user) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .maybeSingle();

          console.log('Profile data:', profileData);

          if (profileData) {
            toast({
              title: 'Welcome back!',
              description: 'Redirecting to your dashboard...',
            });
            navigate('/dashboard');
          } else {
            toast({
              title: 'Welcome!',
              description: 'Let\'s set up your profile.',
            });
            navigate('/onboarding');
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred during authentication',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-md">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
              <Flame className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2 text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-red-50 mb-8 text-center">
            {isSignUp
              ? 'Start your nutrition tracking journey'
              : 'Sign in to continue tracking'}
          </p>

          <div className="w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-red-600 focus:ring-red-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-red-600 focus:ring-red-600"
                    required
                    minLength={6}
                  />
                </div>
                {isSignUp && (
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum 6 characters
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !email || !password || password.length < 6}
                className={`w-full h-12 font-semibold rounded-xl shadow-lg transition-all duration-200 ${
                  loading || !email || !password || password.length < 6
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 hover:shadow-xl transform hover:scale-[1.02]'
                } text-white`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Please wait...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : 'Need an account? Sign up'}
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="mt-6 text-white hover:text-red-50 transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};
