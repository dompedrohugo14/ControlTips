import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { supabase, Bet } from '../lib/supabase';

interface BetsTableProps {
  searchTerm: string;
  categoryFilter: string;
}

export default function BetsTable({ searchTerm, categoryFilter }: BetsTableProps) {
  const navigate = useNavigate();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBets();
  }, []);

  const fetchBets = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('bets')
        .select('*')
        .order('bet_date', { ascending: false });

      if (fetchError) throw fetchError;

      setBets(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar apostas');
    } finally {
      setLoading(false);
    }
  };

  const filteredBets = bets.filter((bet) => {
    const matchesSearch = bet.event.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || bet.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (searchTerm.trim() !== '' && filteredBets.length === 1 && !loading) {
      setTimeout(() => {
        const targetBet = filteredBets[0];
        const betElement = document.getElementById(`bet-${targetBet.id}`);
        if (betElement) {
          betElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          betElement.classList.add('highlight-bet');
          setTimeout(() => {
            betElement.classList.remove('highlight-bet');
          }, 2000);
        }
      }, 100);
    }
  }, [searchTerm, filteredBets, loading]);

  if (loading) {
    return (
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl shadow-lg p-12">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
          <span className="text-neutral-400">Carregando apostas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl shadow-lg p-12">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-neutral-800">
        <h2 className="text-2xl font-bold text-yellow-500">Últimas Apostas</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-900">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Evento
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Odd
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Lucro/Perda
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {filteredBets.map((bet) => (
              <tr
                id={`bet-${bet.id}`}
                key={bet.id}
                onClick={() => navigate(`/edit-bet/${bet.id}`)}
                className="hover:bg-neutral-900/50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm text-neutral-300">
                      {new Date(bet.bet_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-neutral-200">
                    {bet.event}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-neutral-800 text-yellow-500 border border-yellow-500/30">
                    {bet.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-semibold text-yellow-500">
                    {Number(bet.odd).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <DollarSign className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold text-yellow-500">
                      {Number(bet.stake).toFixed(2)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {bet.result === 'win' ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-bold rounded-full bg-green-500/20 text-green-500 border border-green-500/30">
                      <TrendingUp className="w-3 h-3" />
                      <span>GANHOU</span>
                    </span>
                  ) : bet.result === 'loss' ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-bold rounded-full bg-red-500/20 text-red-500 border border-red-500/30">
                      <TrendingDown className="w-3 h-3" />
                      <span>PERDEU</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-bold rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                      <span>PENDENTE</span>
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`text-sm font-bold ${
                      Number(bet.profit) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    R$ {Number(bet.profit) >= 0 ? '+' : ''}{Number(bet.profit).toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBets.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-neutral-500">
            {bets.length === 0
              ? 'Nenhuma aposta cadastrada. Comece adicionando sua primeira aposta!'
              : 'Nenhuma aposta encontrada com os filtros aplicados.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
