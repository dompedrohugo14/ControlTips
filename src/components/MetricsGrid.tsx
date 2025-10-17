import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Target, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MetricsGridProps {
  timeFilter: string;
}

export default function MetricsGrid({ timeFilter }: MetricsGridProps) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    balance: 0,
    roi: 0,
    winRate: 0,
    totalStaked: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const now = new Date();
        let startDate: Date | null = null;

        switch (timeFilter) {
          case '7d':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
            break;
          case '90d':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 90);
            break;
          case '1y':
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          case 'all':
          default:
            startDate = null;
            break;
        }

        let query = supabase.from('bets').select('*');
        if (startDate) {
          query = query.gte('bet_date', startDate.toISOString().split('T')[0]);
        }

      const { data: bets, error } = await query;

      if (error) throw error;

      if (bets && bets.length > 0) {
        const totalStaked = bets.reduce((sum, bet) => sum + Number(bet.stake), 0);
        const totalProfit = bets.reduce((sum, bet) => sum + Number(bet.profit), 0);
        const balance = totalProfit;
        const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;

        const completedBets = bets.filter(bet => bet.result !== 'pending');
        const wonBets = completedBets.filter(bet => bet.result === 'win').length;
        const winRate = completedBets.length > 0 ? (wonBets / completedBets.length) * 100 : 0;

        setMetrics({
          balance,
          roi,
          winRate,
          totalStaked,
        });
      } else {
        setMetrics({
          balance: 0,
          roi: 0,
          winRate: 0,
          totalStaked: 0,
        });
      }
      } catch (err) {
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [timeFilter]);

  const metricsData = [
    {
      title: 'Ganhos',
      value: loading ? '...' : `R$ ${metrics.balance.toFixed(2)}`,
      icon: Wallet,
      trend: metrics.balance >= 0 ? `+${((metrics.balance / (metrics.totalStaked || 1)) * 100).toFixed(1)}%` : `${((metrics.balance / (metrics.totalStaked || 1)) * 100).toFixed(1)}%`,
      trendUp: metrics.balance >= 0,
    },
    {
      title: 'ROI',
      value: loading ? '...' : `${metrics.roi.toFixed(1)}%`,
      icon: TrendingUp,
      trend: metrics.roi >= 0 ? `+${metrics.roi.toFixed(1)}%` : `${metrics.roi.toFixed(1)}%`,
      trendUp: metrics.roi >= 0,
    },
    {
      title: 'Taxa de Acerto',
      value: loading ? '...' : `${metrics.winRate.toFixed(1)}%`,
      icon: Target,
      trend: `${metrics.winRate.toFixed(1)}%`,
      trendUp: metrics.winRate >= 50,
    },
    {
      title: 'Total Apostado',
      value: loading ? '...' : `R$ ${metrics.totalStaked.toFixed(2)}`,
      icon: DollarSign,
      trend: `${metrics.totalStaked.toFixed(0)}`,
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricsData.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={index}
            className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 hover:border-yellow-500/50 transition-all duration-300 shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                {loading ? (
                  <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
                ) : (
                  <Icon className="w-6 h-6 text-yellow-500" />
                )}
              </div>
              {!loading && (
                <span
                  className={`text-sm font-semibold px-2 py-1 rounded ${
                    metric.trendUp
                      ? 'text-green-500 bg-green-500/10'
                      : 'text-red-500 bg-red-500/10'
                  }`}
                >
                  {metric.trend}
                </span>
              )}
            </div>
            <h3 className="text-neutral-400 text-sm font-medium mb-2">
              {metric.title}
            </h3>
            <p className="text-yellow-500 text-3xl font-bold tracking-tight">
              {metric.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
