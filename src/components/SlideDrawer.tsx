import React from 'react';
import { SlideData } from '../types';
import { X, Layers, Check } from 'lucide-react';

interface SlideDrawerProps {
  slides: SlideData[];
  currentSlideIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectSlide: (index: number) => void;
}

export const SlideDrawer: React.FC<SlideDrawerProps> = ({
  slides,
  currentSlideIndex,
  isOpen,
  onClose,
  onSelectSlide,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="slide-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-end transition-opacity"
    >
      <div className="w-full max-w-xl bg-[#FDFDFD] border-l border-[#E5E9E6] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 text-[#2C2C2C]">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E9E6] flex items-center justify-between bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#3A6351]" />
            <h3 className="font-serif font-bold text-[#2C2C2C] text-base">Índice de Telas (24 Telas)</h3>
          </div>
          <button
            id="slide-drawer-close"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-[#3A6351] hover:bg-[#F4F7F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {slides.map((slide, index) => {
            const isCurrent = index === currentSlideIndex;
            return (
              <button
                key={slide.id}
                id={`drawer-slide-item-${slide.id}`}
                onClick={() => {
                  onSelectSlide(index);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 group cursor-pointer ${
                  isCurrent
                    ? 'bg-[#F4F7F5] border-[#3A6351] shadow-sm'
                    : 'bg-white border-[#E5E9E6] hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                {/* Badge number */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-sans text-xs font-bold shrink-0 transition-colors ${
                    isCurrent
                      ? 'bg-[#3A6351] text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:text-[#3A6351]'
                  }`}
                >
                  {String(slide.id).padStart(2, '0')}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A6351] font-sans">
                      {slide.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-sans">
                      {slide.notes.suggestedTime}
                    </span>
                  </div>

                  <h4
                    className={`text-sm font-bold truncate mt-0.5 font-serif ${
                      isCurrent ? 'text-[#3A6351]' : 'text-[#2C2C2C] group-hover:text-[#3A6351]'
                    }`}
                  >
                    {slide.title}
                  </h4>

                  {slide.subtitle && (
                    <p className="text-xs text-gray-500 truncate mt-0.5 font-sans">
                      {slide.subtitle}
                    </p>
                  )}
                </div>

                {isCurrent && (
                  <div className="shrink-0 text-[#3A6351] self-center">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#E5E9E6] bg-white text-xs text-gray-400 flex items-center justify-between font-sans">
          <span>Tempo total sugerido: ~45-50 min</span>
          <span className="text-[#3A6351] font-semibold">24 telas completas</span>
        </div>
      </div>
    </div>
  );
};
