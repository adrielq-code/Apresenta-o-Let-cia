import React, { useState } from 'react';
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
} from 'lucide-react';

interface Props {
  title: string;
  onTitleChange: (newTitle: string) => void;
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  autosaveStatus: 'saving' | 'saved' | 'idle';
  onManualSave: () => void;
  onSaveAsTemplate: () => void;
  onGenerateCode: () => void;
  onPresent: () => void;
}

export const EditorTopBar: React.FC<Props> = ({
  title,
  onTitleChange,
  onBack,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  autosaveStatus,
  onManualSave,
  onSaveAsTemplate,
  onGenerateCode,
  onPresent,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const handleTitleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (tempTitle.trim()) {
      onTitleChange(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="w-full h-14 bg-white border-b border-gray-200 px-3 sm:px-6 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Left: Back button & Presentation Title */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onBack}
          className="p-2 -ml-1 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Voltar para Minhas Apresentações"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden md:inline text-xs font-bold uppercase tracking-wider text-gray-600">
            Minhas Apresentações
          </span>
        </button>

        <div className="h-5 w-px bg-gray-200 hidden md:block" />

        {/* Editable Title */}
        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center">
              <input
                type="text"
                autoFocus
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={() => handleTitleSubmit()}
                className="px-2.5 py-1 rounded-lg border border-[#3A6351] text-xs sm:text-sm font-serif font-bold text-gray-800 bg-white focus:outline-none w-44 sm:w-72"
              />
            </form>
          ) : (
            <button
              onClick={() => {
                setTempTitle(title);
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-100 text-left transition-colors group cursor-pointer max-w-[140px] sm:max-w-xs md:max-w-md"
              title="Clique para renomear"
            >
              <h2 className="text-xs sm:text-sm font-serif font-bold text-gray-900 truncate">
                {title}
              </h2>
              <Edit2 className="w-3 h-3 text-gray-400 group-hover:text-gray-600 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
            </button>
          )}
        </div>
      </div>

      {/* Center: Undo / Redo & Autosave Indicator */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white disabled:opacity-30 transition-all cursor-pointer"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white disabled:opacity-30 transition-all cursor-pointer"
            title="Refazer (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Autosave badge */}
        <div className="flex items-center gap-1.5 text-[11px] font-sans text-gray-500">
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

      {/* Right: Actions (Salvar como Modelo, Gerar Código, Apresentar) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onManualSave}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Salvar alterações agora"
        >
          <Save className="w-3.5 h-3.5 text-[#3A6351]" />
          <span className="hidden sm:inline">Salvar</span>
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
          className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Gerar código único para compartilhar"
        >
          <QrCode className="w-3.5 h-3.5 text-[#3A6351]" />
          <span className="hidden sm:inline">Código</span>
        </button>

        {/* Big Present button */}
        <button
          onClick={onPresent}
          className="px-4 sm:px-5 py-2 rounded-full bg-[#3A6351] hover:bg-[#2e5041] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-[#3A6351]/25 transition-all cursor-pointer"
          title="Iniciar modo de apresentação em tela cheia"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Apresentar</span>
        </button>
      </div>
    </header>
  );
};
