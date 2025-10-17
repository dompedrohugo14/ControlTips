import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface BankrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBankroll: number;
  currentMinimum: number | null;
  onSave: (value: number | null) => Promise<void>;
}

export default function BankrollModal({ isOpen, onClose, currentBankroll, currentMinimum, onSave }: BankrollModalProps) {
  const [minimumBankroll, setMinimumBankroll] = useState(currentMinimum?.toString() || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMinimumBankroll(currentMinimum?.toString() || '');
      setError('');
    }
  }, [isOpen, currentMinimum]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      const value = minimumBankroll.trim() === '' ? null : parseFloat(minimumBankroll);

      if (value !== null && (isNaN(value) || value < 0)) {
        setError('Digite um valor válido maior ou igual a zero');
        setSaving(false);
        return;
      }

      await onSave(value);
      onClose();
    } catch (err) {
      console.error('Error saving minimum bankroll:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar valor mínimo');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      setSaving(true);
      setError('');
      await onSave(null);
      setMinimumBankroll('');
      onClose();
    } catch (err) {
      console.error('Error removing minimum bankroll:', err);
      setError(err instanceof Error ? err.message : 'Erro ao remover valor mínimo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Banca Mínima</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
            disabled={saving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="mb-4 p-4 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-sm text-neutral-400 mb-1">Banca Total Atual</div>
            <div className="text-2xl font-bold text-white">R$ {currentBankroll.toFixed(2)}</div>
            {currentMinimum !== null && (
              <div className="mt-2 text-sm">
                <span className="text-neutral-400">Valor Mínimo Definido: </span>
                <span className={`font-bold ${currentBankroll < currentMinimum ? 'text-red-500' : 'text-green-500'}`}>
                  R$ {currentMinimum.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-start space-x-3 mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-neutral-300">
              <p className="font-medium text-yellow-500 mb-1">Alerta de Banca Baixa</p>
              <p>Defina um valor mínimo para sua banca. Quando o saldo ficar abaixo deste valor, a banca será exibida em vermelho como alerta.</p>
            </div>
          </div>

          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Valor Mínimo (R$)
          </label>
          <input
            type="number"
            value={minimumBankroll}
            onChange={(e) => setMinimumBankroll(e.target.value)}
            placeholder="Digite o valor mínimo ou deixe vazio"
            step="0.01"
            min="0"
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-500 transition-colors"
          />
          {minimumBankroll.trim() === '' && (
            <p className="mt-2 text-xs text-neutral-500">Deixe vazio para desativar o alerta</p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          {currentMinimum !== null && (
            <button
              onClick={handleRemove}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Removendo...' : 'Remover Alerta'}
            </button>
          )}
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
