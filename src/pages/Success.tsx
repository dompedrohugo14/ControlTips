import React, { useEffect } from 'react';
import { CircleCheck as CheckCircle, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

export const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { refetch } = useSubscription();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refetch subscription data after successful payment
    const timer = setTimeout(() => {
      refetch();
    }, 2000);

    return () => clearTimeout(timer);
  }, [refetch]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pagamento Realizado com Sucesso!
          </h1>
          <p className="text-gray-600">
            Sua assinatura foi ativada e você já pode aproveitar todos os recursos premium do Control Tips.
          </p>
        </div>

        {sessionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              ID da Sessão: <span className="font-mono text-xs">{sessionId}</span>
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            Ir para Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          
          <Link
            to="/subscription"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Ver Detalhes da Assinatura
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">O que você pode fazer agora:</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>✓ Registrar apostas ilimitadas</li>
            <li>✓ Acessar relatórios detalhados</li>
            <li>✓ Configurar alertas personalizados</li>
            <li>✓ Gerenciar sua banca profissionalmente</li>
          </ul>
        </div>
      </div>
    </div>
  );
};