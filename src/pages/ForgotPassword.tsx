import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar link de recuperação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-neutral-900 rounded-2xl border border-yellow-500/30">
              <TrendingUp className="w-12 h-12 text-yellow-500" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-yellow-500 mb-2">Control Tips</h1>
          <p className="text-neutral-400 text-lg">Recupere sua senha</p>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-8">
          {success ? (
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-500 text-sm font-medium mb-1">Link enviado com sucesso!</p>
                  <p className="text-neutral-400 text-sm">
                    Verifique seu e-mail e siga as instruções para redefinir sua senha.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors shadow-lg shadow-yellow-500/20"
              >
                Voltar para login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <div className="text-center mb-6">
                <p className="text-neutral-400 text-sm">
                  Digite seu e-mail e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-yellow-500 transition-colors"
                    placeholder="seu@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-neutral-400 hover:text-yellow-500 text-sm transition-colors font-medium"
                >
                  Voltar para login
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-neutral-500 text-xs mt-8">
          Lembre-se de verificar sua caixa de spam caso não encontre o e-mail.
        </p>
      </div>
    </div>
  );
}
