import React, { useState, useEffect } from 'react';
import { X, Edit3 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  currentTitle: string;
  onClose: () => void;
  onRename: (newTitle: string) => void;
}

export const RenameModal: React.FC<Props> = ({
  isOpen,
  currentTitle,
  onClose,
  onRename,
}) => {
  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onRename(title.trim());
    onClose();
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
          <Edit3 className="w-4 h-4" />
          <span>Renomear Apresentação</span>
        </div>

        <h3 className="text-xl font-serif font-bold text-gray-900 mb-1">
          Novo Título
        </h3>
        <p className="text-xs text-gray-500 mb-5">
          Altere o nome visível da apresentação.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3A6351]/30 focus:border-[#3A6351] text-gray-800 text-sm"
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-6 py-2 rounded-full bg-[#3A6351] hover:bg-[#2e5041] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#3A6351]/20 transition-all cursor-pointer"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
