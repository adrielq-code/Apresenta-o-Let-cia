import React, { useState, useEffect } from 'react';
import { SlideData } from '../types';
import { 
  Clock, 
  MessageSquare, 
  HelpCircle, 
  Target, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface PresenterCockpitModalProps {
  slides: SlideData[];
  currentSlideIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onGoToSlide: (index: number) => void;
  renderSlideMini: (slide: SlideData) => React.ReactNode;
}

export const PresenterCockpitModal: React.FC<PresenterCockpitModalProps> = ({
  slides,
  currentSlideIndex,
  isOpen,
  onClose,
  onGoToSlide,
  renderSlideMini,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [slideSeconds, setSlideSeconds] = useState(0);

  // Pacing timer (45-50 min target)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && isOpen) {
      interval = setInterval(() => {
        setTotalSeconds((prev) => prev + 1);
        setSlideSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isOpen]);

  // Reset slide timer when slide changes
  useEffect(() => {
    setSlideSeconds(0);
  }, [currentSlideIndex]);

  if (!isOpen) return null;

  const currentSlide = slides[currentSlideIndex];
  const nextSlide = slides[currentSlideIndex + 1];

  const totalMin = Math.floor(totalSeconds / 60);
  const totalSec = totalSeconds % 60;

  const slideMin = Math.floor(slideSeconds / 60);
  const slideSec = slideSeconds % 60;

  // 45 min target progress (2700s)
  const pacingPercent = Math.min(100, (totalSeconds / (45 * 60)) * 100);

  return (
    <div
      id="presenter-cockpit-modal"
      className="fixed inset-0 z-50 bg-[#FDFDFD]/98 backdrop-blur-2xl text-[#2C2C2C] flex flex-col p-4 md:p-6 overflow-hidden"
    >
      {/* Top bar: Timers & Controls */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E9E6] shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#F4F7F5] border border-[#3A6351]/30 px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#3A6351] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#3A6351] font-sans">
              Modo Apresentador
            </span>
          </div>

          {/* Master lecture clock */}
          <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-full border border-[#E5E9E6] shadow-sm">
            <Clock className="w-4 h-4 text-[#3A6351]" />
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold font-sans">
                Tempo de Palestra (Meta: 45 min)
              </span>
              <span className="text-sm font-serif font-bold text-[#2C2C2C]">
                {String(totalMin).padStart(2, '0')}:{String(totalSec).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-1 ml-2">
              <button
                id="cockpit-timer-toggle"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1.5 rounded-full bg-gray-100 text-gray-700 hover:text-[#3A6351] hover:bg-gray-200 transition-colors cursor-pointer"
                title={isTimerRunning ? 'Pausar' : 'Retomar'}
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
              </button>
              <button
                id="cockpit-timer-reset"
                onClick={() => {
                  setTotalSeconds(0);
                  setSlideSeconds(0);
                }}
                className="p-1.5 rounded-full bg-gray-100 text-gray-700 hover:text-[#3A6351] hover:bg-gray-200 transition-colors cursor-pointer"
                title="Zerar cronômetro"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Current slide timer */}
          <div className="hidden sm:flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#E5E9E6] text-xs shadow-sm">
            <span className="text-gray-400 font-sans">Nesta tela:</span>
            <span className="font-serif font-bold text-[#3A6351]">
              {String(slideMin).padStart(2, '0')}:{String(slideSec).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Close */}
        <button
          id="cockpit-close-btn"
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-gray-50 text-gray-700 transition-colors border border-gray-200 text-xs font-semibold shadow-sm cursor-pointer"
        >
          <span>Fechar (P)</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress pacing bar */}
      <div className="w-full bg-[#E5E9E6] h-1.5 mt-2 rounded-full overflow-hidden">
        <div
          className="bg-[#3A6351] h-full transition-all duration-300"
          style={{ width: `${pacingPercent}%` }}
        />
      </div>

      {/* Main split dashboard: Left = Previews (Current + Next) | Right = Big Speaker Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 flex-1 min-h-0 overflow-y-auto">
        {/* Left column: Current slide preview + Next slide preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Current slide preview */}
          <div className="bg-white border border-[#3A6351]/40 rounded-3xl p-4 flex flex-col shadow-md">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3A6351] flex items-center gap-1.5 font-sans">
                <Sparkles className="w-3.5 h-3.5" />
                Tela Atual ({currentSlide.id} / {slides.length})
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#F4F7F5] text-[#3A6351] border border-[#3A6351]/20 font-sans font-bold uppercase">
                {currentSlide.category}
              </span>
            </div>

            <div className="w-full aspect-video bg-[#FDFDFD] rounded-2xl overflow-hidden border border-[#E5E9E6] flex items-center justify-center relative shadow-inner">
              {renderSlideMini(currentSlide)}
            </div>
            <h4 className="mt-2.5 text-sm font-serif font-bold text-[#2C2C2C] truncate">
              {currentSlide.title}
            </h4>
          </div>

          {/* Next slide preview */}
          <div className="bg-white border border-[#E5E9E6] rounded-3xl p-4 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 font-sans">
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                Próxima Tela ({nextSlide ? `${nextSlide.id} / ${slides.length}` : 'Fim'})
              </span>
              {nextSlide && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 font-sans font-medium uppercase">
                  {nextSlide.category}
                </span>
              )}
            </div>

            {nextSlide ? (
              <div className="w-full aspect-video bg-[#FDFDFD] rounded-2xl overflow-hidden border border-[#E5E9E6] flex items-center justify-center relative opacity-90 shadow-inner">
                {renderSlideMini(nextSlide)}
              </div>
            ) : (
              <div className="w-full aspect-video bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs font-sans">
                Última tela da apresentação
              </div>
            )}
            {nextSlide && (
              <h5 className="mt-2 text-xs font-serif font-medium text-gray-600 truncate">
                {nextSlide.title}
              </h5>
            )}
          </div>
        </div>

        {/* Right column: Speaker Script & Cues (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E5E9E6] rounded-3xl p-6 flex flex-col justify-between overflow-y-auto space-y-4 shadow-sm">
          <div className="space-y-4">
            {/* Slide title banner */}
            <div className="border-b border-gray-100 pb-3">
              <span className="text-[10px] font-bold text-[#3A6351] uppercase tracking-widest font-sans">
                Roteiro da Tela {currentSlide.id}
              </span>
              <h2 className="text-xl md:text-2xl font-serif font-bold tracking-tight text-[#2C2C2C] mt-1">
                {currentSlide.title}
              </h2>
              {currentSlide.subtitle && (
                <p className="text-sm text-gray-500 mt-1 font-sans">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {/* What to say */}
            <div className="bg-[#F4F7F5] p-5 rounded-2xl border border-[#3A6351]/20">
              <div className="flex items-center gap-2 text-xs font-bold text-[#3A6351] uppercase tracking-wider mb-2 font-sans">
                <MessageSquare className="w-4 h-4" />
                O que a palestrante deve falar:
              </div>
              <p className="text-gray-800 text-base leading-relaxed font-serif italic">
                "{currentSlide.notes.script}"
              </p>
            </div>

            {/* Question for the class */}
            {currentSlide.notes.question && (
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5 font-sans">
                  <HelpCircle className="w-4 h-4 text-amber-700" />
                  Pergunta que deve fazer à turma:
                </div>
                <p className="text-amber-950 text-sm font-semibold font-sans">
                  {currentSlide.notes.question}
                </p>
              </div>
            )}

            {/* Objective & Suggested time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#FDFDFD] p-3.5 rounded-2xl border border-[#E5E9E6]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1 font-sans">
                  <Target className="w-3.5 h-3.5 text-sky-600" />
                  Objetivo desta tela:
                </div>
                <p className="text-gray-600 text-xs leading-relaxed font-sans">
                  {currentSlide.notes.objective}
                </p>
              </div>

              <div className="bg-[#FDFDFD] p-3.5 rounded-2xl border border-[#E5E9E6]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#3A6351] uppercase tracking-wider mb-1 font-sans">
                  <Clock className="w-3.5 h-3.5 text-[#3A6351]" />
                  Tempo sugerido:
                </div>
                <p className="text-[#3A6351] text-sm font-bold font-sans">
                  {currentSlide.notes.suggestedTime}
                </p>
                {currentSlide.notes.tips && (
                  <p className="text-[11px] text-gray-500 mt-1 font-sans">
                    {currentSlide.notes.tips}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Controls for slide navigation */}
          <div className="pt-4 border-t border-[#E5E9E6] flex items-center justify-between">
            <button
              id="cockpit-prev-slide-btn"
              onClick={() => onGoToSlide(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 text-gray-700 font-semibold text-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {/* Quick jump slide selector dropdown */}
            <div className="flex items-center gap-2 font-sans">
              <span className="text-xs text-gray-400">Ir para:</span>
              <select
                id="cockpit-slide-select"
                value={currentSlideIndex}
                onChange={(e) => onGoToSlide(Number(e.target.value))}
                className="bg-[#FDFDFD] border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 font-sans focus:outline-none focus:border-[#3A6351]"
              >
                {slides.map((s, idx) => (
                  <option key={s.id} value={idx}>
                    {String(s.id).padStart(2, '0')}. {s.title.substring(0, 24)}...
                  </option>
                ))}
              </select>
            </div>

            <button
              id="cockpit-next-slide-btn"
              onClick={() => onGoToSlide(Math.min(slides.length - 1, currentSlideIndex + 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="pill-btn flex items-center gap-2 px-5 py-2 rounded-full bg-[#3A6351] hover:bg-[#2e5041] disabled:opacity-30 text-white font-bold text-xs shadow-md shadow-[#3A6351]/20 transition-all cursor-pointer"
            >
              <span>Próxima Tela</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
