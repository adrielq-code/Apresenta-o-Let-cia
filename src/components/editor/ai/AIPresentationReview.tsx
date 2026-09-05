import React, { useState } from 'react';
import { Presentation, AISlideReviewItem } from '../../../types';
import {
  FileSearch,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { reviewPresentationWithAI } from '../../../services/aiService';

interface AIPresentationReviewProps {
  presentation: Presentation;
  onGoToSlide: (index: number) => void;
  onApplySlideFix: (slideIndex: number, prompt: string) => void;
}

export const AIPresentationReview: React.FC<AIPresentationReviewProps> = ({
  presentation,
  onGoToSlide,
  onApplySlideFix,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewResult, setReviewResult] = useState<{
    summary: string;
    overallScore: number;
    reviewItems: AISlideReviewItem[];
  } | null>(null);

  const handleRunAudit = async () => {
    setIsAnalyzing(true);
    try {
      const res = await reviewPresentationWithAI(presentation);
      setReviewResult(res);
    } catch (err: any) {
      console.error('Audit failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header card with Action */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
              <FileSearch className="w-4 h-4 text-[#3A6351]" />
              <span>Auditoria Global da Apresentação</span>
            </h4>
            <p className="text-xs text-gray-500 font-sans mt-0.5">
              Analisa excesso de texto, consistência visual, alinhamento e ritmo narrativo.
            </p>
          </div>

          <button
            onClick={handleRunAudit}
            disabled={isAnalyzing}
            className="px-3.5 py-2 rounded-xl bg-[#3A6351] hover:bg-[#2e5041] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analisando…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#E3B04B]" />
                <span>Analisar Tudo</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Review Suggestions */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
          <button
            onClick={() => handleRunAudit()}
            className="px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-[11px] text-gray-600 border border-gray-200 flex items-center gap-1"
          >
            <span>✨ Encontrar excesso de texto</span>
          </button>
          <button
            onClick={() => handleRunAudit()}
            className="px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-[11px] text-gray-600 border border-gray-200 flex items-center gap-1"
          >
            <span>✨ Verificar consistência de fontes</span>
          </button>
          <button
            onClick={() => handleRunAudit()}
            className="px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-[11px] text-gray-600 border border-gray-200 flex items-center gap-1"
          >
            <span>✨ Otimizar ritmo narrativo</span>
          </button>
        </div>
      </div>

      {/* Review Results */}
      {reviewResult && (
        <div className="space-y-3 animate-fadeIn">
          {/* Score card */}
          <div className="p-3.5 bg-gradient-to-r from-[#F4F7F5] to-white rounded-2xl border border-[#3A6351]/25 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Pontuação Geral TED-Ready
              </span>
              <p className="text-xs text-gray-700 font-sans mt-0.5 max-w-xs">
                {reviewResult.summary}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#3A6351]/30 flex flex-col items-center justify-center shadow-xs">
              <span className="text-lg font-mono font-extrabold text-[#3A6351]">
                {reviewResult.overallScore}
              </span>
              <span className="text-[9px] text-gray-400 font-sans uppercase">/100</span>
            </div>
          </div>

          {/* List of items */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Oportunidades de Melhoria ({reviewResult.reviewItems.length})
            </span>

            {reviewResult.reviewItems.length === 0 ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Excelente! Todos os seus slides estão calibrados e visualmente equilibrados.</span>
              </div>
            ) : (
              reviewResult.reviewItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white rounded-xl border border-gray-200 hover:border-[#3A6351]/40 transition-colors shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold font-mono">
                        Slide #{item.slideIndex + 1}: {item.slideTitle}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          item.severity === 'high'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.severity === 'high' ? 'Alta relevância' : 'Moderada'}
                      </span>
                    </div>

                    <button
                      onClick={() => onGoToSlide(item.slideIndex)}
                      className="text-[10px] font-bold text-[#3A6351] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Ver slide</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-700 font-sans">{item.description}</p>
                  <p className="text-[11px] text-gray-500 italic font-sans">
                    💡 Recomendação: {item.recommendation}
                  </p>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        onGoToSlide(item.slideIndex);
                        onApplySlideFix(item.slideIndex, item.suggestedActionName);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-[#3A6351]/10 hover:bg-[#3A6351]/20 text-[#3A6351] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#E3B04B]" />
                      <span>{item.suggestedActionName}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
