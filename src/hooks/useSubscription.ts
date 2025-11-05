import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SubscriptionStatus {
  isSubscribed: boolean;
  isLoading: boolean;
  subscriptionStatus: string | null;
}

export function useSubscription(): SubscriptionStatus {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  useEffect(() => {
    checkSubscription();

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stripe_subscriptions',
        },
        () => {
          checkSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsSubscribed(false);
        setIsLoading(false);
        return;
      }

      const { data: stripeCustomer } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!stripeCustomer) {
        setIsSubscribed(true);
        setSubscriptionStatus('free');
        setIsLoading(false);
        return;
      }

      const { data: subscription, error } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('customer_id', stripeCustomer.customer_id)
        .maybeSingle();

      if (error) {
        console.error('Error checking subscription:', error);
        setIsSubscribed(true);
        setSubscriptionStatus('free');
      } else if (subscription && ['active', 'trialing'].includes(subscription.status)) {
        setIsSubscribed(true);
        setSubscriptionStatus(subscription.status);
      } else {
        setIsSubscribed(true);
        setSubscriptionStatus('free');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsSubscribed(true);
      setSubscriptionStatus('free');
    } finally {
      setIsLoading(false);
    }
  };

  return { isSubscribed, isLoading, subscriptionStatus };
}
