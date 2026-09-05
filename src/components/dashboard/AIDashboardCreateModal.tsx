import React, { useState } from 'react';
import { Sparkles, X, Loader2, Layers, BookOpen, Users, Compass } from 'lucide-react';
import { generatePresentationWithAI } from '../../services/aiService';
import { Presentation } from '../../types';

interface AIDashboardCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPresentationCreated: (presentation: Presentation) => void;
}

export const AIDashboardCreateModal: React.FC<AIDashboardCreateModalProps> = ({
  isOpen,
  onClose,
  onPresentationCreated,
}) => {
  const [prompt, setPrompt] = useState('');
  const [slideCount, setSlideCount] = useState<number>(8);
  const [tone, setTone] = useState<string>('TED Talk Inspirador');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    'Palestra de 8 slides para jovens de 15 a 17 anos: Como escolher sua carreira na área da saúde',
    'Palestra interativa sobre Farmácia Estética e Empreendedorismo para ensino médio',
    'Da Faculdade ao Mercado de Trabalho: Guia prático de primeiros passos profissionais',
    'Superando o medo do vestibular e escolhendo seu futuro com autonomia',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await generatePresentationWithAI({
        prompt: prompt.trim(),
        slideCount,
        tone,
      });

      const uniqueCode = `AP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const newPresentation: Presentation = {
        id: `pres-${Date.now()}`,
        code: uniqueCode,
        title: res.title || 'Apresentação Gerada por IA',
        description: res.description || 'Criada com Assistente de IA no formato Keynote 16:9.',
        format: '16:9',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isTemplate: false,
        slides: res.slides,
        visualIdentity: res.visualIdentity,
      };

      onPresentationCreated(newPresentation);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao criar apresentação com IA');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn select-none">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3A6351] to-[#244234] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-[#E3B04B]" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-gray-900">
                Criar Apresentação com IA
              </h3>
              <p className="text-xs text-gray-500 font-sans">
                A IA estruturará títulos, layouts e notas de apresentação em 16:9
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Main Prompt */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
              O que você quer criar?
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex.: Quero criar uma palestra de 8 slides para alunos do ensino médio sobre profissões da área da saúde e empreendedorismo..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A6351]/20 focus:border-[#3A6351] font-sans"
              required
            />
          </div>

          {/* Quick Prompts */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
              Ideias para começar
            </span>
            <div className="flex flex-col gap-1.5">
              {quickPrompts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setPrompt(q)}
                  className="text-left px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-[#3A6351]/5 border border-gray-200/80 hover:border-[#3A6351]/30 text-xs text-gray-600 hover:text-[#3A6351] transition-colors cursor-pointer"
                >
                  ✨ {q}
                </button>
              ))}
            </div>
          </div>

          {/* Slide Count & Tone */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                Quantidade de Slides
              </label>
              <select
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A6351]/20 focus:border-[#3A6351]"
              >
                <option value={5}>5 slides (Apresentação Rápida)</option>
                <option value={8}>8 slides (Padrão Recomendado)</option>
                <option value={10}>10 slides (Completa)</option>
                <option value={12}>12 slides (Aprofundada)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                Tom da Apresentação
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A6351]/20 focus:border-[#3A6351]"
              >
                <option value="TED Talk Inspirador">TED Talk Inspirador</option>
                <option value="Educativo & Prático">Educativo & Prático</option>
                <option value="Jovem & Descontraído">Jovem & Descontraído</option>
                <option value="Executivo & Sóbrio">Executivo & Sóbrio</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3A6351] to-[#244234] hover:from-[#2e5041] hover:to-[#1a3025] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#3A6351]/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#E3B04B]" />
                  <span>Gerando Apresentação…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E3B04B]" />
                  <span>Gerar Apresentação</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
