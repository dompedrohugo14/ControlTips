import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuthAndAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      if (session) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('trial_ends_at, is_admin')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!profile) {
            setHasAccess(true);
            return;
          }

          if (profile.is_admin) {
            setHasAccess(true);
            return;
          }

          const { data: customer } = await supabase
            .from('stripe_customers')
            .select('customer_id')
            .eq('user_id', session.user.id)
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

          if (isSubscriptionActive) {
            setHasAccess(true);
            return;
          }

          const trialEndsAt = new Date(profile.trial_ends_at);
          const now = new Date();
          const isTrialActive = trialEndsAt > now;

          setHasAccess(isTrialActive);
        } catch (error) {
          console.error('Error checking access:', error);
          setHasAccess(true);
        }
      }
    };

    checkAuthAndAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setIsAuthenticated(!!session);
        if (session) {
          await checkAuthAndAccess();
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null || hasAccess === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-500 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAccess && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}
