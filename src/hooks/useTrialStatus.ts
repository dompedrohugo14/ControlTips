import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface TrialStatus {
  isTrialActive: boolean;
  isSubscriptionActive: boolean;
  hasAccess: boolean;
  isAdmin: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  trialEndsAt: Date | null;
}

export function useTrialStatus() {
  const [status, setStatus] = useState<TrialStatus>({
    isTrialActive: false,
    isSubscriptionActive: false,
    hasAccess: false,
    isAdmin: false,
    daysRemaining: 0,
    hoursRemaining: 0,
    minutesRemaining: 0,
    trialEndsAt: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTrialStatus();
  }, []);

  const checkTrialStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('trial_ends_at, is_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        setLoading(false);
        return;
      }

      const { data: customer } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user.id)
        .maybeSingle();

      let isSubscriptionActive = false;

      if (customer) {
        const { data: subscription } = await supabase
          .from('stripe_subscriptions')
          .select('status')
          .eq('customer_id', customer.customer_id)
          .maybeSingle();

        isSubscriptionActive = subscription?.status === 'active';
      }

      const trialEndsAt = new Date(profile.trial_ends_at);
      const now = new Date();
      const isTrialActive = trialEndsAt > now;
      const timeRemaining = Math.max(0, trialEndsAt.getTime() - now.getTime());

      const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

      const hasAccess = profile.is_admin || isSubscriptionActive || isTrialActive;

      setStatus({
        isTrialActive,
        isSubscriptionActive,
        hasAccess,
        isAdmin: profile.is_admin || false,
        daysRemaining,
        hoursRemaining,
        minutesRemaining,
        trialEndsAt,
      });
    } catch (error) {
      console.error('Error checking trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  return { ...status, loading, refresh: checkTrialStatus };
}
