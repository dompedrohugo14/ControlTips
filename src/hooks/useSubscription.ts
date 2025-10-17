import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { stripeProducts } from '../stripe-config';

interface Subscription {
  customer_id: string;
  subscription_id: string;
  subscription_status: string;
  price_id: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  payment_method_brand: string;
  payment_method_last4: string;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionPlan = () => {
    if (!subscription || !subscription.price_id) {
      return null;
    }

    const product = stripeProducts.find(p => p.priceId === subscription.price_id);
    return product ? product.name : 'Unknown Plan';
  };

  const getActiveProduct = () => {
    if (!subscription || !subscription.price_id) {
      return null;
    }

    return stripeProducts.find(p => p.priceId === subscription.price_id) || null;
  };

  const isActive = () => {
    return subscription?.subscription_status === 'active';
  };

  const isTrialing = () => {
    return subscription?.subscription_status === 'trialing';
  };

  return {
    subscription,
    loading,
    getSubscriptionPlan,
    getActiveProduct,
    isActive,
    isTrialing,
    refetch: fetchSubscription,
  };
};