import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Flame, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: string;
    interval_count: number;
  } | null;
}

export default function Pricing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [prices, setPrices] = useState<StripePrice[]>([]);

  useEffect(() => {
    checkAuthAndSubscription();
  }, []);

  const checkAuthAndSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setCheckingAuth(false);
        return;
      }

      const { data: subscription } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (subscription && ['active', 'trialing'].includes(subscription.subscription_status)) {
        navigate('/dashboard');
        return;
      }

      await fetchPrices();
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const fetchPrices = async () => {
    try {
      const stripeSecret = import.meta.env.VITE_STRIPE_SECRET_KEY;
      if (!stripeSecret) {
        console.error('Stripe secret key not configured');
        return;
      }

      const response = await fetch('https://api.stripe.com/v1/prices?active=true&expand[]=data.product', {
        headers: {
          'Authorization': `Bearer ${stripeSecret}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }

      const data = await response.json();
      setPrices(data.data || []);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const handleFreeTier = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!user || userError) {
        setLoading(false);
        navigate('/auth', { state: { from: '/pricing' } });
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        toast({
          title: 'Welcome to Firehouse Fit!',
          description: 'Enjoy 3 free scans per day',
        });
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (error) {
      console.error('Error setting up free tier:', error);
      toast({
        title: 'Error',
        description: 'Failed to set up free tier. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to continue',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          mode: 'subscription',
          success_url: `${window.location.origin}/dashboard`,
          cancel_url: `${window.location.origin}/pricing`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
    } finally{
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="h-10 w-10 text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-900">Firehouse Fit</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get access to AI-powered calorie tracking and personalized nutrition insights
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="border-2 border-gray-200 relative">
            <CardHeader>
              <CardTitle className="text-2xl">Free Forever</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  $0
                </div>
                <p className="text-gray-600">No credit card required</p>
              </div>

              <Button
                onClick={handleFreeTier}
                disabled={loading}
                variant="outline"
                className="w-full border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 text-gray-900 font-semibold"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Get Started Free'
                )}
              </Button>

              <div className="mt-8 space-y-4">
                <ul className="space-y-3">
                  {[
                    '3 photo scans per day',
                    'Basic macro tracking',
                    'Daily calorie goals',
                    '7-day history',
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-500 relative shadow-lg">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg font-bold text-sm">
              MOST POPULAR
            </div>
            <CardHeader className="pt-8">
              <CardTitle className="text-2xl">Premium</CardTitle>
              <CardDescription>
                {prices.length > 0 && prices[0].recurring
                  ? `Billed ${prices[0].recurring.interval}ly`
                  : 'Full access to all features'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {prices.length > 0 ? (
                    <>
                      ${(prices[0].unit_amount / 100).toFixed(2)}
                      {prices[0].recurring && (
                        <span className="text-xl font-normal text-gray-600">
                          /{prices[0].recurring.interval}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      $4.99<span className="text-xl font-normal text-gray-600">/month</span>
                    </>
                  )}
                </div>
                <p className="text-gray-600">Cancel anytime</p>
              </div>

              <Button
                onClick={() => prices.length > 0 ? handleSubscribe(prices[0].id) : handleSubscribe('price_default')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold shadow-lg"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Upgrade to Premium'
                )}
              </Button>

              <div className="mt-8 space-y-4">
                <ul className="space-y-3">
                  {[
                    'Unlimited photo scans',
                    'Advanced macro tracking',
                    'Personalized daily goals',
                    'Unlimited meal history',
                    'Activity-based recommendations',
                    'Priority support',
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/auth')}
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
