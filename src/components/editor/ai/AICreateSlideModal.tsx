import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Type,
  FileText,
  Image as ImageIcon,
  Columns,
  List,
  Clock,
  HelpCircle,
  Quote,
  Hash,
  LayoutGrid,
  CheckCircle2,
  Edit3,
  Loader2,
} from 'lucide-react';

interface AICreateSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSlide: (slideType: string, customPrompt: string) => Promise<void>;
  isLoading?: boolean;
}

export const AICreateSlideModal: React.FC<AICreateSlideModalProps> = ({
  isOpen,
  onClose,
  onCreateSlide,
  isLoading = false,
}) => {
  const [selectedType, setSelectedType] = useState<string>('Comparação');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  if (!isOpen) return null;

  const slideTypes = [
    { id: 'Título', icon: Type, label: 'Título Impactante', desc: 'Abertura marcante com subtítulo nobre' },
    { id: 'Texto', icon: FileText, label: 'Texto & Narrativa', desc: 'História com tipografia arejada e legível' },
    { id: 'Imagem', icon: ImageIcon, label: 'Imagem & Composição', desc: 'Visual 50/50 com fotografia de destaque' },
    { id: 'Comparação', icon: Columns, label: 'Comparação / Antes & Depois', desc: 'Dois cards comparando expectativas vs realidade' },
    { id: 'Lista', icon: List, label: 'Lista de Pontos-Chave', desc: 'Tópicos concisos estruturados com ícones' },
    { id: 'Timeline', icon: Clock, label: 'Linha do Tempo', desc: 'Etapas sequenciais da formação ao mercado' },
    { id: 'Pergunta', icon: HelpCircle, label: 'Pergunta Interativa', desc: 'Pergunta provocativa para engajar os jovens' },
    { id: 'Citação', icon: Quote, label: 'Citação / Frase Marcante', desc: 'Reflexão inspiradora centralizada' },
    { id: 'Números', icon: Hash, label: 'Números & Estatísticas', desc: 'Métricas de mercado em destaque visual' },
    { id: 'Cards', icon: LayoutGrid, label: 'Grade de Cards', desc: 'Blocos conceituais lado a lado' },
    { id: 'Encerramento', icon: CheckCircle2, label: 'Encerramento / Chamada', desc: 'Conclusão, contato e Instagram' },
    { id: 'Personalizado', icon: Edit3, label: 'Slide Personalizado', desc: 'Descreva livremente o que você deseja' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    await onCreateSlide(selectedType, customPrompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn select-none">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#F4F7F5] text-[#3A6351] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#E3B04B]" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-gray-900">
                Criar Novo Slide com IA
              </h3>
              <p className="text-[11px] text-gray-500 font-sans">
                Que tipo de slide você quer criar?
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Options Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {slideTypes.map((t) => {
              const Icon = t.icon;
              const isSelected = selectedType === t.id;

              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#3A6351] bg-[#3A6351]/5 ring-2 ring-[#3A6351]/20 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#3A6351] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#3A6351]" />
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-gray-800 block">
                      {t.label}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5 line-clamp-2">
                      {t.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Prompt field (always or for personalized) */}
          <div className="pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
              {selectedType === 'Personalizado'
                ? 'Descreva o slide que você quer:'
                : 'Instruções ou detalhes adicionais (Opcional):'}
            </label>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={
                selectedType === 'Personalizado'
                  ? 'Ex.: Um slide explicando a diferença entre farmácia hospitalar e farmácia estética, com 2 cards ilustrados...'
                  : 'Ex.: Foco no público de 16 anos que ainda tem medo de errar na escolha...'
              }
              className="w-full px-3 py-2.5 rounded-2xl border border-gray-200 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A6351]/20 focus:border-[#3A6351] font-sans"
            />
          </div>

          {/* Footer inside form */}
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
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-[#3A6351] hover:bg-[#2e5041] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Criando slide…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#E3B04B]" />
                  <span>Criar com IA</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
