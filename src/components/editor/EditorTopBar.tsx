import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Check,
  Play,
  QrCode,
  FileCheck,
  Save,
  Clock,
  Sparkles,
  Edit2,
  MoreVertical,
} from 'lucide-react';

import { AIButton } from './ai/AIButton';

interface Props {
  title: string;
  onTitleChange: (newTitle: string) => void;
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undoCommandName?: string;
  redoCommandName?: string;
  autosaveStatus: 'saving' | 'saved' | 'idle';
  onManualSave: () => void;
  onSaveAsTemplate: () => void;
  onGenerateCode: () => void;
  onPresent: () => void;
  isAIPanelOpen?: boolean;
  onToggleAIPanel?: () => void;
}

export const EditorTopBar: React.FC<Props> = ({
  title,
  onTitleChange,
  onBack,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  undoCommandName,
  redoCommandName,
  autosaveStatus,
  onManualSave,
  onSaveAsTemplate,
  onGenerateCode,
  onPresent,
  isAIPanelOpen = false,
  onToggleAIPanel,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);

  const handleTitleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (tempTitle.trim()) {
      onTitleChange(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="w-full h-14 bg-white border-b border-gray-200 px-2.5 sm:px-6 flex items-center justify-between shrink-0 z-30 select-none gap-1 sm:gap-4">
      {/* Left: Back button & Presentation Title */}
      <div className="flex items-center gap-1 sm:gap-3 min-w-0">
        <button
          onClick={onBack}
          className="p-1.5 sm:p-2 -ml-1 rounded-xl text-gray-500 hover:text-gray-900 active:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          title="Voltar para Minhas Apresentações"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden md:inline text-xs font-bold uppercase tracking-wider text-gray-600">
            Minhas Apresentações
          </span>
        </button>

        <div className="h-5 w-px bg-gray-200 hidden md:block" />

        {/* Editable Title */}
        <div className="flex items-center min-w-0">
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center">
              <input
                type="text"
                autoFocus
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={() => handleTitleSubmit()}
                className="px-2 py-1 rounded-lg border border-[#3A6351] text-xs sm:text-sm font-serif font-bold text-gray-800 bg-white focus:outline-none w-32 sm:w-64"
              />
            </form>
          ) : (
            <button
              onClick={() => {
                setTempTitle(title);
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-gray-100 text-left transition-colors group cursor-pointer max-w-[100px] xs:max-w-[130px] sm:max-w-xs md:max-w-md"
              title="Clique para renomear"
            >
              <h2 className="text-xs sm:text-sm font-serif font-bold text-gray-900 truncate">
                {title}
              </h2>
              <Edit2 className="w-3 h-3 text-gray-400 group-hover:text-gray-600 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity hidden sm:block" />
            </button>
          )}
        </div>
      </div>

      {/* Center: Undo / Redo & Autosave Indicator */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-100/80 p-0.5 sm:p-1 rounded-xl">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 active:bg-white disabled:opacity-25 transition-all cursor-pointer"
            title={undoCommandName ? `Desfazer: ${undoCommandName} (Ctrl+Z)` : 'Desfazer (Ctrl+Z)'}
          >
            <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 active:bg-white disabled:opacity-25 transition-all cursor-pointer"
            title={redoCommandName ? `Refazer: ${redoCommandName} (Ctrl+Shift+Z)` : 'Refazer (Ctrl+Shift+Z)'}
          >
            <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Autosave badge */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-sans text-gray-500">
          {autosaveStatus === 'saving' ? (
            <>
              <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span>Salvando…</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 text-green-600" />
              <span className="text-gray-400">Salvo automaticamente</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Actions (IA Button, Salvar, Código, Apresentar) */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {onToggleAIPanel && (
          <AIButton isOpen={isAIPanelOpen} onClick={onToggleAIPanel} />
        )}

        {/* Desktop Buttons */}
        <button
          onClick={onManualSave}
          className="hidden sm:flex px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider items-center gap-1.5 transition-colors cursor-pointer"
          title="Salvar alterações agora"
        >
          <Save className="w-3.5 h-3.5 text-[#3A6351]" />
          <span>Salvar</span>
        </button>

        <button
          onClick={onSaveAsTemplate}
          className="hidden md:flex px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider items-center gap-1.5 transition-colors cursor-pointer"
          title="Salvar esta apresentação como modelo reutilizável"
        >
          <FileCheck className="w-3.5 h-3.5 text-[#3A6351]" />
          <span>Salvar Modelo</span>
        </button>

        <button
          onClick={onGenerateCode}
          className="hidden sm:flex px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider items-center gap-1.5 transition-colors cursor-pointer"
          title="Gerar código único para compartilhar"
        >
          <QrCode className="w-3.5 h-3.5 text-[#3A6351]" />
          <span>Código</span>
        </button>

        {/* Present Button */}
        <button
          onClick={onPresent}
          className="px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#3A6351] active:bg-[#2e5041] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#3A6351]/25 transition-all cursor-pointer shrink-0"
          title="Iniciar modo de apresentação"
        >
          <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
          <span className="hidden xs:inline">Apresentar</span>
        </button>

        {/* Mobile More Options Menu */}
        <div className="relative sm:hidden" ref={menuRef}>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-600 active:text-gray-900 transition-colors cursor-pointer"
            title="Mais opções"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMobileMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-1.5 z-50 animate-scaleUp">
              <button
                onClick={() => {
                  onManualSave();
                  setShowMobileMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#3A6351]" />
                <span>Salvar Apresentação</span>
              </button>

              <button
                onClick={() => {
                  onGenerateCode();
                  setShowMobileMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-[#3A6351]" />
                <span>Código de Compartilhamento</span>
              </button>

              <button
                onClick={() => {
                  onSaveAsTemplate();
                  setShowMobileMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5 text-[#3A6351]" />
                <span>Salvar como Modelo</span>
              </button>

              <div className="border-t border-gray-100 my-1" />
              <div className="px-3 py-1.5 text-[10px] text-gray-400 flex items-center gap-1.5">
                {autosaveStatus === 'saving' ? (
                  <>
                    <Clock className="w-3 h-3 text-amber-500 animate-spin" />
                    <span>Salvando alterações…</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3 text-green-600" />
                    <span>Salvo automaticamente</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
