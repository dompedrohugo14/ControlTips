import React from 'react';
import { Check, Loader as Loader2 } from 'lucide-react';
import { StripeProduct } from '../stripe-config';
import { useStripe } from '../hooks/useStripe';

interface SubscriptionCardProps {
  product: StripeProduct;
  isCurrentPlan?: boolean;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ 
  product, 
  isCurrentPlan = false 
}) => {
  const { createCheckoutSession, loading } = useStripe();

  const handleSubscribe = async () => {
    try {
      await createCheckoutSession(product.priceId);
    } catch (error) {
      console.error('Error starting checkout:', error);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-2 ${
      isCurrentPlan ? 'border-green-500' : 'border-gray-200'
    }`}>
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <div className="mb-4">
          <span className="text-3xl font-bold text-gray-900">
            {product.currencySymbol}{product.price.toFixed(2)}
          </span>
          <span className="text-gray-600 ml-1">/mês</span>
        </div>
        <p className="text-gray-600 mb-6">{product.description}</p>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm text-gray-700">Gestão completa de apostas</span>
          </div>
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm text-gray-700">Controle de banca avançado</span>
          </div>
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm text-gray-700">Relatórios detalhados</span>
          </div>
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm text-gray-700">Notificações inteligentes</span>
          </div>
        </div>

        {isCurrentPlan ? (
          <button
            disabled
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-medium cursor-not-allowed"
          >
            Plano Atual
          </button>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              'Assinar Agora'
            )}
          </button>
        )}
      </div>
    </div>
  );
};