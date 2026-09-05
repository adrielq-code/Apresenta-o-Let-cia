import React from 'react';
import { PresenterNote } from '../types';
import { MessageSquare, HelpCircle, Target, Clock, AlertCircle, X, ChevronUp, ChevronDown } from 'lucide-react';

interface SpeakerNotesDrawerProps {
  notes: PresenterNote;
  currentSlide: number;
  totalSlides: number;
  slideTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const SpeakerNotesDrawer: React.FC<SpeakerNotesDrawerProps> = ({
  notes,
  currentSlide,
  totalSlides,
  slideTitle,
  isOpen,
  onClose,
  onPrev,
  onNext,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="speaker-notes-drawer"
      className="fixed bottom-16 right-4 md:right-8 z-50 w-[92vw] max-w-lg bg-white/95 backdrop-blur-xl border border-[#E5E9E6] rounded-3xl shadow-2xl overflow-hidden transition-all text-[#2C2C2C]"
    >
      {/* Header */}
      <div className="bg-[#F4F7F5] px-5 py-3.5 border-b border-[#E5E9E6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#3A6351] animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#3A6351] font-sans">
            Notas da Palestrante
          </span>
          <span className="text-xs text-gray-400 font-sans">
            (Tela {currentSlide} / {totalSlides})
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            id="notes-prev-btn"
            onClick={onPrev}
            disabled={currentSlide === 1}
            className="p-1 rounded-full text-gray-400 hover:text-[#3A6351] hover:bg-white disabled:opacity-30"
            title="Tela anterior"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            id="notes-next-btn"
            onClick={onNext}
            disabled={currentSlide === totalSlides}
            className="p-1 rounded-full text-gray-400 hover:text-[#3A6351] hover:bg-white disabled:opacity-30"
            title="Próxima tela"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            id="notes-close-btn"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-[#3A6351] hover:bg-white ml-1"
            title="Fechar notas (N)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body with scroll */}
      <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3.5 text-sm">
        {/* Title */}
        <div className="text-xs font-semibold text-gray-400 border-b border-gray-100 pb-2 font-serif">
          {slideTitle}
        </div>

        {/* What to say */}
        <div className="bg-[#F4F7F5] p-4 rounded-2xl border border-[#3A6351]/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#3A6351] mb-1.5 uppercase font-sans">
            <MessageSquare className="w-3.5 h-3.5" />
            O que falar:
          </div>
          <p className="text-gray-700 leading-relaxed font-serif italic text-sm">
            "{notes.script}"
          </p>
        </div>

        {/* Question to the room */}
        {notes.question && (
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1.5 uppercase font-sans">
              <HelpCircle className="w-3.5 h-3.5" />
              Pergunta para a turma:
            </div>
            <p className="text-amber-900 font-medium text-sm font-sans">
              {notes.question}
            </p>
          </div>
        )}

        {/* Objective & Suggested time */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-white p-3 rounded-xl border border-[#E5E9E6] shadow-sm">
            <div className="flex items-center gap-1 text-gray-400 font-semibold mb-1 uppercase font-sans">
              <Target className="w-3 h-3 text-sky-600" />
              Objetivo da tela:
            </div>
            <p className="text-gray-700 leading-tight font-sans">
              {notes.objective}
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E5E9E6] shadow-sm">
            <div className="flex items-center gap-1 text-gray-400 font-semibold mb-1 uppercase font-sans">
              <Clock className="w-3 h-3 text-[#3A6351]" />
              Tempo sugerido:
            </div>
            <p className="text-[#3A6351] font-bold font-sans">
              {notes.suggestedTime}
            </p>
          </div>
        </div>

        {/* Tips / Notes */}
        {notes.tips && (
          <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-[#E5E9E6] text-xs text-gray-500 font-sans shadow-sm">
            <AlertCircle className="w-4 h-4 text-[#3A6351] shrink-0 mt-0.5" />
            <span>{notes.tips}</span>
          </div>
        )}
      </div>

      <div className="bg-[#FDFDFD] px-5 py-2.5 text-[11px] text-gray-400 flex justify-between items-center border-t border-[#E5E9E6] font-sans">
        <span>Pressione <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 border border-gray-200">N</kbd> para alternar</span>
        <span className="text-[#3A6351] font-medium">Apenas você visualiza este painel</span>
      </div>
    </div>
  );
};
