import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, TrendingUp, Trash2, Home } from 'lucide-react';

export default function EditBet() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    event: '',
    category: '',
    bet_date: '',
    odd: '',
    bet_type: '',
    stake: '',
    bookmaker: '',
    result: 'pending'
  });

  useEffect(() => {
    checkAuthAndFetchBet();
  }, [id]);

  const checkAuthAndFetchBet = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    if (!id) {
      navigate('/dashboard');
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('bets')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Aposta não encontrada');
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }

      setFormData({
        event: data.event,
        category: data.category,
        bet_date: data.bet_date.split('T')[0],
        odd: data.odd.toString(),
        bet_type: data.bet_type,
        stake: data.stake.toString(),
        bookmaker: data.bookmaker || '',
        result: data.result
      });
    } catch (err) {
      console.error('Error fetching bet:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar aposta');
    } finally {
      setFetching(false);
    }
  };

  const categories = [
    'Futebol',
    'Roleta',
    'Basquete',
    'Futebol Americano',
    'Tênis',
    'eSports',
    'MMA',
    'Fórmula 1',
    'Outros'
  ];

  const betTypes = [
    'Simples',
    'Múltipla',
    'Handicap',
    'Over/Under',
    'Outros'
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

      const odd = parseFloat(formData.odd);
      const stake = parseFloat(formData.stake);

      if (isNaN(odd) || odd <= 0) {
        setError('A odd deve ser um número positivo');
        setLoading(false);
        return;
      }

      if (isNaN(stake) || stake <= 0) {
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

      const { error: updateError } = await supabase
        .from('bets')
        .update({
          event: formData.event,
          category: formData.category,
          bet_date: formData.bet_date,
          odd: odd,
          bet_type: formData.bet_type,
          stake: stake,
          bookmaker: formData.bookmaker,
          result: formData.result,
          profit: profit,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Error updating bet:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar aposta');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const { error: deleteError } = await supabase
        .from('bets')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting bet:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir aposta');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center">
        <div className="text-neutral-400">Carregando...</div>
      </div>
    );
  }

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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Editar Aposta</h1>
                  <p className="text-neutral-400 text-sm">Altere os dados da aposta</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                title="Excluir aposta"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-500 text-sm">Aposta atualizada com sucesso! Redirecionando...</p>
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
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-500 transition-colors"
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
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-500 transition-colors"
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
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition-colors"
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
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition-colors"
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
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Tipo de Aposta
                  </label>
                  <select
                    name="bet_type"
                    value={formData.bet_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition-colors"
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
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-500 transition-colors"
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
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  >
                    <option value="pending">Pendente</option>
                    <option value="win">Vitória</option>
                    <option value="loss">Derrota</option>
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
                  className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Confirmar Exclusão</h3>
            <p className="text-neutral-400 mb-6">
              Tem certeza que deseja excluir esta aposta? Esta ação não pode ser desfeita.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
