import React, { useState } from 'react';
import { X, KeyRound, AlertCircle } from 'lucide-react';
import { Presentation } from '../../types';
import { importPresentation } from '../../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (presentation: Presentation) => void;
}

export const ImportCodeModal: React.FC<Props> = ({ isOpen, onClose, onImportSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setError(null);
    const result = importPresentation(code.trim());
    if (result.success && result.presentation) {
      onImportSuccess(result.presentation);
      setCode('');
      onClose();
    } else {
      setError(result.message || 'Apresentação não encontrada.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-[#3A6351] text-xs font-bold uppercase tracking-wider mb-2">
          <KeyRound className="w-4 h-4" />
          <span>Importação</span>
        </div>

        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-1">
          Abrir por Código
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Insira o código de 8 dígitos ou cole o pacote compartilhado.
        </p>

        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Código da apresentação
            </label>
            <input
              type="text"
              autoFocus
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="Ex: PRES-7K4M2 ou AP-FUTURO"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3A6351]/30 focus:border-[#3A6351] text-gray-800 text-sm font-mono tracking-wider"
              required
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors uppercase tracking-wider"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!code.trim()}
              className="px-6 py-2.5 rounded-full bg-[#3A6351] hover:bg-[#2e5041] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#3A6351]/20 transition-all cursor-pointer"
            >
              ABRIR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
