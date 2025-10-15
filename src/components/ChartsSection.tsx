import { LineChart, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ChartsSectionProps {
  timeFilter: string;
}

interface MonthlyData {
  month: string;
  value: number;
}

export default function ChartsSection({ timeFilter }: ChartsSectionProps) {
  const navigate = useNavigate();
  const [profitData, setProfitData] = useState<MonthlyData[]>([]);
  const [roiData, setRoiData] = useState<MonthlyData[]>([]);
  const [winRateData, setWinRateData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const startDate = new Date();

        switch (timeFilter) {
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(now.getDate() - 90);
            break;
          case '1y':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        const { data: bets, error } = await supabase
          .from('bets')
          .select('bet_date, profit, stake, result')
          .gte('bet_date', startDate.toISOString().split('T')[0])
          .order('bet_date', { ascending: true });

        if (error) throw error;

        if (bets && bets.length > 0) {
          const monthlyStats: { [key: string]: { profit: number; stake: number; wins: number; total: number } } = {};

          bets.forEach(bet => {
            const date = new Date(bet.bet_date);
            const monthKey = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
            const monthCapitalized = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);

            if (!monthlyStats[monthCapitalized]) {
              monthlyStats[monthCapitalized] = { profit: 0, stake: 0, wins: 0, total: 0 };
            }

            monthlyStats[monthCapitalized].profit += Number(bet.profit);
            monthlyStats[monthCapitalized].stake += Number(bet.stake);
            monthlyStats[monthCapitalized].total += 1;
            if (bet.result === 'win') {
              monthlyStats[monthCapitalized].wins += 1;
            }
          });

          const profitChartData: MonthlyData[] = Object.entries(monthlyStats).map(([month, stats]) => ({
            month,
            value: stats.profit
          }));

          const roiChartData: MonthlyData[] = Object.entries(monthlyStats).map(([month, stats]) => ({
            month,
            value: stats.stake > 0 ? (stats.profit / stats.stake) * 100 : 0
          }));

          const winRateChartData: MonthlyData[] = Object.entries(monthlyStats).map(([month, stats]) => ({
            month,
            value: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0
          }));

          setProfitData(profitChartData);
          setRoiData(roiChartData);
          setWinRateData(winRateChartData);
        } else {
          setProfitData([]);
          setRoiData([]);
          setWinRateData([]);
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [timeFilter]);

  if (loading) {
    return (
      <div className="mb-8 space-y-6">
        <h2 className="text-2xl font-bold text-yellow-500 mb-6">
          Evolução de Performance
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 h-64 flex items-center justify-center">
            <div className="text-neutral-400">Carregando...</div>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 h-64 flex items-center justify-center">
            <div className="text-neutral-400">Carregando...</div>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 h-64 flex items-center justify-center">
            <div className="text-neutral-400">Carregando...</div>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 h-64 flex items-center justify-center">
            <div className="text-neutral-400">Carregando...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-6">
      <h2 className="text-2xl font-bold text-yellow-500 mb-6">
        Evolução de Performance
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <ChartCard
          title="Evolução de Lucro"
          data={profitData}
          color="yellow"
          icon={LineChart}
          prefix="R$ "
          onClick={() => navigate('/profit-evolution')}
        />
        <ChartCard
          title="Evolução do ROI"
          data={roiData}
          color="yellow"
          icon={TrendingUp}
          suffix="%"
          onClick={() => navigate('/roi-evolution')}
        />
        <ChartCard
          title="Taxa de Acerto"
          data={winRateData}
          color="yellow"
          icon={Target}
          suffix="%"
          onClick={() => navigate('/win-rate-evolution')}
        />
        <div
          className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 hover:border-yellow-500/50 transition-all duration-300 shadow-lg cursor-pointer flex flex-col items-center justify-center min-h-[280px]"
          onClick={() => navigate('/category-win-rate')}
        >
          <BarChart3 className="w-16 h-16 text-yellow-500 mb-4" />
          <h3 className="text-neutral-200 font-semibold text-lg text-center mb-2">
            Acertos por Mercado
          </h3>
          <p className="text-neutral-400 text-sm text-center">
            Veja sua taxa de acerto em cada mercado de apostas
          </p>
        </div>
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  data: Array<{ month: string; value: number }>;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  prefix?: string;
  suffix?: string;
  onClick?: () => void;
}

function ChartCard({ title, data, icon: Icon, prefix = '', suffix = '', onClick }: ChartCardProps) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue;

  return (
    <div
      className={`bg-neutral-950 border border-neutral-800 rounded-xl p-6 hover:border-yellow-500/50 transition-all duration-300 shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-neutral-200 font-semibold text-lg">{title}</h3>
        <Icon className="w-5 h-5 text-yellow-500" />
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between h-32 gap-2">
          {data.map((point, index) => {
            const heightPercent = ((point.value - minValue) / range) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-neutral-900 rounded-t relative group">
                  <div
                    className="bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t transition-all duration-300 group-hover:from-yellow-400 group-hover:to-yellow-300"
                    style={{ height: `${Math.max(heightPercent, 5)}%`, minHeight: '4px' }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-neutral-900 px-2 py-1 rounded text-xs text-yellow-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-neutral-800">
                    {prefix}{point.value}{suffix}
                  </div>
                </div>
                <span className="text-xs text-neutral-500 font-medium">
                  {point.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
