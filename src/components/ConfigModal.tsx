import React, { useState } from 'react';
import { SpeakerConfig } from '../types';
import { TIMELINE_MILESTONES } from '../data/defaultConfig';
import { X, Save, RotateCcw, Upload, Image as ImageIcon, User, Building, Instagram, GraduationCap, Calendar } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div
      id="config-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white border border-[#E5E9E6] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#2C2C2C]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E5E9E6] flex items-center justify-between bg-[#F4F7F5]">
          <div>
            <h3 className="text-base font-serif font-bold text-[#2C2C2C] flex items-center gap-2">
              <User className="w-4 h-4 text-[#3A6351]" />
              Personalizar Dados da Palestrante
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 font-sans">
              Insira seus dados reais para exibição na apresentação (salvo localmente).
            </p>
          </div>
          <button
            id="config-modal-close"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-[#3A6351] hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex border-b border-[#E5E9E6] bg-white px-6 pt-3 gap-6 font-sans">
          <button
            id="config-tab-info"
            onClick={() => setActiveTab('info')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'info'
                ? 'border-[#3A6351] text-[#3A6351]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Building className="w-3.5 h-3.5" /> Dados Pessoais & Clínica
          </button>
          <button
            id="config-tab-photos"
            onClick={() => setActiveTab('photos')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'photos'
                ? 'border-[#3A6351] text-[#3A6351]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Fotos da Linha do Tempo (Tela 04)
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm flex-1 font-sans">
          {activeTab === 'info' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Nome da Palestrante
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      id="config-speaker-name"
                      type="text"
                      value={formData.speakerName}
                      onChange={(e) => handleTextChange('speakerName', e.target.value)}
                      placeholder="Ex: Dra. Mariana Silva"
                      className="w-full bg-[#FDFDFD] border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:border-[#3A6351] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Instagram Profissional
                  </label>
                  <div className="relative">
                    <Instagram className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      id="config-instagram"
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => handleTextChange('instagram', e.target.value)}
                      placeholder="Ex: @dra.suaclinica"
                      className="w-full bg-[#FDFDFD] border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:border-[#3A6351] text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Nome da Sua Clínica
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      id="config-clinic-name"
                      type="text"
                      value={formData.clinicName}
                      onChange={(e) => handleTextChange('clinicName', e.target.value)}
                      placeholder="Ex: Sua Clínica Estética"
                      className="w-full bg-[#FDFDFD] border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:border-[#3A6351] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Título / Especialidade
                  </label>
                  <input
                    id="config-speaker-role"
                    type="text"
                    value={formData.speakerRole}
                    onChange={(e) => handleTextChange('speakerRole', e.target.value)}
                    placeholder="Ex: Farmacêutica Esteta & Empreendedora"
                    className="w-full bg-[#FDFDFD] border border-gray-200 rounded-xl px-3 py-2 text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:border-[#3A6351] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Faculdade de Graduação (Opcional)
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      id="config-college"
                      type="text"
                      value={formData.college}
                      onChange={(e) => handleTextChange('college', e.target.value)}
                      placeholder="Ex: USP, UFRJ, PUC..."
                      className="w-full bg-[#FDFDFD] border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:border-[#3A6351] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Ano de Formação (Opcional)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      id="config-grad-year"
                      type="text"
                      value={formData.graduationYear}
                      onChange={(e) => handleTextChange('graduationYear', e.target.value)}
                      placeholder="Ex: 2018"
                      className="w-full bg-[#FDFDFD] border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:border-[#3A6351] text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Sua Experiência sobre Remuneração (Tela 14 - Dinheiro)
                </label>
                <textarea
                  id="config-experience-text"
                  rows={3}
                  value={formData.customExperienceText || ''}
                  onChange={(e) => handleTextChange('customExperienceText', e.target.value)}
                  placeholder="Compartilhe brevemente sua visão real sobre ganhos, evolução financeira e mercado..."
                  className="w-full bg-[#FDFDFD] border border-gray-200 rounded-xl p-3 text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:border-[#3A6351] text-sm leading-relaxed font-serif"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Você pode usar fotos reais da sua trajetória ou manter as fotos conceituais padrão. Você pode colar a URL de uma imagem ou fazer upload do seu computador.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TIMELINE_MILESTONES.map((m) => {
                  const currentPhoto =
                    formData.timelinePhotos[m.customImageKey as keyof typeof formData.timelinePhotos] ||
                    m.defaultImage;

                  return (
                    <div
                      key={m.id}
                      className="bg-[#F4F7F5] p-3 rounded-2xl border border-[#E5E9E6] flex gap-3 items-center"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-white">
                        <img
                          src={currentPhoto}
                          alt={m.label}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-[#3A6351] block truncate font-sans">
                          {m.stepNumber}. {m.label}
                        </span>
                        <span className="text-[11px] text-gray-500 block truncate mb-1.5 font-sans">
                          {m.subtitle}
                        </span>

                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer bg-white hover:bg-gray-50 text-gray-700 text-[11px] px-2.5 py-1 rounded-full border border-gray-200 flex items-center gap-1 shadow-sm">
                            <Upload className="w-3 h-3 text-[#3A6351]" /> Upload
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(m.customImageKey, e)}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handlePhotoChange(m.customImageKey, m.defaultImage)}
                            className="text-[11px] text-gray-400 hover:text-[#3A6351] underline"
                          >
                            Padrão
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-[#E5E9E6] flex items-center justify-between mt-6">
            <button
              id="config-reset-btn"
              type="button"
              onClick={() => {
                if (confirm('Deseja restaurar os dados de exemplo padrão?')) {
                  onReset();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Padrões
            </button>

            <div className="flex items-center gap-2">
              <button
                id="config-cancel-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                id="config-save-btn"
                type="submit"
                className="pill-btn flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#3A6351] hover:bg-[#2e5041] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md shadow-[#3A6351]/20"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
