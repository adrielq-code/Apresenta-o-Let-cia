import React, { useState, useRef, useEffect } from 'react';
import {
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Minus,
  Quote,
  Hash,
  Upload,
  Plus,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { SlideElementType, SlideElementStyle } from '../../types';

interface Props {
  onAddText: (type: 'title' | 'subtitle' | 'body' | 'free') => void;
  onAddImage: (imageUrl: string) => void;
  onAddShape: (shapeType: 'rectangle' | 'circle' | 'rounded-box' | 'line' | 'divider') => void;
  onAddNumber: () => void;
  onAddQuote: () => void;
  presentationImages?: string[];
}

export const AddElementDropdown: React.FC<Props> = ({
  onAddText,
  onAddImage,
  onAddShape,
  onAddNumber,
  onAddQuote,
  presentationImages = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'text' | 'image' | 'shape' | 'more' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle local file upload (JPG, PNG, WEBP)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      if (dataUrl) {
        onAddImage(dataUrl);
        setIsOpen(false);
        setActiveCategory(null);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Hidden file input for image uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-3.5 py-2 rounded-xl bg-[#3A6351] hover:bg-[#2e5041] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>+ Adicionar</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-11 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-fade-in">
          {/* Quick Categories Bar */}
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1 mb-1">
            Escolha um elemento
          </div>

          {/* TEXT OPTION */}
          <div className="space-y-0.5 mb-2">
            <button
              onClick={() => {
                onAddText('title');
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-gray-800 hover:bg-[#F4F7F5] hover:text-[#3A6351] flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Type className="w-4 h-4 text-[#3A6351]" />
              <div>
                <span className="block font-bold">Adicionar título</span>
                <span className="block text-[10px] text-gray-400 font-normal">Texto de destaque 52px</span>
              </div>
            </button>

            <button
              onClick={() => {
                onAddText('subtitle');
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-gray-800 hover:bg-[#F4F7F5] hover:text-[#3A6351] flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Type className="w-3.5 h-3.5 text-gray-500" />
              <div>
                <span className="block font-bold">Adicionar subtítulo</span>
                <span className="block text-[10px] text-gray-400 font-normal">Texto secundário 24px</span>
              </div>
            </button>

            <button
              onClick={() => {
                onAddText('body');
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-gray-800 hover:bg-[#F4F7F5] hover:text-[#3A6351] flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Type className="w-3 h-3 text-gray-400" />
              <div>
                <span className="block">Adicionar texto (Parágrafo)</span>
                <span className="block text-[10px] text-gray-400 font-normal">Texto corrido 16px</span>
              </div>
            </button>

            <button
              onClick={() => {
                onAddText('free');
                setIsOpen(false);
              }}
              className="w-full px-3 py-1.5 rounded-xl text-left text-xs font-medium text-gray-600 hover:bg-[#F4F7F5] hover:text-[#3A6351] flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Type className="w-3 h-3 text-gray-400" />
              <span>Adicionar texto livre</span>
            </button>
          </div>

          <div className="border-t border-gray-100 my-1" />

          {/* IMAGE OPTION */}
          <div className="space-y-0.5 mb-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-gray-800 hover:bg-[#F4F7F5] hover:text-[#3A6351] flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#3A6351]" />
              <div>
                <span className="block font-bold">Enviar imagem</span>
                <span className="block text-[10px] text-gray-400 font-normal">JPG, PNG ou WEBP do seu computador</span>
              </div>
            </button>

            {/* Presentation image library */}
            {presentationImages.length > 0 && (
              <div className="px-3 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Imagens usadas nesta apresentação
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {presentationImages.slice(0, 4).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Thumbnail"
                      onClick={() => {
                        onAddImage(img);
                        setIsOpen(false);
                      }}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200 hover:border-[#3A6351] cursor-pointer hover:scale-105 transition-all"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 my-1" />

          {/* SHAPES OPTION */}
          <div className="px-3 py-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
              Formas & Linhas
            </span>
            <div className="grid grid-cols-5 gap-1 text-center">
              <button
                onClick={() => {
                  onAddShape('rectangle');
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl hover:bg-[#F4F7F5] flex flex-col items-center justify-center text-gray-600 hover:text-[#3A6351] transition-colors cursor-pointer"
                title="Retângulo"
              >
                <Square className="w-4 h-4" />
                <span className="text-[9px] mt-1">Retângulo</span>
              </button>

              <button
                onClick={() => {
                  onAddShape('circle');
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl hover:bg-[#F4F7F5] flex flex-col items-center justify-center text-gray-600 hover:text-[#3A6351] transition-colors cursor-pointer"
                title="Círculo"
              >
                <Circle className="w-4 h-4" />
                <span className="text-[9px] mt-1">Círculo</span>
              </button>

              <button
                onClick={() => {
                  onAddShape('rounded-box');
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl hover:bg-[#F4F7F5] flex flex-col items-center justify-center text-gray-600 hover:text-[#3A6351] transition-colors cursor-pointer"
                title="Caixa arredondada"
              >
                <Square className="w-4 h-4 rounded-md" />
                <span className="text-[9px] mt-1">Arredond.</span>
              </button>

              <button
                onClick={() => {
                  onAddShape('line');
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl hover:bg-[#F4F7F5] flex flex-col items-center justify-center text-gray-600 hover:text-[#3A6351] transition-colors cursor-pointer"
                title="Linha"
              >
                <Minus className="w-4 h-4" />
                <span className="text-[9px] mt-1">Linha</span>
              </button>

              <button
                onClick={() => {
                  onAddShape('divider');
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl hover:bg-[#F4F7F5] flex flex-col items-center justify-center text-gray-600 hover:text-[#3A6351] transition-colors cursor-pointer"
                title="Divisor"
              >
                <Minus className="w-4 h-4 stroke-[3]" />
                <span className="text-[9px] mt-1">Divisor</span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 my-1" />

          {/* NUMBER & QUOTE */}
          <div className="grid grid-cols-2 gap-1 px-1">
            <button
              onClick={() => {
                onAddNumber();
                setIsOpen(false);
              }}
              className="px-3 py-2 rounded-xl text-left text-xs font-semibold text-gray-700 hover:bg-[#F4F7F5] hover:text-[#3A6351] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Hash className="w-4 h-4 text-[#3A6351]" />
              <span>Número / Métrica</span>
            </button>

            <button
              onClick={() => {
                onAddQuote();
                setIsOpen(false);
              }}
              className="px-3 py-2 rounded-xl text-left text-xs font-semibold text-gray-700 hover:bg-[#F4F7F5] hover:text-[#3A6351] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Quote className="w-4 h-4 text-[#3A6351]" />
              <span>Citação</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
