import React from 'react';
import { AIAssistantAction, EditorSlide } from '../../../types';
import { History, RotateCcw, Clock, Sparkles } from 'lucide-react';

interface AIHistoryProps {
  history: AIAssistantAction[];
  onRestoreAction: (action: AIAssistantAction) => void;
  onClearHistory: () => void;
}

export const AIHistory: React.FC<AIHistoryProps> = ({
  history,
  onRestoreAction,
  onClearHistory,
}) => {
  if (history.length === 0) {
    return (
      <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-4">
        <History className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <span className="text-xs font-bold text-gray-600 block">Nenhuma ação recente</span>
        <span className="text-[11px] text-gray-400 font-sans mt-0.5 block">
          Comandos executados pela IA aparecerão aqui com opção de restauração rápida.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700">
          <History className="w-3.5 h-3.5 text-[#3A6351]" />
          <span>Histórico de IA ({history.length})</span>
        </div>
        <button
          onClick={onClearHistory}
          className="text-[10px] text-gray-400 hover:text-gray-700 underline font-sans cursor-pointer"
        >
          Limpar histórico
        </button>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#3A6351]/40 transition-colors shadow-2xs flex items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                <Clock className="w-3 h-3" />
                <span>{item.timestamp}</span>
                {item.slideIndex !== undefined && (
                  <span className="text-[#3A6351] font-bold">
                    • Slide #{item.slideIndex + 1}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-gray-800 truncate mt-0.5">
                {item.description}
              </p>
              <p className="text-[10px] text-gray-400 truncate italic">
                “{item.prompt}”
              </p>
            </div>

            {item.previousSlideState && (
              <button
                onClick={() => onRestoreAction(item)}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#3A6351]/10 text-gray-600 hover:text-[#3A6351] transition-colors shrink-0 cursor-pointer"
                title="Restaurar este estado anterior"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
