import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Share2 } from 'lucide-react';
import { Presentation } from '../../types';
import { exportPresentationPackage } from '../../services/storage';

interface Props {
  presentation: Presentation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CodeModal: React.FC<Props> = ({ presentation, isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedFullData, setCopiedFullData] = useState(false);

  if (!isOpen || !presentation) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(presentation.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyFullData = () => {
    const pkg = exportPresentationPackage(presentation);
    navigator.clipboard.writeText(pkg);
    setCopiedFullData(true);
    setTimeout(() => setCopiedFullData(false), 2000);
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
          <QrCode className="w-4 h-4" />
          <span>Compartilhamento & Identificação</span>
        </div>

        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-1">
          Código da Apresentação
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Utilize este identificador para abrir ou importar esta apresentação em qualquer dispositivo.
        </p>

        {/* Short Code Box */}
        <div className="bg-[#F4F7F5] border border-[#3A6351]/20 rounded-3xl p-6 text-center mb-6">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2 font-sans">
            Código Único
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-[#3A6351] tracking-wider mb-4 select-all">
            {presentation.code}
          </div>
          <button
            onClick={handleCopyCode}
            className="w-full py-3 px-4 rounded-full bg-[#3A6351] hover:bg-[#2e5041] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#3A6351]/20 transition-all cursor-pointer"
          >
            {copiedCode ? (
              <>
                <Check className="w-4 h-4" />
                <span>Código Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Código</span>
              </>
            )}
          </button>
        </div>

        {/* Portable backup option */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-gray-700">Backup Completo (Dados)</span>
            <span className="text-[10px] text-gray-400 font-mono">Portabilidade Total</span>
          </div>
          <p className="text-[11px] text-gray-500 mb-3">
            Gera o pacote completo de slides, fotos e textos para migrar entre computadores sem depender de servidor.
          </p>
          <button
            onClick={handleCopyFullData}
            className="w-full py-2 px-3 rounded-xl border border-gray-200 hover:bg-white text-gray-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copiedFullData ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-700">Pacote Completo Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-gray-500" />
                <span>Copiar Pacote de Dados Completo</span>
              </>
            )}
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
