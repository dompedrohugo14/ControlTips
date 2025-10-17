import React from 'react';
import { Crown } from 'lucide-react';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { stripeProducts } from '../stripe-config';
import { useSubscription } from '../hooks/useSubscription';

export const Subscription: React.FC = () => {
  const { subscription, getSubscriptionPlan, loading } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentPlan = getSubscriptionPlan();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-yellow-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Planos de Assinatura</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para elevar sua gestão de apostas ao próximo nível
          </p>
        </div>

        {currentPlan && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <Crown className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                Plano Atual: {currentPlan}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stripeProducts.map((product) => (
            <SubscriptionCard
              key={product.id}
              product={product}
              isCurrentPlan={subscription?.price_id === product.priceId}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Por que escolher o Control Tips?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Gestão Profissional</h3>
              <p className="text-gray-600 text-sm">
                Organize suas apostas como um profissional com ferramentas avançadas
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Controle Total</h3>
              <p className="text-gray-600 text-sm">
                Tenha controle total sobre sua banca e resultados
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Dados Reais</h3>
              <p className="text-gray-600 text-sm">
                Tome decisões baseadas em dados reais e estatísticas precisas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};