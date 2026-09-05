import React, { useState } from 'react';
import { Presentation, VisualIdentity } from '../../../types';
import { Palette, Check, Sparkles, Wand2, Loader2, ArrowRight } from 'lucide-react';
import { detectIdentityWithAI } from '../../../services/aiService';

interface AIVisualIdentityProps {
  presentation: Presentation;
  onApplyIdentityToAllSlides: (identity: VisualIdentity) => void;
}

export const AIVisualIdentity: React.FC<AIVisualIdentityProps> = ({
  presentation,
  onApplyIdentityToAllSlides,
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedIdentity, setDetectedIdentity] = useState<VisualIdentity | null>(
    presentation.visualIdentity || {
      primaryColor: '#3A6351',
      secondaryColor: '#E3B04B',
      accentColor: '#C87D55',
      backgroundColor: '#FDFBF7',
      headingFont: 'Playfair Display, serif',
      bodyFont: 'Montserrat, sans-serif',
      cardStyle: 'rounded',
      imageStyle: 'shadow',
    }
  );
  const [hasApplied, setHasApplied] = useState(false);

  const handleDetect = async () => {
    setIsDetecting(true);
    try {
      const res = await detectIdentityWithAI(presentation);
      setDetectedIdentity(res.visualIdentity);
    } catch (err: any) {
      console.error('Detection failed:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleApply = () => {
    if (!detectedIdentity) return;
    onApplyIdentityToAllSlides(detectedIdentity);
    setHasApplied(true);
    setTimeout(() => setHasApplied(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Overview Card */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[#3A6351]" />
              <span>Identidade Visual da Apresentação</span>
            </h4>
            <p className="text-xs text-gray-500 font-sans mt-0.5">
              Padroniza paleta cromática, tipografia e estilo de cards em toda a apresentação.
            </p>
          </div>

          <button
            onClick={handleDetect}
            disabled={isDetecting}
            className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            {isDetecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3A6351]" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-[#3A6351]" />
            )}
            <span>Analisar</span>
          </button>
        </div>

        {detectedIdentity && (
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Identidade Detectada
            </span>

            {/* Colors */}
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <div
                  className="w-full h-7 rounded-lg mx-auto mb-1 border border-black/10 shadow-2xs"
                  style={{ backgroundColor: detectedIdentity.primaryColor }}
                />
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Primária</span>
                <span className="text-[10px] font-mono text-gray-700 font-bold">{detectedIdentity.primaryColor}</span>
              </div>

              <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <div
                  className="w-full h-7 rounded-lg mx-auto mb-1 border border-black/10 shadow-2xs"
                  style={{ backgroundColor: detectedIdentity.secondaryColor }}
                />
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Secundária</span>
                <span className="text-[10px] font-mono text-gray-700 font-bold">{detectedIdentity.secondaryColor}</span>
              </div>

              <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <div
                  className="w-full h-7 rounded-lg mx-auto mb-1 border border-black/10 shadow-2xs"
                  style={{ backgroundColor: detectedIdentity.accentColor }}
                />
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Destaque</span>
                <span className="text-[10px] font-mono text-gray-700 font-bold">{detectedIdentity.accentColor}</span>
              </div>

              <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <div
                  className="w-full h-7 rounded-lg mx-auto mb-1 border border-black/10 shadow-2xs"
                  style={{ backgroundColor: detectedIdentity.backgroundColor }}
                />
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Fundo</span>
                <span className="text-[10px] font-mono text-gray-700 font-bold">{detectedIdentity.backgroundColor}</span>
              </div>
            </div>

            {/* Typography */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">
                  Fonte de Títulos
                </span>
                <p className="font-serif font-bold text-gray-800 truncate">
                  Playfair Display (Serif)
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">
                  Fonte de Corpo / Cards
                </span>
                <p className="font-sans font-medium text-gray-800 truncate">
                  Montserrat (Sans-serif)
                </p>
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-2">
              <button
                onClick={handleApply}
                className="w-full py-2.5 px-4 rounded-xl bg-[#3A6351] hover:bg-[#2e5041] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                {hasApplied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Identidade aplicada a todos os slides!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E3B04B]" />
                    <span>Aplicar a todos os slides ({presentation.slides.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
