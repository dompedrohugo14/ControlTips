import { stripeProducts } from '../stripe-config';
import { SubscriptionCard } from '../components/subscription/SubscriptionCard';
import { useSubscription } from '../hooks/useSubscription';

export function Pricing() {
  const { subscription, loading } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Escolha seu plano
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Selecione o plano que melhor se adequa às suas necessidades
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-x-8">
          {stripeProducts.map((product) => (
            <SubscriptionCard
              key={product.id}
              product={product}
              isActive={subscription?.price_id === product.priceId && subscription?.subscription_status === 'active'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}