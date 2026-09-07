import React, { useState } from 'react';
import {
  EditorSlide,
  Presentation,
  AIAssistantAction,
  VisualIdentity,
  AISettings,
} from '../../../types';
import {
  Sparkles,
  X,
  Settings2,
  Palette,
  FileSearch,
  MessageSquare,
  Layout,
  PlusCircle,
  History,
  Lock,
  Undo2,
  Check,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { AICommandInput } from './AICommandInput';
import { AIQuickActions } from './AIQuickActions';
import { AIPreview } from './AIPreview';
import { AIHistory } from './AIHistory';
import { AIChat } from './AIChat';
import { AIPresentationReview } from './AIPresentationReview';
import { AIVisualIdentity } from './AIVisualIdentity';
import { AISettingsModal } from './AISettingsModal';
import { editSlideWithAI, createSlideWithAI, defaultAISettings } from '../../../services/aiService';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  slide: EditorSlide;
  slideIndex: number;
  presentation: Presentation;
  onApplySlideEdit: (updatedSlide: EditorSlide, description: string) => void;
  onAddNewSlide: (newSlide: EditorSlide) => void;
  onUndoLastAction?: () => void;
  canUndo?: boolean;
  onGoToSlide: (index: number) => void;
  onApplyIdentityToAll: (identity: VisualIdentity) => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  isOpen,
  onClose,
  slide,
  slideIndex,
  presentation,
  onApplySlideEdit,
  onAddNewSlide,
  onUndoLastAction,
  canUndo = false,
  onGoToSlide,
  onApplyIdentityToAll,
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'create' | 'review' | 'copilot' | 'identity'>('edit');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview state for staged modifications
  const [previewData, setPreviewData] = useState<{
    originalSlide: EditorSlide;
    previewSlide: EditorSlide;
    explanation: string;
    actionsTaken?: string[];
    isNewSlide?: boolean;
  } | null>(null);

  // Session History
  const [history, setHistory] = useState<AIAssistantAction[]>([]);

  // Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AISettings>(defaultAISettings);

  // Success feedback toast
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const lockedElementsCount = slide.elements.filter((e) => e.locked).length;

  const handleGenerate = async (customPromptText?: string) => {
    const textToRun = customPromptText || prompt;
    if (!textToRun.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    try {
      if (activeTab === 'create') {
        // Create new slide
        const res = await createSlideWithAI({
          prompt: textToRun.trim(),
          slideType: 'personalizado',
          afterSlideIndex: slideIndex,
          presentationContext: {
            presentationTitle: presentation.title,
            totalSlides: presentation.slides.length,
            currentSlide: { title: slide.title },
            visualIdentity: presentation.visualIdentity,
          },
          settings,
        });

        setPreviewData({
          originalSlide: slide,
          previewSlide: res.newSlide,
          explanation: res.explanation,
          isNewSlide: true,
        });
      } else {
        // Edit current slide
        const previousSlide = slideIndex > 0 ? presentation.slides[slideIndex - 1] : undefined;
        const nextSlide = slideIndex < presentation.slides.length - 1 ? presentation.slides[slideIndex + 1] : undefined;

        const res = await editSlideWithAI({
          prompt: textToRun.trim(),
          slide: slide,
          presentationContext: {
            presentationTitle: presentation.title,
            slideIndex,
            totalSlides: presentation.slides.length,
            previousSlide: previousSlide ? { title: previousSlide.title, subtitle: previousSlide.subtitle } : undefined,
            nextSlide: nextSlide ? { title: nextSlide.title, subtitle: nextSlide.subtitle } : undefined,
            visualIdentity: presentation.visualIdentity,
          },
          settings,
        });

        setPreviewData({
          originalSlide: slide,
          previewSlide: res.updatedSlide,
          explanation: res.explanation,
          actionsTaken: res.actionsTaken,
          isNewSlide: false,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao processar com a IA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreview = () => {
    if (!previewData) return;

    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (previewData.isNewSlide) {
      onAddNewSlide(previewData.previewSlide);
      setHistory((prev) => [
        {
          id: `hist-${Date.now()}`,
          timestamp: now,
          type: 'create-slide',
          description: `Criado slide "${previewData.previewSlide.title}"`,
          prompt: prompt || 'Criar novo slide',
        },
        ...prev,
      ]);
      setAppliedToast('Novo slide adicionado com sucesso!');
    } else {
      onApplySlideEdit(previewData.previewSlide, prompt || 'Melhoria de design por IA');
      setHistory((prev) => [
        {
          id: `hist-${Date.now()}`,
          timestamp: now,
          type: 'edit-slide',
          description: previewData.explanation,
          slideId: slide.id,
          slideIndex,
          prompt: prompt || 'Otimização com IA',
          previousSlideState: previewData.originalSlide,
        },
        ...prev,
      ]);
      setAppliedToast('Alterações da IA aplicadas no slide!');
    }

    setPreviewData(null);
    setPrompt('');

    setTimeout(() => {
      setAppliedToast(null);
    }, 4000);
  };

  const handleRestoreAction = (action: AIAssistantAction) => {
    if (action.previousSlideState) {
      onApplySlideEdit(action.previousSlideState, `Restaurar versão: ${action.timestamp}`);
      setAppliedToast('Slide restaurado para a versão anterior!');
      setTimeout(() => setAppliedToast(null), 4000);
    }
  };

  return (
    <>
      <aside
        id="ai-assistant-panel"
        className="w-full h-full bg-white border-l border-gray-200 flex flex-col shrink-0 shadow-2xl z-40 animate-slideLeft select-none"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-white via-[#F4F7F5]/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3A6351] to-[#244234] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-[#E3B04B]" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-gray-900 flex items-center gap-1.5">
                <span>Assistente de IA</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#3A6351]/10 text-[#3A6351]">
                  PRO
                </span>
              </h3>
              <p className="text-[11px] text-gray-500 font-sans">
                Designer & Redator de Apresentações
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              title="Configurações da IA"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              title="Fechar painel da IA"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Slide Context Pill */}
        <div className="px-4 py-2 bg-[#F8FAF9] border-b border-gray-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-gray-600 truncate">
            <span className="w-2 h-2 rounded-full bg-[#3A6351]" />
            <span className="font-bold text-[#3A6351] whitespace-nowrap">
              Slide #{slideIndex + 1}:
            </span>
            <span className="truncate text-gray-700">{slide.title || 'Sem título'}</span>
          </div>

          {lockedElementsCount > 0 && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0"
              title={`${lockedElementsCount} elemento(s) bloqueado(s) e protegido(s) da IA`}
            >
              <Lock className="w-2.5 h-2.5" />
              <span>{lockedElementsCount} protegido</span>
            </span>
          )}
        </div>

        {/* Primary Modes Segmented Tabs */}
        <div className="p-3 border-b border-gray-100 bg-white">
          <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100/90 rounded-2xl text-[11px] font-bold uppercase tracking-wider">
            <button
              id="ai-tab-edit-slide"
              onClick={() => {
                setActiveTab('edit');
                setPreviewData(null);
              }}
              className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer truncate ${
                activeTab === 'edit'
                  ? 'bg-white text-[#3A6351] shadow-xs font-extrabold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Editar
            </button>

            <button
              id="ai-tab-create-slide"
              onClick={() => {
                setActiveTab('create');
                setPreviewData(null);
              }}
              className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer truncate ${
                activeTab === 'create'
                  ? 'bg-white text-[#3A6351] shadow-xs font-extrabold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Novo
            </button>

            <button
              id="ai-tab-review-pres"
              onClick={() => {
                setActiveTab('review');
                setPreviewData(null);
              }}
              className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer truncate ${
                activeTab === 'review'
                  ? 'bg-white text-[#3A6351] shadow-xs font-extrabold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Auditoria
            </button>

            <button
              id="ai-tab-copilot"
              onClick={() => {
                setActiveTab('copilot');
                setPreviewData(null);
              }}
              className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer truncate ${
                activeTab === 'copilot'
                  ? 'bg-white text-[#3A6351] shadow-xs font-extrabold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Copiloto
            </button>
          </div>
        </div>

        {/* Applied Notification Toast with Undo */}
        {appliedToast && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-[#3A6351] text-white flex items-center justify-between text-xs shadow-md animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#E3B04B]" />
              <span className="font-medium">{appliedToast}</span>
            </div>
            {canUndo && onUndoLastAction && (
              <button
                onClick={onUndoLastAction}
                className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Undo2 className="w-3 h-3" />
                <span>Desfazer</span>
              </button>
            )}
          </div>
        )}

        {/* Main Panel Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* EDIT & CREATE MODES */}
          {(activeTab === 'edit' || activeTab === 'create') && (
            <>
              {/* If preview data is active, show the Preview card */}
              {previewData ? (
                <AIPreview
                  originalSlide={previewData.originalSlide}
                  previewSlide={previewData.previewSlide}
                  explanation={previewData.explanation}
                  actionsTaken={previewData.actionsTaken}
                  onApply={handleApplyPreview}
                  onCancel={() => setPreviewData(null)}
                  onRegenerate={() => handleGenerate()}
                />
              ) : (
                <>
                  {/* Command Input Area */}
                  <AICommandInput
                    value={prompt}
                    onChange={setPrompt}
                    onSubmit={() => handleGenerate()}
                    isLoading={isLoading}
                    placeholder={
                      activeTab === 'edit'
                        ? 'Ex.: Deixe este slide mais moderno, com imagem à direita e tipografia nobre...'
                        : 'Ex.: Crie um slide comparando expectativas vs realidade para os estudantes...'
                    }
                  />

                  {/* Quick Action Chips */}
                  <AIQuickActions
                    mode={activeTab}
                    onSelectPrompt={(selected, autoRun) => {
                      setPrompt(selected);
                      if (autoRun) {
                        handleGenerate(selected);
                      }
                    }}
                  />

                  {/* Visual Identity quick card */}
                  <div className="p-3 rounded-2xl bg-[#F8FAF9] border border-[#3A6351]/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5 text-[#3A6351]" />
                      <span className="text-xs font-bold text-gray-700">
                        Identidade da Apresentação
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('identity')}
                      className="text-[11px] font-bold text-[#3A6351] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Ver paleta</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* History */}
                  <AIHistory
                    history={history}
                    onRestoreAction={handleRestoreAction}
                    onClearHistory={() => setHistory([])}
                  />
                </>
              )}
            </>
          )}

          {/* REVIEW MODE */}
          {activeTab === 'review' && (
            <AIPresentationReview
              presentation={presentation}
              onGoToSlide={onGoToSlide}
              onApplySlideFix={(sIdx, fixPrompt) => {
                setActiveTab('edit');
                setPrompt(fixPrompt);
                handleGenerate(fixPrompt);
              }}
            />
          )}

          {/* COPILOT CHAT MODE */}
          {activeTab === 'copilot' && (
            <AIChat
              slide={slide}
              slideIndex={slideIndex}
              onApplyPrompt={(copilotPrompt) => {
                setActiveTab('edit');
                setPrompt(copilotPrompt);
                handleGenerate(copilotPrompt);
              }}
            />
          )}

          {/* VISUAL IDENTITY MODE */}
          {activeTab === 'identity' && (
            <AIVisualIdentity
              presentation={presentation}
              onApplyIdentityToAllSlides={onApplyIdentityToAll}
            />
          )}
        </div>
      </aside>

      {/* AI Settings Modal */}
      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />
    </>
  );
};
