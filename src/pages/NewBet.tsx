import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, TrendingUp, Home } from 'lucide-react';

export default function NewBet() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    event: '',
    category: '',
    bet_date: new Date().toISOString().split('T')[0],
    odd: '',
    bet_type: '',
    stake: '',
    bookmaker: '',
    result: 'pending'
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
    }
  };

  const categories = [
    'Futebol',
    'Basquete',
    'Futebol Americano',
    'Tênis',
    'eSports'
  ];

  const betTypes = [
    'Simples',
    'Múltipla',
    'Handicap',
    'Over/Under',
    'Resultado',
    'Cantos'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login');
        return;
      }

      if (!formData.event.trim()) {
        setError('O campo Evento / Jogo é obrigatório');
        setLoading(false);
        return;
      }

      if (!formData.category) {
        setError('O campo Categoria é obrigatório');
        setLoading(false);
        return;
      }

      if (!formData.bet_date) {
        setError('O campo Data é obrigatório');
        setLoading(false);
        return;
      }

      if (!formData.bet_type) {
        setError('O campo Tipo de Aposta é obrigatório');
        setLoading(false);
        return;
      }

      const odd = parseFloat(formData.odd);
      const stake = parseFloat(formData.stake);

      if (!formData.odd || isNaN(odd) || odd <= 0) {
        setError('A odd deve ser um número positivo');
        setLoading(false);
        return;
      }

      if (!formData.stake || isNaN(stake) || stake <= 0) {
        setError('O valor apostado deve ser um número positivo');
        setLoading(false);
        return;
      }

      let profit = 0;
      if (formData.result === 'win') {
        profit = (stake * odd) - stake;
      } else if (formData.result === 'loss') {
        profit = -stake;
      }

      const { error: insertError } = await supabase
        .from('bets')
        .insert([{
          user_id: session.user.id,
          event: formData.event,
          category: formData.category,
          bet_date: formData.bet_date,
          odd: odd,
          bet_type: formData.bet_type,
          stake: stake,
          bookmaker: formData.bookmaker,
          result: formData.result,
          profit: profit
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Error creating bet:', err);
      setError(err instanceof Error ? err.message : 'Erro ao registrar aposta');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar ao Dashboard</span>
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Nova Aposta</h1>
                <p className="text-neutral-400 text-sm">Registre uma nova aposta no sistema</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-500 text-sm">Aposta registrada com sucesso! Redirecionando...</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Evento / Jogo
                </label>
                <input
                  type="text"
                  name="event"
                  value={formData.event}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Flamengo vs Palmeiras"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2 flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>Casa de Aposta</span>
                </label>
                <input
                  type="text"
                  name="bookmaker"
                  value={formData.bookmaker}
                  onChange={handleChange}
                  placeholder="Ex: Bet365, Betano, etc."
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Categoria
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    name="bet_date"
                    value={formData.bet_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Odd
                  </label>
                  <input
                    type="number"
                    name="odd"
                    value={formData.odd}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="1.01"
                    placeholder="Ex: 2.50"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Mercados
                  </label>
                  <select
                    name="bet_type"
                    value={formData.bet_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Selecione o tipo</option>
                    {betTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Valor Apostado (R$)
                  </label>
                  <input
                    type="number"
                    name="stake"
                    value={formData.stake}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0.01"
                    placeholder="Ex: 100.00"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Resultado Final
                  </label>
                  <select
                    name="result"
                    value={formData.result}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="pending">Pendente</option>
                    <option value="win">Green</option>
                    <option value="loss">Red</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Registrando...' : 'Registrar Aposta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
