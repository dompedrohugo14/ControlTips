import { useState, useEffect } from 'react';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

type TimeFilter = '7d' | '30d' | '90d' | '1y';

interface DataPoint {
  date: string;
  value: number;
}

export default function ROIEvolution() {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchROIData();
  }, [timeFilter]);

  const fetchROIData = async () => {
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
        .select('bet_date, stake, profit')
        .gte('bet_date', startDate.toISOString().split('T')[0])
        .order('bet_date', { ascending: true });

      if (error) throw error;

      if (bets && bets.length > 0) {
        const groupedData: { [key: string]: { totalStake: number; totalProfit: number } } = {};

        bets.forEach(bet => {
          const dateKey = bet.bet_date.split('T')[0];

          if (!groupedData[dateKey]) {
            groupedData[dateKey] = { totalStake: 0, totalProfit: 0 };
          }
          groupedData[dateKey].totalStake += Number(bet.stake);
          groupedData[dateKey].totalProfit += Number(bet.profit);
        });

        let cumulativeStake = 0;
        let cumulativeProfit = 0;
        const chartData: DataPoint[] = Object.entries(groupedData)
          .map(([date, values]) => {
            cumulativeStake += values.totalStake;
            cumulativeProfit += values.totalProfit;
            const roi = cumulativeStake > 0 ? (cumulativeProfit / cumulativeStake) * 100 : 0;
            return {
              date,
              value: roi
            };
          });

        setData(chartData);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error('Error fetching ROI data:', err);
    } finally {
      setLoading(false);
    }
  };

  const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value)) : 0;
  const minValue = data.length > 0 ? Math.min(...data.map(d => d.value)) : 0;
  const range = maxValue - minValue;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getFilterLabel = () => {
    switch (timeFilter) {
      case '7d': return '7 dias';
      case '30d': return '30 dias';
      case '90d': return '90 dias';
      case '1y': return '1 ano';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-neutral-400 hover:text-yellow-500 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Dashboard</span>
          </button>

          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-yellow-500">Evolução do ROI</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            {(['7d', '30d', '90d', '1y'] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeFilter === filter
                    ? 'bg-yellow-500 text-black'
                    : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                {filter === '7d' && '7 dias'}
                {filter === '30d' && '30 dias'}
                {filter === '90d' && '90 dias'}
                {filter === '1y' && '1 ano'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-neutral-400">Carregando dados...</div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-neutral-400">Nenhum dado disponível para {getFilterLabel()}</div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="text-sm text-neutral-400 mb-2">ROI Atual</div>
                <div className="text-4xl font-bold text-yellow-500">
                  {data[data.length - 1]?.value.toFixed(2)}%
                </div>
              </div>

              <div className="relative h-96 border-l border-b border-neutral-800">
                <svg className="w-full h-full" viewBox={`0 0 ${data.length * 50} 100`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="roiLineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#eab308" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <polyline
                    fill="url(#roiLineGradient)"
                    stroke="none"
                    points={data.map((point, index) => {
                      const x = (index * 50) + 25;
                      const y = range > 0 ? 100 - ((point.value - minValue) / range * 90) : 50;
                      return `${x},${y}`;
                    }).join(' ') + ` ${data.length * 50},100 0,100`}
                  />

                  <polyline
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="0.5"
                    points={data.map((point, index) => {
                      const x = (index * 50) + 25;
                      const y = range > 0 ? 100 - ((point.value - minValue) / range * 90) : 50;
                      return `${x},${y}`;
                    }).join(' ')}
                  />

                  {data.map((point, index) => {
                    const x = (index * 50) + 25;
                    const y = range > 0 ? 100 - ((point.value - minValue) / range * 90) : 50;
                    return (
                      <g key={index}>
                        <circle
                          cx={x}
                          cy={y}
                          r="1"
                          fill="#eab308"
                          className="hover:r-2 transition-all"
                        />
                      </g>
                    );
                  })}
                </svg>

                <div className="flex justify-between mt-4 px-2">
                  {data.map((point, index) => {
                    if (index % Math.ceil(data.length / 10) === 0 || index === data.length - 1) {
                      return (
                        <div key={index} className="text-xs text-neutral-500">
                          {formatDate(point.date)}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                  <div className="text-sm text-neutral-400 mb-1">ROI Máximo</div>
                  <div className="text-2xl font-bold text-green-500">
                    {maxValue.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                  <div className="text-sm text-neutral-400 mb-1">ROI Mínimo</div>
                  <div className="text-2xl font-bold text-red-500">
                    {minValue.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                  <div className="text-sm text-neutral-400 mb-1">Variação</div>
                  <div className="text-2xl font-bold text-yellow-500">
                    {range.toFixed(2)}%
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
