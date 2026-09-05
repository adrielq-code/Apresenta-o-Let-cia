import React from 'react';
import { EditorSlide } from '../../types';
import {
  Plus,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Props {
  slides: EditorSlide[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: () => void;
  onOpenCreateWithAI?: () => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onMoveSlideUp: (index: number) => void;
  onMoveSlideDown: (index: number) => void;
}

export const SlideListSidebar: React.FC<Props> = ({
  slides,
  activeSlideIndex,
  onSelectSlide,
  onAddSlide,
  onOpenCreateWithAI,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlideUp,
  onMoveSlideDown,
}) => {
  return (
    <aside className="w-56 sm:w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-gray-100 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-[#3A6351]" />
            <span>Slides ({slides.length})</span>
          </div>

          <button
            onClick={onAddSlide}
            className="p-1.5 px-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            title="Adicionar slide em branco"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="text-[10px] uppercase tracking-wider font-sans">Novo</span>
          </button>
        </div>

        {onOpenCreateWithAI && (
          <button
            id="create-slide-with-ai-btn"
            onClick={onOpenCreateWithAI}
            className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-[#3A6351] to-[#244234] hover:from-[#2e5041] hover:to-[#1a3025] text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Criar novo slide gerado por IA"
          >
            <Sparkles className="w-3 h-3 text-[#E3B04B]" />
            <span>+ Criar com IA</span>
          </button>
        )}
      </div>

      {/* Slide Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        {slides.map((slide, idx) => {
          const isActive = idx === activeSlideIndex;

          return (
            <div
              key={slide.id}
              onClick={() => onSelectSlide(idx)}
              className={`group p-2.5 rounded-2xl border transition-all cursor-pointer relative ${
                isActive
                  ? 'border-[#3A6351] bg-[#F4F7F5] shadow-md shadow-[#3A6351]/10 ring-1 ring-[#3A6351]'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {/* Header row: Index & Action controls */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans">
                  Slide {idx + 1}
                </span>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Move Up */}
                  <button
                    disabled={idx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSlideUp(idx);
                    }}
                    className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20 hover:bg-gray-200/60 transition-colors"
                    title="Mover para cima"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>

                  {/* Move Down */}
                  <button
                    disabled={idx === slides.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSlideDown(idx);
                    }}
                    className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20 hover:bg-gray-200/60 transition-colors"
                    title="Mover para baixo"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateSlide(idx);
                    }}
                    className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
                    title="Duplicar slide"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  {/* Delete */}
                  <button
                    disabled={slides.length <= 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSlide(idx);
                    }}
                    className="p-1 rounded text-gray-400 hover:text-red-600 disabled:opacity-20 hover:bg-red-50 transition-colors"
                    title="Excluir slide"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* 16:9 Thumbnail preview box */}
              <div
                className="aspect-video w-full rounded-xl border border-gray-100 relative overflow-hidden flex flex-col items-center justify-center p-2 text-center"
                style={{
                  backgroundColor: slide.background?.value || '#FFFFFF',
                }}
              >
                {slide.nativeSlideId ? (
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold uppercase text-[#3A6351] font-mono">
                      Palestra Original #{slide.nativeSlideId}
                    </span>
                    <span className="text-[10px] font-serif font-bold text-gray-800 line-clamp-1 mt-0.5">
                      {slide.title}
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center pointer-events-none p-1">
                    <span className="text-[10px] font-serif font-bold text-gray-800 line-clamp-2 leading-tight">
                      {slide.title || 'Slide sem título'}
                    </span>
                    <span className="text-[8px] text-gray-400 mt-1">
                      {slide.elements.length} {slide.elements.length === 1 ? 'elemento' : 'elementos'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Bottom "+ Adicionar slide" big button */}
        <button
          onClick={onAddSlide}
          className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#3A6351] text-gray-400 hover:text-[#3A6351] hover:bg-[#F4F7F5]/50 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Adicionar slide</span>
        </button>
      </div>
    </aside>
  );
};
