import { ClipboardList, Save, Plus, Trash2, CreditCard as Edit2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

interface CategoryStake {
  id?: string;
  category: string;
  stake_percentage: number;
}

export default function Management() {
  const [stakes, setStakes] = useState<CategoryStake[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [newStake, setNewStake] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStakes();
  }, []);

  const fetchStakes = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('category_stakes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('category', { ascending: true });

      if (error) throw error;

      setStakes(data || []);
    } catch (err) {
      console.error('Error fetching stakes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStake = async () => {
    if (!newCategory.trim() || !newStake.trim()) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const value = parseFloat(newStake);
    if (isNaN(value) || value < 0 || value > 100) {
      alert('O percentual deve estar entre 0 e 100');
      return;
    }

    if (stakes.some(s => s.category.toLowerCase() === newCategory.trim().toLowerCase())) {
      alert('Esta categoria já existe');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('category_stakes')
        .insert({
          user_id: session.user.id,
          category: newCategory.trim(),
          stake_percentage: value
        })
        .select()
        .single();

      if (error) throw error;

      setStakes([...stakes, data]);
      setNewCategory('');
      setNewStake('');
    } catch (err) {
      console.error('Error adding stake:', err);
      alert('Erro ao adicionar categoria');
    }
  };

  const handleDeleteStake = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta categoria?')) return;

    try {
      const { error } = await supabase
        .from('category_stakes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStakes(stakes.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting stake:', err);
      alert('Erro ao excluir categoria');
    }
  };

  const handleStartEdit = (stake: CategoryStake) => {
    setEditingId(stake.id!);
    setEditValue(stake.stake_percentage.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveEdit = async (id: string) => {
    const value = parseFloat(editValue);
    if (isNaN(value) || value < 0 || value > 100) {
      alert('O percentual deve estar entre 0 e 100');
      return;
    }

    try {
      setSavingId(id);

      const { error } = await supabase
        .from('category_stakes')
        .update({
          stake_percentage: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setStakes(stakes.map(stake =>
        stake.id === id ? { ...stake, stake_percentage: value } : stake
      ));

      setEditingId(null);
      setEditValue('');
    } catch (err) {
      console.error('Error saving stake:', err);
      alert('Erro ao salvar alteração');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <ClipboardList className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-white">Minha Gestão</h1>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 mb-6">
          <div className="max-w-3xl">
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              Nesta página você define os <span className="text-yellow-500 font-bold">"Stakes"</span> básicos de cada mercado/categoria de atuação com base nos dados da Control Tips.
            </p>
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              Esse Stake será o <span className="text-yellow-500 font-bold">percentual máximo da sua Banca Total</span> que você poderá registrar em uma aposta.
            </p>
            <p className="text-yellow-500 text-lg font-semibold">
              Trace seu plano e não se perca…
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 text-center">
            <p className="text-neutral-400">Carregando...</p>
          </div>
        ) : (
          <>
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 mb-6">
              <h2 className="text-xl font-bold text-white mb-6">Adicionar Nova Categoria</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nome da categoria"
                  className="px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none"
                />
                <input
                  type="number"
                  value={newStake}
                  onChange={(e) => setNewStake(e.target.value)}
                  placeholder="Percentual (0-100)"
                  min="0"
                  max="100"
                  step="0.1"
                  className="px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none"
                />
                <button
                  onClick={handleAddStake}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Adicionar</span>
                </button>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Configurações de Stakes por Categoria</h2>

              {stakes.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                  <p className="text-neutral-400">
                    Nenhuma categoria configurada. Adicione sua primeira categoria acima.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stakes.map((stake) => (
                    <div
                      key={stake.id}
                      className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-yellow-500/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{stake.category}</h3>
                        <p className="text-sm text-neutral-400">
                          Stake máximo: {stake.stake_percentage}% da banca
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {editingId === stake.id ? (
                          <>
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                min="0"
                                max="100"
                                step="0.1"
                                className="w-24 px-3 py-2 bg-neutral-800 border border-yellow-500 rounded text-white text-center focus:outline-none"
                                autoFocus
                              />
                              <span className="text-yellow-500 font-bold">%</span>
                            </div>
                            <button
                              onClick={() => handleSaveEdit(stake.id!)}
                              disabled={savingId === stake.id}
                              className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={savingId === stake.id}
                              className="p-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(stake)}
                              className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStake(stake.id!)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
