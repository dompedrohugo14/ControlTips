import { useState, useEffect } from 'react';
import { X, Wallet, Info } from 'lucide-react';

interface InitialBankrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInitialBankroll: number;
  totalProfit: number;
  onSave: (value: number) => Promise<void>;
}

export default function InitialBankrollModal({
  isOpen,
  onClose,
  currentInitialBankroll,
  totalProfit,
  onSave
}: InitialBankrollModalProps) {
  const [initialBankroll, setInitialBankroll] = useState(currentInitialBankroll.toString());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInitialBankroll(currentInitialBankroll.toString());
      setError('');
    }
  }, [isOpen, currentInitialBankroll]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      const value = parseFloat(initialBankroll);

      if (isNaN(value) || value < 0) {
        setError('Digite um valor válido maior ou igual a zero');
        setSaving(false);
        return;
      }

      await onSave(value);
      onClose();
    } catch (err) {
      console.error('Error saving initial bankroll:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar banca inicial');
    } finally {
      setSaving(false);
    }
  };

  const currentTotal = currentInitialBankroll + totalProfit;
  const newTotal = parseFloat(initialBankroll || '0') + totalProfit;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-white">Definir Banca Inicial</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
            disabled={saving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="mb-4 space-y-3">
            <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
              <div className="text-xs text-neutral-400 mb-1">Banca Atual</div>
              <div className="text-lg font-bold text-white">R$ {currentTotal.toFixed(2)}</div>
            </div>
          </div>

          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Banca Inicial (R$)
          </label>
          <input
            type="number"
            value={initialBankroll}
            onChange={(e) => setInitialBankroll(e.target.value)}
            placeholder="Digite o valor inicial da sua banca"
            step="0.01"
            min="0"
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-500 transition-colors"
          />

        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
