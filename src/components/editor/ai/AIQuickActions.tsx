import React from 'react';
import {
  Sparkles,
  LayoutTemplate,
  FileText,
  Image as ImageIcon,
  Type,
  Maximize2,
  CheckCircle2,
  Columns,
} from 'lucide-react';

interface AIQuickActionsProps {
  onSelectPrompt: (prompt: string, autoRun?: boolean) => void;
  mode: 'edit' | 'create';
}

export const AIQuickActions: React.FC<AIQuickActionsProps> = ({ onSelectPrompt, mode }) => {
  const editSuggestions = [
    { label: 'Deixar mais moderno', prompt: 'Deixe este slide mais moderno, arejado e elegante com proporções profissionais', icon: Sparkles },
    { label: 'Melhorar design', prompt: 'Melhore a hierarquia visual, o contraste e o alinhamento de todos os elementos', icon: LayoutTemplate },
    { label: 'Resumir texto', prompt: 'Resuma o texto deste slide em tópicos concisos e fáceis de ler', icon: FileText },
    { label: 'Organizar em cards', prompt: 'Organize o conteúdo principal em cards visuais lado a lado', icon: Columns },
    { label: 'Imagem à direita', prompt: 'Ajuste a composição para 50/50 com imagem elegante à direita e texto à esquerda', icon: ImageIcon },
    { label: 'Criar título forte', prompt: 'Crie um título mais curto, inspirador e impactante no formato TED Talk', icon: Type },
    { label: 'Tornar mais impactante', prompt: 'Torne este slide mais memorável com destaque visual nas informações-chave', icon: Maximize2 },
    { label: 'Corrigir e polir texto', prompt: 'Revise o texto, corrija possíveis erros gramaticais e aprimore a pontuação', icon: CheckCircle2 },
  ];

  const createSuggestions = [
    { label: 'Slide de Comparação', prompt: 'Crie um slide comparando expectativas vs realidade da profissão', icon: Columns },
    { label: 'Slide com Citação', prompt: 'Crie um slide com uma citação marcante e inspiradora sobre escolher o próprio futuro', icon: Type },
    { label: 'Slide de Linha do Tempo', prompt: 'Crie um slide de linha do tempo mostrando os 4 passos da formação à clínica', icon: LayoutTemplate },
    { label: 'Slide de Pergunta Interativa', prompt: 'Crie um slide com uma pergunta forte para engajar a plateia de alunos', icon: Sparkles },
    { label: 'Slide de Estatísticas/Números', prompt: 'Crie um slide destacando 3 grandes números sobre o mercado de trabalho', icon: Maximize2 },
    { label: 'Slide de Encerramento', prompt: 'Crie um slide final de agradecimento com contato, Instagram e mensagem de incentivo', icon: CheckCircle2 },
  ];

  const suggestions = mode === 'edit' ? editSuggestions : createSuggestions;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Sugestões rápidas
        </span>
        <span className="text-[10px] text-gray-400 font-sans">1 clique para aplicar</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => onSelectPrompt(item.prompt, true)}
              className="px-2.5 py-1.5 rounded-xl bg-gray-50 hover:bg-[#3A6351]/10 text-gray-700 hover:text-[#3A6351] border border-gray-200/80 hover:border-[#3A6351]/30 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer group shadow-2xs text-left"
              title={item.prompt}
            >
              <Icon className="w-3 h-3 text-[#E3B04B] group-hover:scale-110 transition-transform shrink-0" />
              <span className="whitespace-nowrap font-sans">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
