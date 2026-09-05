import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, format: '16:9') => void;
}

export const NewPresentationModal: React.FC<Props> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<'16:9'>('16:9');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim(), format);
    setTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-[#3A6351] text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Nova Apresentação</span>
        </div>

        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-1">
          Criar Apresentação
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Dê um nome e comece a editar visualmente seus slides.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Nome da apresentação
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Palestra sobre Inovação — Escola X"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3A6351]/30 focus:border-[#3A6351] text-gray-800 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Escolher formato
            </label>
            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-[#3A6351]/30 bg-[#F4F7F5]/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-5 border-2 border-[#3A6351] rounded-sm flex items-center justify-center text-[9px] font-bold text-[#3A6351]">
                  16:9
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">
                    16:9 Widescreen
                  </span>
                  <span className="text-xs text-gray-400 block">
                    Recomendado para projetores, TV e notebooks
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#3A6351] text-white">
                Padrão
              </span>
            </div>
          </div>

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
              disabled={!title.trim()}
              className="px-6 py-2.5 rounded-full bg-[#3A6351] hover:bg-[#2e5041] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#3A6351]/20 transition-all cursor-pointer"
            >
              Criar Apresentação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
