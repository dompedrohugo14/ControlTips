import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface MarketStats {
  market: string;
  totalBets: number;
  wins: number;
  losses: number;
  winRate: number;
}

export default function CategoryWinRate() {
  const navigate = useNavigate();
  const [marketStats, setMarketStats] = useState<MarketStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketStats();
  }, []);

  const fetchMarketStats = async () => {
    try {
      setLoading(true);
      const { data: bets, error } = await supabase
        .from('bets')
        .select('bet_type, result');

      if (error) throw error;

      if (bets && bets.length > 0) {
        const statsMap: { [key: string]: { wins: number; losses: number; total: number } } = {};

        bets.forEach(bet => {
          if (!statsMap[bet.bet_type]) {
            statsMap[bet.bet_type] = { wins: 0, losses: 0, total: 0 };
          }

          if (bet.result === 'win') {
            statsMap[bet.bet_type].wins += 1;
          } else if (bet.result === 'loss') {
            statsMap[bet.bet_type].losses += 1;
          }

          if (bet.result !== 'pending') {
            statsMap[bet.bet_type].total += 1;
          }
        });

        const stats: MarketStats[] = Object.entries(statsMap)
          .map(([market, data]) => ({
            market,
            totalBets: data.total,
            wins: data.wins,
            losses: data.losses,
            winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
          }))
          .sort((a, b) => b.winRate - a.winRate);

        setMarketStats(stats);
      }
    } catch (err) {
      console.error('Error fetching market stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-neutral-400 hover:text-yellow-500 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar ao Dashboard</span>
        </button>

        <div className="flex items-center space-x-3 mb-8">
          <BarChart3 className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-white">Taxa de Acerto por Mercado</h1>
        </div>

        {loading ? (
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 text-center">
            <p className="text-neutral-400">Carregando...</p>
          </div>
        ) : marketStats.length === 0 ? (
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 text-center">
            <p className="text-neutral-400">Nenhuma aposta concluída encontrada</p>
          </div>
        ) : (
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8">
            <div className="space-y-6">
              {marketStats.map((stat, index) => (
                <div key={stat.market} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-neutral-500 w-6">#{index + 1}</span>
                      <h3 className="text-lg font-semibold text-white">{stat.market}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-500">
                        {stat.winRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-neutral-400">
                        {stat.wins}V - {stat.losses}D ({stat.totalBets} total)
                      </div>
                    </div>
                  </div>

                  <div className="relative h-8 bg-neutral-900 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${stat.winRate}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold text-white drop-shadow-lg">
                        {stat.wins} vitórias de {stat.totalBets} apostas
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Taxa de Acerto</span>
                    <span>
                      {stat.winRate >= 50 ? '✓ Acima de 50%' : '✗ Abaixo de 50%'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Melhor Mercado:</span>
                <span className="text-yellow-500 font-bold">
                  {marketStats[0]?.market} ({marketStats[0]?.winRate.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-neutral-400">Total de Mercados:</span>
                <span className="text-white font-bold">{marketStats.length}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
