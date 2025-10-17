import { Menu, TrendingUp, User, LogOut, Wallet, Download, Loader as Loader2, ClipboardList, Crown, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { generatePerformanceReport, downloadPDF } from '../utils/pdfExport';
import NotificationBell from './NotificationBell';
import BankrollModal from './BankrollModal';
import InitialBankrollModal from './InitialBankrollModal';
import { useSubscription } from '../hooks/useSubscription';
import { useTrialStatus } from '../hooks/useTrialStatus';

export default function Header() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bankroll, setBankroll] = useState(0);
  const [initialBankroll, setInitialBankroll] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [minimumBankroll, setMinimumBankroll] = useState<number | null>(null);
  const [showBankrollModal, setShowBankrollModal] = useState(false);
  const [showInitialBankrollModal, setShowInitialBankrollModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const { getActiveProduct, isActive } = useSubscription();
  const { isTrialActive, daysRemaining, isSubscriptionActive } = useTrialStatus();

  useEffect(() => {
    fetchBankroll();
    fetchMinimumBankroll();
    fetchInitialBankroll();
  }, []);

  const fetchBankroll = async () => {
    try {
      const { data: bets, error } = await supabase
        .from('bets')
        .select('profit');

      if (error) throw error;

      if (bets && bets.length > 0) {
        const profit = bets.reduce((sum, bet) => sum + Number(bet.profit), 0);
        setTotalProfit(profit);
        setBankroll(initialBankroll + profit);
      } else {
        setBankroll(initialBankroll);
      }
    } catch (err) {
      console.error('Error fetching bankroll:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialBankroll = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('initial_bankroll')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const initial = Number(data.initial_bankroll || 0);
        setInitialBankroll(initial);
        await fetchBankroll();
      }
    } catch (err) {
      console.error('Error fetching initial bankroll:', err);
    }
  };

  const fetchMinimumBankroll = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('minimum_bankroll')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setMinimumBankroll(data.minimum_bankroll ? Number(data.minimum_bankroll) : null);
      }
    } catch (err) {
      console.error('Error fetching minimum bankroll:', err);
    }
  };

  const handleSaveMinimumBankroll = async (value: number | null) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('profiles')
        .update({ minimum_bankroll: value })
        .eq('id', session.user.id);

      if (error) throw error;

      setMinimumBankroll(value);
    } catch (err) {
      console.error('Error saving minimum bankroll:', err);
      throw err;
    }
  };

  const handleSaveInitialBankroll = async (value: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('profiles')
        .update({ initial_bankroll: value })
        .eq('id', session.user.id);

      if (error) throw error;

      setInitialBankroll(value);
      setBankroll(value + totalProfit);
    } catch (err) {
      console.error('Error saving initial bankroll:', err);
      throw err;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const blob = await generatePerformanceReport();
      downloadPDF(blob);
    } catch (err) {
      console.error('Error generating report:', err);
      alert(err instanceof Error ? err.message : 'Erro ao gerar relatório');
    } finally {
      setExportLoading(false);
    }
  };

  const activeProduct = getActiveProduct();

  return (
    <header className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-yellow-400" strokeWidth={2.5} />
            <h1 className="text-2xl font-bold tracking-tight text-yellow-400">
              Control Tips
            </h1>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-400">Banca Inicial</span>
                  <button
                    onClick={() => setShowInitialBankrollModal(true)}
                    className="text-xs font-bold text-yellow-500 hover:text-yellow-400 transition-colors text-left"
                  >
                    {loading ? '...' : `R$ ${initialBankroll.toFixed(2)}`}
                  </button>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-400">Banca Atual</span>
                  <button
                    onClick={() => setShowBankrollModal(true)}
                    className={`text-xs font-bold hover:opacity-80 transition-colors text-left ${minimumBankroll !== null && bankroll < minimumBankroll ? 'text-red-500' : 'text-yellow-500'}`}
                  >
                    {loading ? '...' : `R$ ${bankroll.toFixed(2)}`}
                  </button>
                </div>
              </div>
            </div>

            {/* Trial Countdown */}
            {isTrialActive && !isSubscriptionActive && (
              <div className="flex items-center space-x-1.5 bg-yellow-500/10 border border-yellow-500/30 px-2 py-1.5 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-yellow-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-yellow-500/70 leading-tight">Teste</span>
                  <span className="text-xs font-bold text-yellow-500 leading-tight">
                    {daysRemaining}d
                  </span>
                </div>
              </div>
            )}

            {/* Subscription Status */}
            {isActive() && activeProduct && (
              <div className="flex items-center space-x-1.5 bg-green-500/10 border border-green-500/30 px-2 py-1.5 rounded-lg">
                <Crown className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs font-medium text-green-500">
                  {activeProduct.name}
                </span>
              </div>
            )}

            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-neutral-300 hover:text-yellow-500 transition-colors font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/management')}
              className="flex items-center space-x-1.5 text-sm text-neutral-300 hover:text-yellow-500 transition-colors font-medium"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Gestão</span>
            </button>
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="flex items-center space-x-1.5 text-sm text-neutral-300 hover:text-yellow-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Exportar</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-1.5 text-sm text-neutral-300 hover:text-yellow-500 transition-colors font-medium"
            >
              <User className="w-3.5 h-3.5" />
              <span>Perfil</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 text-sm text-neutral-300 hover:text-red-500 transition-colors font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
            <NotificationBell />
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-neutral-300 hover:text-yellow-500"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-neutral-800">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-400">Banca Inicial</span>
                  <button
                    onClick={() => {
                      setShowInitialBankrollModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm font-bold text-yellow-500 hover:text-yellow-400 transition-colors text-left"
                  >
                    {loading ? '...' : `R$ ${initialBankroll.toFixed(2)}`}
                  </button>
                </div>
              </div>
              <div className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-400">Banca Atual</span>
                  <span className={`text-sm font-bold ${minimumBankroll !== null && bankroll < minimumBankroll ? 'text-red-500' : 'text-yellow-500'}`}>
                    {loading ? '...' : `R$ ${bankroll.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Trial Countdown Mobile */}
            {isTrialActive && !isSubscriptionActive && (
              <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/30 px-3 py-2 rounded-lg mb-3">
                <Clock className="w-4 h-4 text-yellow-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-yellow-500/70">Teste</span>
                  <span className="text-sm font-bold text-yellow-500">
                    {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}
                  </span>
                </div>
              </div>
            )}

            {/* Subscription Status Mobile */}
            {isActive() && activeProduct && (
              <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/30 px-3 py-2 rounded-lg mb-3">
                <Crown className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">
                  {activeProduct.name}
                </span>
              </div>
            )}

            <button
              onClick={() => {
                navigate('/dashboard');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-neutral-300 hover:text-yellow-500 transition-colors font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                navigate('/management');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 text-neutral-300 hover:text-yellow-500 transition-colors font-medium"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Minha Gestão</span>
            </button>
            <button
              onClick={() => {
                handleExport();
                setMobileMenuOpen(false);
              }}
              disabled={exportLoading}
              className="flex items-center space-x-2 text-neutral-300 hover:text-yellow-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Exportar</span>
            </button>
            <button
              onClick={() => {
                navigate('/profile');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 text-neutral-300 hover:text-yellow-500 transition-colors font-medium"
            >
              <User className="w-4 h-4" />
              <span>Meu Perfil</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-neutral-300 hover:text-red-500 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
            <div className="pt-3 border-t border-neutral-800 mt-3">
              <NotificationBell />
            </div>
          </div>
        )}
      </div>

      <InitialBankrollModal
        isOpen={showInitialBankrollModal}
        onClose={() => setShowInitialBankrollModal(false)}
        currentInitialBankroll={initialBankroll}
        totalProfit={totalProfit}
        onSave={handleSaveInitialBankroll}
      />

      <BankrollModal
        isOpen={showBankrollModal}
        onClose={() => setShowBankrollModal(false)}
        currentBankroll={bankroll}
        currentMinimum={minimumBankroll}
        onSave={handleSaveMinimumBankroll}
      />
    </header>
  );
}