import React, { useState } from 'react';
import {
  EditorSlide,
  SlideElement,
  SlideBackground,
  PresenterNote,
  SlideElementStyle,
} from '../../types';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Type,
  Image as ImageIcon,
  Layers,
  StickyNote,
  Palette,
  ChevronDown,
  ChevronUp,
  Sliders,
  Copy,
  Trash2,
  ArrowUpToLine,
  ArrowDownToLine,
  RotateCw,
  Sparkles,
  Upload,
} from 'lucide-react';

interface Props {
  slide: EditorSlide;
  selectedElement: SlideElement | null;
  onUpdateElement: (id: string, updates: Partial<SlideElement>) => void;
  onUpdateSlideBackground: (background: SlideBackground) => void;
  onUpdateSlideNotes: (notes: PresenterNote) => void;
  onDuplicateElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onAlignElement: (id: string, alignment: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => void;
  presentationImages?: string[];
  onSelectElement: (id: string) => void;
}

export const PropertiesSidebar: React.FC<Props> = ({
  slide,
  selectedElement,
  onUpdateElement,
  onUpdateSlideBackground,
  onUpdateSlideNotes,
  onDuplicateElement,
  onDeleteElement,
  onBringForward,
  onSendBackward,
  onAlignElement,
  presentationImages = [],
  onSelectElement,
}) => {
  const [activeTab, setActiveTab] = useState<'design' | 'layers' | 'notes'>('design');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Background presets
  const backgroundPresets = [
    { label: 'Branco Puro', value: '#FFFFFF' },
    { label: 'Off-White Suave', value: '#FDFDFD' },
    { label: 'Verde Sálvia', value: '#F4F7F5' },
    { label: 'Cinza Mínimo', value: '#F8F9FA' },
    { label: 'Verde Floresta', value: '#1B3527' },
    { label: 'Azul Noturno', value: '#0F172A' },
    { label: 'Escuro Profundo', value: '#1E1E1E' },
  ];

  const gradientPresets = [
    { label: 'Sálvia Calm', value: 'linear-gradient(135deg, #F4F7F5 0%, #E2ECE5 100%)' },
    { label: 'Crepúsculo Dourado', value: 'linear-gradient(135deg, #FFFDF9 0%, #F5EDE0 100%)' },
    { label: 'Executivo Dark', value: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' },
  ];

  return (
    <aside className="w-72 sm:w-80 bg-white border-l border-gray-200 flex flex-col h-full shrink-0 select-none">
      {/* 3 Main Tabs: Design | Camadas | Notas */}
      <div className="flex items-center border-b border-gray-200 p-1.5 bg-gray-50/70">
        <button
          onClick={() => setActiveTab('design')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'design'
              ? 'bg-white text-[#3A6351] shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Design</span>
        </button>

        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'layers'
              ? 'bg-white text-[#3A6351] shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Camadas</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-white text-[#3A6351] shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <StickyNote className="w-3.5 h-3.5" />
          <span>Notas</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        {/* ========================================================= */}
        {/* TAB 1: DESIGN / PROPRIEDADES                             */}
        {/* ========================================================= */}
        {activeTab === 'design' && (
          <div>
            {!selectedElement ? (
              /* CANVAS BACKGROUND SETTINGS (When no element is selected) */
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    Slide Selecionado
                  </span>
                  <h3 className="font-serif font-bold text-gray-800 text-sm">
                    Fundo do Slide
                  </h3>
                </div>

                {/* Color Presets */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                    Cores Recomendadas
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {backgroundPresets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => onUpdateSlideBackground({ type: 'color', value: preset.value })}
                        className="h-9 rounded-xl border border-gray-200 hover:scale-105 transition-transform flex items-center justify-center cursor-pointer relative shadow-xs"
                        style={{ backgroundColor: preset.value }}
                        title={preset.label}
                      >
                        {slide.background?.value === preset.value && (
                          <div className="w-2 h-2 rounded-full bg-[#3A6351] ring-2 ring-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Input */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                    Cor Personalizada
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={slide.background?.value?.startsWith('#') ? slide.background.value : '#FFFFFF'}
                      onChange={(e) => onUpdateSlideBackground({ type: 'color', value: e.target.value })}
                      className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={slide.background?.value || '#FFFFFF'}
                      onChange={(e) => onUpdateSlideBackground({ type: 'color', value: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono uppercase text-gray-700"
                    />
                  </div>
                </div>

                {/* Gradient Presets */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                    Gradientes
                  </label>
                  <div className="space-y-1.5">
                    {gradientPresets.map((g) => (
                      <button
                        key={g.label}
                        onClick={() => onUpdateSlideBackground({ type: 'gradient', value: g.value })}
                        className="w-full py-2 px-3 rounded-xl border border-gray-200 hover:border-[#3A6351] text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="text-gray-700">{g.label}</span>
                        <div
                          className="w-6 h-6 rounded-lg border border-gray-200"
                          style={{ background: g.value }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Image */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                    Imagem de Fundo
                  </label>
                  <input
                    type="text"
                    value={slide.background?.type === 'image' ? slide.background.value : ''}
                    onChange={(e) =>
                      onUpdateSlideBackground({
                        type: 'image',
                        value: e.target.value,
                        fit: 'cover',
                      })
                    }
                    placeholder="URL da imagem (ex: https://...)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 mb-2"
                  />
                  {slide.background?.type === 'image' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateSlideBackground({ ...slide.background, fit: 'cover' })}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                          slide.background.fit === 'cover' ? 'bg-[#3A6351] text-white' : 'border border-gray-200'
                        }`}
                      >
                        Preencher
                      </button>
                      <button
                        onClick={() => onUpdateSlideBackground({ ...slide.background, fit: 'contain' })}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                          slide.background.fit === 'contain' ? 'bg-[#3A6351] text-white' : 'border border-gray-200'
                        }`}
                      >
                        Ajustar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ELEMENT PROPERTIES (When an element is selected) */
              <div className="space-y-4">
                {/* Element Type Tag & Fast Action Buttons */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#3A6351] bg-[#F4F7F5] px-2.5 py-0.5 rounded-full font-mono">
                    {selectedElement.type.toUpperCase()}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicateElement(selectedElement.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                      title="Duplicar elemento (Ctrl+D)"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteElement(selectedElement.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                      title="Excluir elemento (Delete)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Alignment Tools */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Alinhamento no Canvas
                  </label>
                  <div className="grid grid-cols-6 gap-1 text-center bg-gray-50 p-1 rounded-xl">
                    <button
                      onClick={() => onAlignElement(selectedElement.id, 'left')}
                      className="p-1.5 rounded hover:bg-white text-gray-600 transition-colors text-[10px] font-bold"
                      title="Alinhar à esquerda"
                    >
                      Esq
                    </button>
                    <button
                      onClick={() => onAlignElement(selectedElement.id, 'center-h')}
                      className="p-1.5 rounded hover:bg-white text-gray-600 transition-colors text-[10px] font-bold text-[#3A6351]"
                      title="Centralizar horizontalmente"
                    >
                      Centro
                    </button>
                    <button
                      onClick={() => onAlignElement(selectedElement.id, 'right')}
                      className="p-1.5 rounded hover:bg-white text-gray-600 transition-colors text-[10px] font-bold"
                      title="Alinhar à direita"
                    >
                      Dir
                    </button>
                    <button
                      onClick={() => onAlignElement(selectedElement.id, 'top')}
                      className="p-1.5 rounded hover:bg-white text-gray-600 transition-colors text-[10px] font-bold"
                      title="Alinhar ao topo"
                    >
                      Topo
                    </button>
                    <button
                      onClick={() => onAlignElement(selectedElement.id, 'center-v')}
                      className="p-1.5 rounded hover:bg-white text-gray-600 transition-colors text-[10px] font-bold text-[#3A6351]"
                      title="Centralizar verticalmente"
                    >
                      Meio
                    </button>
                    <button
                      onClick={() => onAlignElement(selectedElement.id, 'bottom')}
                      className="p-1.5 rounded hover:bg-white text-gray-600 transition-colors text-[10px] font-bold"
                      title="Alinhar à base"
                    >
                      Base
                    </button>
                  </div>
                </div>

                {/* Quick Layer Reordering */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Ordem das Camadas
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onBringForward(selectedElement.id)}
                      className="flex-1 py-1.5 px-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ArrowUpToLine className="w-3.5 h-3.5 text-[#3A6351]" />
                      <span>Trazer pra frente</span>
                    </button>
                    <button
                      onClick={() => onSendBackward(selectedElement.id)}
                      className="flex-1 py-1.5 px-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5 text-gray-500" />
                      <span>Enviar pra trás</span>
                    </button>
                  </div>
                </div>

                {/* ==================================================== */}
                {/* TEXT PROPERTIES                                      */}
                {/* ==================================================== */}
                {selectedElement.type === 'text' && (
                  <div className="space-y-3.5 pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block">
                      Formatação de Texto
                    </span>

                    {/* Font Family */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        Fonte
                      </label>
                      <select
                        value={selectedElement.style.fontFamily || 'sans'}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            style: { ...selectedElement.style, fontFamily: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white"
                      >
                        <option value="sans">Montserrat / Sans (Moderna)</option>
                        <option value="serif">Playfair Display / Serif (Elegante)</option>
                        <option value="mono">Mono / Código</option>
                      </select>
                    </div>

                    {/* Size & Weight */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                          Tamanho ({selectedElement.style.fontSize || 16}px)
                        </label>
                        <input
                          type="range"
                          min="12"
                          max="96"
                          value={selectedElement.style.fontSize || 16}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              style: { ...selectedElement.style, fontSize: Number(e.target.value) },
                            })
                          }
                          className="w-full accent-[#3A6351]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                          Peso
                        </label>
                        <select
                          value={selectedElement.style.fontWeight || 'normal'}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              style: { ...selectedElement.style, fontWeight: e.target.value as any },
                            })
                          }
                          className="w-full px-2 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white"
                        >
                          <option value="normal">Regular</option>
                          <option value="medium">Medium</option>
                          <option value="semibold">Semibold</option>
                          <option value="bold">Bold</option>
                        </select>
                      </div>
                    </div>

                    {/* Text Alignment & Styles (Bold, Italic, Underline) */}
                    <div className="flex items-center justify-between gap-1 bg-gray-50 p-1.5 rounded-xl">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            onUpdateElement(selectedElement.id, {
                              style: { ...selectedElement.style, textAlign: 'left' },
                            })
                          }
                          className={`p-1.5 rounded-lg ${
                            selectedElement.style.textAlign === 'left' || !selectedElement.style.textAlign
                              ? 'bg-white text-[#3A6351] shadow-xs'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            onUpdateElement(selectedElement.id, {
                              style: { ...selectedElement.style, textAlign: 'center' },
                            })
                          }
                          className={`p-1.5 rounded-lg ${
                            selectedElement.style.textAlign === 'center'
                              ? 'bg-white text-[#3A6351] shadow-xs'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            onUpdateElement(selectedElement.id, {
                              style: { ...selectedElement.style, textAlign: 'right' },
                            })
                          }
                          className={`p-1.5 rounded-lg ${
                            selectedElement.style.textAlign === 'right'
                              ? 'bg-white text-[#3A6351] shadow-xs'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="h-4 w-px bg-gray-200" />

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            onUpdateElement(selectedElement.id, {
                              style: {
                                ...selectedElement.style,
                                fontWeight: selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold',
                              },
                            })
                          }
                          className={`p-1.5 rounded-lg ${
                            selectedElement.style.fontWeight === 'bold'
                              ? 'bg-white text-[#3A6351] shadow-xs'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                          title="Negrito"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            onUpdateElement(selectedElement.id, {
                              style: {
                                ...selectedElement.style,
                                fontStyle: selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic',
                              },
                            })
                          }
                          className={`p-1.5 rounded-lg ${
                            selectedElement.style.fontStyle === 'italic'
                              ? 'bg-white text-[#3A6351] shadow-xs'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                          title="Itálico"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            onUpdateElement(selectedElement.id, {
                              style: {
                                ...selectedElement.style,
                                textDecoration:
                                  selectedElement.style.textDecoration === 'underline' ? 'none' : 'underline',
                              },
                            })
                          }
                          className={`p-1.5 rounded-lg ${
                            selectedElement.style.textDecoration === 'underline'
                              ? 'bg-white text-[#3A6351] shadow-xs'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                          title="Sublinhado"
                        >
                          <Underline className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Text Color & Transform */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                          Cor do Texto
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={selectedElement.style.color || '#2C2C2C'}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, {
                                style: { ...selectedElement.style, color: e.target.value },
                              })
                            }
                            className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={selectedElement.style.color || '#2C2C2C'}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, {
                                style: { ...selectedElement.style, color: e.target.value },
                              })
                            }
                            className="flex-1 px-2 py-1 rounded-lg border border-gray-200 text-xs font-mono uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                          Caixa
                        </label>
                        <select
                          value={selectedElement.style.textTransform || 'none'}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              style: { ...selectedElement.style, textTransform: e.target.value as any },
                            })
                          }
                          className="w-full px-2 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white"
                        >
                          <option value="none">Normal</option>
                          <option value="uppercase">MAIÚSCULO</option>
                          <option value="lowercase">minúsculo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================================================== */}
                {/* IMAGE PROPERTIES                                     */}
                {/* ==================================================== */}
                {selectedElement.type === 'image' && (
                  <div className="space-y-3.5 pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block">
                      Formatação de Imagem
                    </span>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        URL da Imagem
                      </label>
                      <input
                        type="text"
                        value={selectedElement.content}
                        onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-700 font-mono"
                      />
                    </div>

                    {/* Fit options: Preencher / Ajustar */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                        Enquadramento
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() =>
                            onUpdateElement(selectedElement.id, {
                              style: { ...selectedElement.style, objectFit: 'cover' },
                            })
                          }
                          className={`py-1.5 rounded-xl text-xs font-semibold ${
                            selectedElement.style.objectFit === 'cover' || !selectedElement.style.objectFit
                              ? 'bg-[#3A6351] text-white'
                              : 'border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          Preencher
                        </button>
                        <button
                          onClick={() =>
                            onUpdateElement(selectedElement.id, {
                              style: { ...selectedElement.style, objectFit: 'contain' },
                            })
                          }
                          className={`py-1.5 rounded-xl text-xs font-semibold ${
                            selectedElement.style.objectFit === 'contain'
                              ? 'bg-[#3A6351] text-white'
                              : 'border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          Ajustar
                        </button>
                      </div>
                    </div>

                    {/* Border Radius */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        Arredondamento dos Cantos ({selectedElement.style.borderRadius || 0}px)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="48"
                        value={selectedElement.style.borderRadius || 0}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            style: { ...selectedElement.style, borderRadius: Number(e.target.value) },
                          })
                        }
                        className="w-full accent-[#3A6351]"
                      />
                    </div>
                  </div>
                )}

                {/* ==================================================== */}
                {/* SHAPE PROPERTIES                                     */}
                {/* ==================================================== */}
                {selectedElement.type === 'shape' && (
                  <div className="space-y-3.5 pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block">
                      Estilo da Forma
                    </span>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        Cor de Preenchimento
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedElement.style.backgroundColor || '#3A6351'}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              style: { ...selectedElement.style, backgroundColor: e.target.value },
                            })
                          }
                          className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={selectedElement.style.backgroundColor || '#3A6351'}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              style: { ...selectedElement.style, backgroundColor: e.target.value },
                            })
                          }
                          className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-mono uppercase"
                        />
                      </div>
                    </div>

                    {selectedElement.style.shapeType !== 'circle' &&
                      selectedElement.style.shapeType !== 'line' && (
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                            Raio dos Cantos ({selectedElement.style.borderRadius || 0}px)
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="36"
                            value={selectedElement.style.borderRadius || 0}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, {
                                style: { ...selectedElement.style, borderRadius: Number(e.target.value) },
                              })
                            }
                            className="w-full accent-[#3A6351]"
                          />
                        </div>
                      )}
                  </div>
                )}

                {/* ==================================================== */}
                {/* ADVANCED ACCORDION ("Mais opções")                   */}
                {/* ==================================================== */}
                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setShowAdvanced((prev) => !prev)}
                    className="w-full flex items-center justify-between text-xs font-bold text-gray-500 hover:text-gray-900 py-1 cursor-pointer"
                  >
                    <span>Mais opções (Posição & Tamanho)</span>
                    {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showAdvanced && (
                    <div className="space-y-3 pt-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold block mb-1">Posição X (%)</label>
                          <input
                            type="number"
                            value={selectedElement.x}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, { x: Number(e.target.value) })
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold block mb-1">Posição Y (%)</label>
                          <input
                            type="number"
                            value={selectedElement.y}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, { y: Number(e.target.value) })
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold block mb-1">Largura (%)</label>
                          <input
                            type="number"
                            value={selectedElement.width}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, { width: Number(e.target.value) })
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold block mb-1">Altura (%)</label>
                          <input
                            type="number"
                            value={selectedElement.height}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, { height: Number(e.target.value) })
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Opacity & Rotation */}
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold block mb-1">
                            Opacidade ({Math.round((selectedElement.opacity !== undefined ? selectedElement.opacity : 1) * 100)}%)
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.05"
                            value={selectedElement.opacity !== undefined ? selectedElement.opacity : 1}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, { opacity: Number(e.target.value) })
                            }
                            className="w-full accent-[#3A6351]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 font-bold block mb-1">
                            Rotação ({selectedElement.rotation || 0}°)
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={selectedElement.rotation || 0}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, { rotation: Number(e.target.value) })
                            }
                            className="w-full accent-[#3A6351]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CAMADAS (LAYERS)                                   */}
        {/* ========================================================= */}
        {activeTab === 'layers' && (
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              Camadas do Slide
            </span>

            {slide.elements.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                Nenhum elemento neste slide ainda. Clique em “+ Adicionar” para começar.
              </p>
            ) : (
              <div className="space-y-1.5">
                {[...slide.elements].reverse().map((el, i) => {
                  const isSelected = selectedElement?.id === el.id;
                  return (
                    <div
                      key={el.id}
                      onClick={() => onSelectElement(el.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-[#3A6351] bg-[#F4F7F5] text-[#3A6351] font-bold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs">
                          {el.type === 'text' && <Type className="w-3.5 h-3.5" />}
                          {el.type === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                          {el.type === 'shape' && <Palette className="w-3.5 h-3.5" />}
                        </span>
                        <span className="text-xs truncate font-medium">
                          {el.name || (el.type === 'text' ? el.content.substring(0, 20) : el.type)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBringForward(el.id);
                          }}
                          className="p-1 hover:bg-gray-200/50 rounded"
                          title="Trazer para frente"
                        >
                          <ArrowUpToLine className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendBackward(el.id);
                          }}
                          className="p-1 hover:bg-gray-200/50 rounded"
                          title="Enviar para trás"
                        >
                          <ArrowDownToLine className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: NOTAS DA PALESTRANTE                               */}
        {/* ========================================================= */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Roteiro & Sugestões
              </span>
              <h3 className="font-serif font-bold text-gray-800 text-sm">
                Notas para a Palestrante
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Essas notas aparecem apenas no Modo Apresentador e na gaveta lateral de notas.
              </p>
            </div>

            {/* Script / Roteiro */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                O que devo falar neste slide? (Script)
              </label>
              <textarea
                rows={5}
                value={slide.notes?.script || ''}
                onChange={(e) =>
                  onUpdateSlideNotes({
                    ...slide.notes,
                    script: e.target.value,
                  })
                }
                placeholder="Escreva as palavras-chave, metáforas ou o texto que você vai falar..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#3A6351]"
              />
            </div>

            {/* Question */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                Pergunta ao público
              </label>
              <input
                type="text"
                value={slide.notes?.question || ''}
                onChange={(e) =>
                  onUpdateSlideNotes({
                    ...slide.notes,
                    question: e.target.value,
                  })
                }
                placeholder="Ex: Vocês já sabem o que querem fazer?"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#3A6351]"
              />
            </div>

            {/* Objective & Suggested Time */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Tempo Sugerido
                </label>
                <input
                  type="text"
                  value={slide.notes?.suggestedTime || ''}
                  onChange={(e) =>
                    onUpdateSlideNotes({
                      ...slide.notes,
                      suggestedTime: e.target.value,
                    })
                  }
                  placeholder="Ex: 2 - 3 minutos"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Objetivo
                </label>
                <input
                  type="text"
                  value={slide.notes?.objective || ''}
                  onChange={(e) =>
                    onUpdateSlideNotes({
                      ...slide.notes,
                      objective: e.target.value,
                    })
                  }
                  placeholder="Ex: Quebrar o gelo"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
