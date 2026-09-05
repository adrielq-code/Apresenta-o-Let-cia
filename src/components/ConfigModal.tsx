import React, { useState } from 'react';
import { SpeakerConfig } from '../types';
import { TIMELINE_MILESTONES } from '../data/defaultConfig';
import { 
  X, 
  Save, 
  RotateCcw, 
  Upload, 
  Image as ImageIcon, 
  User, 
  Building, 
  Instagram, 
  GraduationCap, 
  Calendar,
  Link as LinkIcon,
  Check
} from 'lucide-react';

interface ConfigModalProps {
  config: SpeakerConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: SpeakerConfig) => void;
  onReset: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave,
  onReset,
}) => {
  const [formData, setFormData] = useState<SpeakerConfig>(config);
  const [activeTab, setActiveTab] = useState<'info' | 'photos'>('info');
  const [urlInputKey, setUrlInputKey] = useState<string | null>(null);
  const [tempUrl, setTempUrl] = useState<string>('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (!isOpen) return null;

  const handleTextChange = (field: keyof SpeakerConfig, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (key: string, url: string) => {
    setFormData((prev) => ({
      ...prev,
      timelinePhotos: {
        ...prev.timelinePhotos,
        [key]: url,
      },
    }));
  };

  const handleFileUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handlePhotoChange(key, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = (key: string) => {
    if (tempUrl.trim()) {
      handlePhotoChange(key, tempUrl.trim());
      setUrlInputKey(null);
      setTempUrl('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 400);
  };

  return (
    <div
      id="config-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
    >
      <div 
        id="config-modal-container"
        className="bg-white sm:border border-[#E5E9E6] sm:rounded-3xl rounded-t-3xl sm:rounded-b-3xl w-full h-[95vh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl shadow-2xl overflow-hidden flex flex-col text-[#2C2C2C] animate-in slide-in-from-bottom duration-200"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E5E9E6] flex items-center justify-between bg-[#F4F7F5] shrink-0">
          <div className="flex-1 pr-2">
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#2C2C2C] flex items-center gap-2">
              <User className="w-4 h-4 text-[#3A6351] shrink-0" />
              <span>Ajustes da Palestrante</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 font-sans">
              Personalize nome, clínica, fotos e dados exibidos na palestra.
            </p>
          </div>
          <button
            id="config-modal-close"
            type="button"
            onClick={onClose}
            aria-label="Fechar ajustes"
            className="w-10 h-10 rounded-full text-gray-400 hover:text-[#3A6351] hover:bg-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector - 50/50 responsive tabs */}
        <div className="flex border-b border-[#E5E9E6] bg-white px-3 sm:px-6 pt-1 font-sans shrink-0">
          <button
            id="config-tab-info"
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'info'
                ? 'border-[#3A6351] text-[#3A6351]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Building className="w-4 h-4 shrink-0" />
            <span>Dados & Clínica</span>
          </button>

          <button
            id="config-tab-photos"
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'photos'
                ? 'border-[#3A6351] text-[#3A6351]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span>Fotos da Linha (Tela 04)</span>
          </button>
        </div>

        {/* Content Form - Scrollable */}
        <form 
          id="config-form"
          onSubmit={handleSubmit} 
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans text-sm"
        >
          {activeTab === 'info' ? (
            <div className="space-y-4">
              {/* Speaker Name & Instagram */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="config-speaker-name" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nome da Palestrante *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="config-speaker-name"
                      type="text"
                      required
                      value={formData.speakerName}
                      onChange={(e) => handleTextChange('speakerName', e.target.value)}
                      placeholder="Ex: Dra. Mariana Silva"
                      className="w-full bg-[#FDFDFD] border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-base sm:text-sm text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:border-[#3A6351] focus:ring-1 focus:ring-[#3A6351]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="config-instagram" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Instagram Profissional
                  </label>
                  <div className="relative">
                    <Instagram className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="config-instagram"
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => handleTextChange('instagram', e.target.value)}
                      placeholder="Ex: @dra.suaclinica"
                      className="w-full bg-[#FDFDFD] border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-base sm:text-sm text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:border-[#3A6351] focus:ring-1 focus:ring-[#3A6351]"
                    />
                  </div>
                </div>
              </div>

              {/* Clinic Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="config-clinic-name" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nome da Sua Clínica
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="config-clinic-name"
                      type="text"
                      value={formData.clinicName}
                      onChange={(e) => handleTextChange('clinicName', e.target.value)}
                      placeholder="Ex: Sua Clínica Estética"
                      className="w-full bg-[#FDFDFD] border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-base sm:text-sm text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:border-[#3A6351] focus:ring-1 focus:ring-[#3A6351]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="config-speaker-role" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Título / Especialidade
                  </label>
                  <input
                    id="config-speaker-role"
                    type="text"
                    value={formData.speakerRole}
                    onChange={(e) => handleTextChange('speakerRole', e.target.value)}
                    placeholder="Ex: Farmacêutica Esteta & Empreendedora"
                    className="w-full bg-[#FDFDFD] border border-gray-200 rounded-xl px-3.5 py-3 text-base sm:text-sm text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:border-[#3A6351] focus:ring-1 focus:ring-[#3A6351]"
                  />
                </div>
              </div>

              {/* College & Grad Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="config-college" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Faculdade de Graduação (Opcional)
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="config-college"
                      type="text"
                      value={formData.college}
                      onChange={(e) => handleTextChange('college', e.target.value)}
                      placeholder="Ex: USP, UFRJ, PUC..."
                      className="w-full bg-[#FDFDFD] border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-base sm:text-sm text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:border-[#3A6351] focus:ring-1 focus:ring-[#3A6351]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="config-grad-year" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Ano de Formação (Opcional)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="config-grad-year"
                      type="text"
                      value={formData.graduationYear}
                      onChange={(e) => handleTextChange('graduationYear', e.target.value)}
                      placeholder="Ex: 2018"
                      className="w-full bg-[#FDFDFD] border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-base sm:text-sm text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:border-[#3A6351] focus:ring-1 focus:ring-[#3A6351]"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Experience Text */}
              <div>
                <label htmlFor="config-experience-text" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Sua Visão sobre Remuneração (Tela 14 - Quanto dá para ganhar?)
                </label>
                <textarea
                  id="config-experience-text"
                  rows={3}
                  value={formData.customExperienceText || ''}
                  onChange={(e) => handleTextChange('customExperienceText', e.target.value)}
                  placeholder="Compartilhe brevemente sua visão real sobre ganhos, evolução financeira e mercado..."
                  className="w-full bg-[#FDFDFD] border border-gray-200 rounded-xl p-3.5 text-base sm:text-sm text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:border-[#3A6351] focus:ring-1 focus:ring-[#3A6351] leading-relaxed font-serif"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#F4F7F5] rounded-2xl border border-[#3A6351]/20 text-xs text-gray-600">
                💡 <strong>Dica:</strong> Toque em <strong>Upload</strong> para escolher uma foto do seu celular ou em <strong>Link URL</strong> para colar uma imagem da web.
              </div>

              <div className="space-y-3">
                {TIMELINE_MILESTONES.map((m) => {
                  const currentPhoto =
                    formData.timelinePhotos[m.customImageKey as keyof typeof formData.timelinePhotos] ||
                    m.defaultImage;
                  const isEditingUrl = urlInputKey === m.customImageKey;

                  return (
                    <div
                      key={m.id}
                      className="bg-[#FDFDFD] p-3.5 rounded-2xl border border-[#E5E9E6] shadow-sm flex flex-col gap-3"
                    >
                      <div className="flex gap-3 items-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-100 relative">
                          <img
                            src={currentPhoto}
                            alt={m.label}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute top-1 left-1 w-5 h-5 rounded-md bg-[#3A6351] text-white text-[10px] font-bold flex items-center justify-center font-sans">
                            {m.stepNumber}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-[#3A6351] block truncate font-sans">
                            {m.stepNumber}. {m.label}
                          </span>
                          <span className="text-xs text-gray-500 block truncate mb-2 font-sans">
                            {m.subtitle}
                          </span>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* Upload Button */}
                            <label className="cursor-pointer bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-300 flex items-center gap-1.5 shadow-sm transition-colors">
                              <Upload className="w-3.5 h-3.5 text-[#3A6351]" />
                              <span>Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(m.customImageKey, e)}
                                className="hidden"
                              />
                            </label>

                            {/* URL button */}
                            <button
                              type="button"
                              onClick={() => {
                                setUrlInputKey(isEditingUrl ? null : m.customImageKey);
                                setTempUrl('');
                              }}
                              className="bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-300 flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                            >
                              <LinkIcon className="w-3 h-3 text-[#3A6351]" />
                              <span>Link URL</span>
                            </button>

                            {/* Reset button */}
                            <button
                              type="button"
                              onClick={() => handlePhotoChange(m.customImageKey, m.defaultImage)}
                              className="text-xs text-gray-400 hover:text-[#3A6351] underline ml-auto cursor-pointer"
                            >
                              Restaurar
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Optional inline URL input */}
                      {isEditingUrl && (
                        <div className="pt-2 border-t border-gray-100 flex gap-2 items-center">
                          <input
                            type="url"
                            value={tempUrl}
                            onChange={(e) => setTempUrl(e.target.value)}
                            placeholder="Cole o link direto da imagem (https://...)"
                            className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-[#2C2C2C] focus:outline-none focus:border-[#3A6351]"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyUrl(m.customImageKey)}
                            className="px-3 py-1.5 rounded-lg bg-[#3A6351] text-white text-xs font-bold shrink-0 cursor-pointer"
                          >
                            Aplicar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </form>

        {/* Sticky Footer Controls - ALWAYS visible at bottom */}
        <div className="p-3.5 sm:p-4 bg-white/95 backdrop-blur-md border-t border-[#E5E9E6] flex items-center justify-between gap-2 shrink-0 z-20">
          <button
            id="config-reset-btn"
            type="button"
            onClick={() => {
              if (confirm('Deseja restaurar todos os dados e fotos para o padrão original?')) {
                onReset();
                onClose();
              }
            }}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Restaurar Padrões</span>
            <span className="sm:hidden">Resetar</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id="config-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors cursor-pointer min-h-[42px]"
            >
              Cancelar
            </button>
            <button
              id="config-save-btn"
              type="button"
              onClick={handleSubmit}
              className="pill-btn flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-[#3A6351] hover:bg-[#2e5041] active:scale-95 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#3A6351]/20 cursor-pointer min-h-[42px]"
            >
              {savedFeedback ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Salvo!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
