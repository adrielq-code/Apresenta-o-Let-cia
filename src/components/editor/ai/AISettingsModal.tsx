import React from 'react';
import { AISettings } from '../../../types';
import { Settings2, X, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSaveSettings: (newSettings: AISettings) => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [current, setCurrent] = React.useState<AISettings>(settings);

  React.useEffect(() => {
    setCurrent(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn select-none">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F4F7F5] text-[#3A6351] flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 font-serif">
                Configurações da IA
              </h3>
              <p className="text-[11px] text-gray-500 font-sans">
                Parâmetros de geração e estilo
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
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Model */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
              Modelo de Inteligência Artificial
            </label>
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 font-mono block">
                  gemini-3.8-flash (Recomendado)
                </span>
                <span className="text-[11px] text-gray-500 font-sans">
                  Alta velocidade, precisão em layouts 16:9 e raciocínio textual
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                ATIVO
              </span>
            </div>
          </div>

          {/* Creativity Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Nível de Criatividade
              </label>
              <span className="text-xs font-bold text-[#3A6351]">
                {current.temperature <= 0.3
                  ? 'Baixa (Precisa / Fiel)'
                  : current.temperature <= 0.6
                  ? 'Média (Equilibrada)'
                  : 'Alta (Mais ousada)'}
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.8"
              step="0.1"
              value={current.temperature}
              onChange={(e) =>
                setCurrent({ ...current, temperature: parseFloat(e.target.value) })
              }
              className="w-full accent-[#3A6351] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
              <span>0.2 Precisa</span>
              <span>0.5 Média</span>
              <span>0.8 Ousada</span>
            </div>
          </div>

          {/* Style Preset */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
              Estilo da Apresentação
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'ted_talk', label: 'TED Talk / Keynote', desc: 'Inspirador, tipografia nobre' },
                { id: 'modern_minimal', label: 'Minimalista', desc: 'Arejado, limpo e direto' },
                { id: 'executive', label: 'Executivo', desc: 'Sóbrio, estruturado em dados' },
                { id: 'bold_creative', label: 'Jovem & Dinâmico', desc: 'Cores vivas, contraste alto' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() =>
                    setCurrent({ ...current, stylePreset: style.id as any })
                  }
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    current.stylePreset === style.id
                      ? 'border-[#3A6351] bg-[#3A6351]/5 ring-1 ring-[#3A6351]'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="text-xs font-bold text-gray-800 block">
                    {style.label}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    {style.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preserve Locked Elements Toggle */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3A6351]" />
              <div>
                <span className="text-xs font-bold text-gray-800 block">
                  Preservar Elementos Bloqueados
                </span>
                <span className="text-[11px] text-gray-400 font-sans">
                  A IA nunca altera posição ou estilo de elementos com cadeado
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={current.preserveLocked}
              onChange={(e) =>
                setCurrent({ ...current, preserveLocked: e.target.checked })
              }
              className="w-4 h-4 accent-[#3A6351] rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-white text-gray-600 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#3A6351] hover:bg-[#2e5041] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Salvar Ajustes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
