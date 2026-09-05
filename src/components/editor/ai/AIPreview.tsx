import React from 'react';
import { EditorSlide } from '../../../types';
import { Check, X, RefreshCw, Sparkles, ArrowRight, Eye } from 'lucide-react';

interface AIPreviewProps {
  originalSlide: EditorSlide;
  previewSlide: EditorSlide;
  explanation: string;
  actionsTaken?: string[];
  onApply: () => void;
  onCancel: () => void;
  onRegenerate: () => void;
  isApplying?: boolean;
}

export const AIPreview: React.FC<AIPreviewProps> = ({
  originalSlide,
  previewSlide,
  explanation,
  actionsTaken = [],
  onApply,
  onCancel,
  onRegenerate,
  isApplying = false,
}) => {
  return (
    <div className="bg-[#F8FAF9] border-2 border-[#3A6351]/30 rounded-2xl p-4 space-y-3.5 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#3A6351] text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#E3B04B]" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3A6351] block">
              Alterações Sugeridas pela IA
            </span>
            <span className="text-[11px] text-gray-500 font-sans">
              Revise o resultado antes de aplicar
            </span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
          PREVIEW PRONTO
        </span>
      </div>

      {/* Explanation Quote */}
      <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs text-gray-700 leading-relaxed font-sans">
        <p className="italic text-gray-800">“{explanation}”</p>
      </div>

      {/* Actions Summary List */}
      {actionsTaken.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Ações Realizadas
          </span>
          <ul className="space-y-1">
            {actionsTaken.map((action, idx) => (
              <li
                key={idx}
                className="text-[11px] text-gray-600 flex items-start gap-1.5 font-sans"
              >
                <span className="text-[#3A6351] font-bold">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Changes Mini Metrics */}
      <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-mono">
        <div className="p-2 rounded-xl bg-white border border-gray-200">
          <span className="text-gray-400 block text-[9px] uppercase">Antes</span>
          <span className="font-bold text-gray-700">
            {originalSlide.elements.length} elementos
          </span>
        </div>
        <div className="p-2 rounded-xl bg-white border border-emerald-200 text-emerald-800">
          <span className="text-emerald-600 block text-[9px] uppercase">Depois</span>
          <span className="font-bold">
            {previewSlide.elements.length} elementos otimizados
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
        <button
          onClick={onApply}
          disabled={isApplying}
          className="flex-1 py-2 px-3 rounded-xl bg-[#3A6351] hover:bg-[#2e5041] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{isApplying ? 'Aplicando…' : 'Aplicar'}</span>
        </button>

        <button
          onClick={onRegenerate}
          disabled={isApplying}
          className="py-2 px-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
          title="Não gostei, faça outra versão"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
          <span className="hidden sm:inline">Outra versão</span>
        </button>

        <button
          onClick={onCancel}
          disabled={isApplying}
          className="py-2 px-2.5 rounded-xl border border-gray-300 hover:bg-red-50 text-gray-600 hover:text-red-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
          title="Descartar alterações da IA"
        >
          <X className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cancelar</span>
        </button>
      </div>
    </div>
  );
};
