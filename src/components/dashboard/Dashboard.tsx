import React, { useState } from 'react';
import {
  Presentation as PresentationType,
} from '../../types';
import {
  Plus,
  Play,
  Edit3,
  MoreVertical,
  QrCode,
  Copy,
  Trash2,
  Layers,
  Sparkles,
  Calendar,
  KeyRound,
  FileCheck,
  Search,
} from 'lucide-react';
import { NewPresentationModal } from './NewPresentationModal';
import { CodeModal } from './CodeModal';
import { ImportCodeModal } from './ImportCodeModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { RenameModal } from './RenameModal';

interface DashboardProps {
  presentations: PresentationType[];
  templates: PresentationType[];
  onOpenPresentation: (id: string) => void;
  onEditPresentation: (id: string) => void;
  onCreatePresentation: (title: string, format: '16:9') => void;
  onDuplicatePresentation: (id: string) => void;
  onDeletePresentation: (id: string) => void;
  onRenamePresentation: (id: string, newTitle: string) => void;
  onSaveAsTemplate: (id: string) => void;
  onCreateFromTemplate: (templateId: string) => void;
  onImportPresentation: (code: string) => boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  presentations,
  templates,
  onOpenPresentation,
  onEditPresentation,
  onCreatePresentation,
  onDuplicatePresentation,
  onDeletePresentation,
  onRenamePresentation,
  onSaveAsTemplate,
  onCreateFromTemplate,
  onImportPresentation,
}) => {
  const [activeTab, setActiveTab] = useState<'presentations' | 'templates'>('presentations');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedCodePres, setSelectedCodePres] = useState<PresentationType | null>(null);
  const [presToDelete, setPresToDelete] = useState<PresentationType | null>(null);
  const [presToRename, setPresToRename] = useState<PresentationType | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Quick code bar state
  const [quickCodeInput, setQuickCodeInput] = useState('');
  const [quickCodeError, setQuickCodeError] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuickCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCodeInput.trim()) return;
    setQuickCodeError(null);
    const success = onImportPresentation(quickCodeInput.trim());
    if (!success) {
      setQuickCodeError('Apresentação não encontrada para este código.');
    } else {
      setQuickCodeInput('');
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recentemente';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Recentemente';
    }
  };

  const filteredPresentations = presentations.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTemplates = templates.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] text-[#2C2C2C] flex flex-col font-sans select-none">
      {/* Top Artistic Accent Lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#3A6351]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#C79A63]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Header */}
      <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#3A6351] text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              S
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3A6351]">
                Slide Studio
              </span>
              <span className="text-[10px] text-gray-400 block -mt-0.5">
                Criador & Apresentador de Slides
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="dashboard-open-import-btn"
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#3A6351]" />
              <span className="hidden sm:inline">Importar por código</span>
              <span className="sm:hidden">Código</span>
            </button>

            <button
              id="dashboard-new-presentation-btn"
              onClick={() => setIsNewModalOpen(true)}
              className="px-5 py-2 rounded-full bg-[#3A6351] hover:bg-[#2e5041] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-[#3A6351]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Nova apresentação</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Title Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4F7F5] border border-[#3A6351]/20 text-[#3A6351] text-[11px] font-bold uppercase tracking-widest mb-3">
              <Sparkles className="w-3 h-3" />
              Gestão de Apresentações
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#1E293B] tracking-tight">
              Minhas apresentações
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-sans mt-2">
              Crie, edite e reutilize seus modelos.
            </p>
          </div>

          {/* Quick "Tenho um código" form */}
          <div className="w-full md:w-auto bg-white p-2 sm:p-2.5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 font-sans">
              Tenho um código
            </span>
            <form onSubmit={handleQuickCodeSubmit} className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={quickCodeInput}
                  onChange={(e) => {
                    setQuickCodeInput(e.target.value.toUpperCase());
                    setQuickCodeError(null);
                  }}
                  placeholder="Ex: AP-FUTURO..."
                  className="w-44 sm:w-56 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-mono tracking-wider text-gray-800 uppercase focus:outline-none focus:ring-2 focus:ring-[#3A6351]/30 focus:border-[#3A6351]"
                />
              </div>
              <button
                type="submit"
                disabled={!quickCodeInput.trim()}
                className="px-4 py-1.5 rounded-xl bg-[#3A6351] hover:bg-[#2e5041] disabled:opacity-40 text-white text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
              >
                ABRIR
              </button>
            </form>
            {quickCodeError && (
              <span className="text-[11px] text-red-500 font-medium px-2">
                {quickCodeError}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-gray-100/80 w-fit">
            <button
              id="tab-presentations-btn"
              onClick={() => setActiveTab('presentations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'presentations'
                  ? 'bg-white text-[#3A6351] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Minhas Apresentações ({presentations.length})
            </button>
            <button
              id="tab-templates-btn"
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-white text-[#3A6351] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Meus Modelos ({templates.length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título ou código..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl border border-gray-200 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A6351]/20 focus:border-[#3A6351]"
            />
          </div>
        </div>
      </section>

      {/* Grid of Presentations or Templates */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 pb-20 flex-1">
        {activeTab === 'presentations' ? (
          <div>
            {filteredPresentations.length === 0 ? (
              <div className="w-full py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200 p-8">
                <div className="w-12 h-12 rounded-full bg-[#F4F7F5] text-[#3A6351] flex items-center justify-center mx-auto mb-3">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-serif font-bold text-gray-800">
                  Nenhuma apresentação encontrada
                </h3>
                <p className="text-xs text-gray-400 mt-1 mb-6">
                  Comece criando uma nova apresentação ou use um modelo pronto.
                </p>
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="px-6 py-2.5 rounded-full bg-[#3A6351] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#2e5041] transition-colors"
                >
                  + Nova apresentação
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPresentations.map((pres) => {
                  const isMenuOpen = activeMenuId === pres.id;
                  const slideCount = pres.slides?.length || 0;

                  return (
                    <div
                      key={pres.id}
                      className="group bg-white rounded-3xl border border-[#E5E9E6] hover:border-[#3A6351]/40 shadow-sm hover:shadow-xl hover:shadow-[#3A6351]/5 transition-all flex flex-col overflow-hidden relative"
                    >
                      {/* 16:9 Thumbnail preview header */}
                      <div
                        onClick={() => onEditPresentation(pres.id)}
                        className="aspect-video w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none"
                      >
                        {pres.thumbnail ? (
                          <img
                            src={pres.thumbnail}
                            alt={pres.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-40"
                          />
                        ) : null}

                        {/* Visual overlay content preview */}
                        <div className="relative z-10 p-2">
                          <span className="text-[10px] uppercase font-bold text-teal-300 font-mono tracking-widest bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                            {pres.code}
                          </span>
                          <h4 className="text-base sm:text-lg font-serif font-bold text-white mt-2 line-clamp-2 leading-tight">
                            {pres.title}
                          </h4>
                          <span className="text-[10px] text-gray-300 mt-1 block">
                            Formato 16:9 • {slideCount} slides
                          </span>
                        </div>

                        {/* Top corner badge */}
                        {pres.id === 'pres-escolhendo-meu-futuro' && (
                          <div className="absolute top-3 left-3 bg-[#3A6351] text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                            Palestra Principal
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3
                              onClick={() => onEditPresentation(pres.id)}
                              className="font-serif font-bold text-gray-900 text-base line-clamp-1 hover:text-[#3A6351] transition-colors cursor-pointer"
                              title={pres.title}
                            >
                              {pres.title}
                            </h3>

                            {/* Dropdown Menu Toggle */}
                            <div className="relative shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(isMenuOpen ? null : pres.id);
                                }}
                                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                                aria-label="Opções"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* Dropdown Menu Items */}
                              {isMenuOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-8 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-40 animate-fade-in"
                                >
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setPresToRename(pres);
                                    }}
                                    className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-[#F4F7F5] hover:text-[#3A6351] flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Renomear</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onDuplicatePresentation(pres.id);
                                    }}
                                    className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-[#F4F7F5] hover:text-[#3A6351] flex items-center gap-2 cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Duplicar</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setSelectedCodePres(pres);
                                    }}
                                    className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-[#F4F7F5] hover:text-[#3A6351] flex items-center gap-2 cursor-pointer"
                                  >
                                    <QrCode className="w-3.5 h-3.5" />
                                    <span>Gerar código</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onSaveAsTemplate(pres.id);
                                    }}
                                    className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-[#F4F7F5] hover:text-[#3A6351] flex items-center gap-2 cursor-pointer"
                                  >
                                    <FileCheck className="w-3.5 h-3.5" />
                                    <span>Salvar como modelo</span>
                                  </button>

                                  <div className="my-1 border-t border-gray-100" />

                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setPresToDelete(pres);
                                    }}
                                    className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Excluir</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Metadata row */}
                          <div className="flex items-center gap-3 text-xs text-gray-400 font-sans mb-4">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5" />
                              {slideCount} slides
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(pres.updatedAt)}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons: Editar & Apresentar */}
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                          <button
                            id={`btn-edit-${pres.id}`}
                            onClick={() => onEditPresentation(pres.id)}
                            className="py-2.5 px-3 rounded-xl border border-gray-200 hover:border-[#3A6351] text-gray-700 hover:text-[#3A6351] hover:bg-[#F4F7F5] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>

                          <button
                            id={`btn-present-${pres.id}`}
                            onClick={() => onOpenPresentation(pres.id)}
                            className="py-2.5 px-3 rounded-xl bg-[#3A6351] hover:bg-[#2e5041] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Apresentar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* TEMPLATES TAB */
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-serif font-bold text-gray-800">
                Modelos Reutilizáveis
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Escolha um modelo como ponto de partida. Uma cópia independente será criada para edição sem alterar o modelo original.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="group bg-white rounded-3xl border border-[#E5E9E6] hover:border-[#3A6351] shadow-sm hover:shadow-xl hover:shadow-[#3A6351]/5 transition-all flex flex-col overflow-hidden"
                >
                  <div className="aspect-video w-full bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                    {tpl.thumbnail && (
                      <img
                        src={tpl.thumbnail}
                        alt={tpl.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-40"
                      />
                    )}
                    <div className="relative z-10">
                      <span className="text-[10px] uppercase font-bold text-amber-300 font-mono tracking-widest bg-black/50 px-2.5 py-0.5 rounded-full">
                        MODELO
                      </span>
                      <h4 className="text-lg font-serif font-bold text-white mt-2 line-clamp-2">
                        {tpl.title}
                      </h4>
                      <span className="text-[10px] text-gray-300 mt-1 block">
                        {tpl.slides.length} slides prontos
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-gray-900 text-base mb-1">
                        {tpl.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                        {tpl.description || 'Modelo pronto para você adaptar e apresentar.'}
                      </p>
                    </div>

                    <button
                      onClick={() => onCreateFromTemplate(tpl.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#3A6351] hover:bg-[#2e5041] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Usar este modelo</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <NewPresentationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreate={(title, format) => {
          setIsNewModalOpen(false);
          onCreatePresentation(title, format);
        }}
      />

      <CodeModal
        presentation={selectedCodePres}
        isOpen={Boolean(selectedCodePres)}
        onClose={() => setSelectedCodePres(null)}
      />

      <ImportCodeModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(pres) => {
          onEditPresentation(pres.id);
        }}
      />

      <DeleteConfirmModal
        isOpen={Boolean(presToDelete)}
        title={presToDelete?.title || ''}
        onClose={() => setPresToDelete(null)}
        onConfirm={() => {
          if (presToDelete) {
            onDeletePresentation(presToDelete.id);
            setPresToDelete(null);
          }
        }}
      />

      <RenameModal
        isOpen={Boolean(presToRename)}
        currentTitle={presToRename?.title || ''}
        onClose={() => setPresToRename(null)}
        onRename={(newTitle) => {
          if (presToRename) {
            onRenamePresentation(presToRename.id, newTitle);
            setPresToRename(null);
          }
        }}
      />
    </div>
  );
};
