import React, { useState } from 'react';
import { SlideData, SpeakerConfig } from '../types';
import { TIMELINE_MILESTONES } from '../data/defaultConfig';
import { TimerWidget } from './TimerWidget';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Clock, 
  Award, 
  Heart, 
  BookOpen, 
  TrendingUp, 
  ArrowRight, 
  Check, 
  Briefcase, 
  Users, 
  Lightbulb, 
  DollarSign, 
  Instagram, 
  Building2, 
  Eye,
  EyeOff
} from 'lucide-react';

interface SlideRendererProps {
  slide: SlideData;
  config: SpeakerConfig;
  onNextSlide: () => void;
  onOpenConfig: () => void;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({
  slide,
  config,
  onNextSlide,
  onOpenConfig,
}) => {
  // State for interactive slide 2 (Icebreaker tally)
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // State for interactive timeline slide 4 (Active milestone preview)
  const [activeMilestoneId, setActiveMilestoneId] = useState<string>('highSchool');

  // State for slide 12 (Instagram behind the scenes toggle)
  const [showBehindTheScenes, setShowBehindTheScenes] = useState<boolean>(false);

  // State for slide 16 (Interests selector)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // State for slide 17 (Talents selector)
  const [selectedTalents, setSelectedTalents] = useState<string[]>([]);

  // State for slide 18 (Lifestyle selector)
  const [selectedLifestyles, setSelectedLifestyles] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleTalent = (id: string) => {
    setSelectedTalents((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleLifestyle = (id: string) => {
    setSelectedLifestyles((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full min-h-full flex flex-col justify-start sm:justify-center items-center px-3 sm:px-8 md:px-12 pt-3 sm:pt-6 pb-28 sm:pb-24 relative select-none overflow-y-auto overflow-x-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.02, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-6xl flex flex-col justify-start sm:justify-center items-center my-auto py-2 sm:py-4"
        >
          {/* ==================== TELA 01 — ABERTURA ==================== */}
          {slide.id === 1 && (
            <div className="flex flex-col items-center text-center max-w-4xl relative z-10">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-full bg-[#F4F7F5] border border-[#3A6351]/20 text-[#3A6351] text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] mb-4 sm:mb-6 shadow-sm font-sans"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#3A6351]" />
                Palestra Inspiracional • Ensino Médio
              </motion.div>

              <h1 className="text-4xl sm:text-7xl md:text-8xl font-serif font-bold text-[#2C2C2C] tracking-tight leading-[1.06]">
                ESCOLHENDO<br />MEU FUTURO
              </h1>

              <h2 className="text-lg sm:text-2xl md:text-3xl text-gray-500 font-serif italic font-normal mt-2 sm:mt-3 mb-2">
                Da Farmácia ao empreendedorismo na Estética
              </h2>

              <div className="my-5 sm:my-8 p-5 sm:p-8 bg-white border border-[#E5E9E6] rounded-3xl shadow-xl shadow-[#3A6351]/5 max-w-2xl">
                <p className="text-lg sm:text-2xl md:text-3xl font-serif italic text-gray-700 leading-snug">
                  “Você já sabe o que quer ser quando crescer?”
                </p>
                <span className="block text-[11px] sm:text-xs font-sans text-gray-400 mt-2 sm:mt-3 uppercase tracking-wider">
                  Uma reflexão sincera para quem tem 15, 16 ou 17 anos
                </span>
              </div>

              <motion.button
                id="slide-1-start-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={onNextSlide}
                className="pill-btn px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#3A6351] hover:bg-[#2e5041] text-white font-bold text-xs tracking-widest shadow-xl shadow-[#3A6351]/25 flex items-center gap-3 transition-all uppercase cursor-pointer"
              >
                <span>COMEÇAR PALESTRA</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </motion.button>

              <div className="mt-5 flex items-center gap-2 text-xs text-gray-400 font-sans">
                <span className="hidden sm:inline">Dica: Use as teclas</span>
                <span className="sm:hidden">Dica: Deslize para o lado ou use</span>
                <kbd className="hidden sm:inline-block px-2 py-0.5 bg-gray-100 rounded text-gray-600 border border-gray-200">←</kbd>
                <kbd className="hidden sm:inline-block px-2 py-0.5 bg-gray-100 rounded text-gray-600 border border-gray-200">→</kbd>
                <span>os botões abaixo</span>
              </div>
            </div>
          )}

          {/* ==================== TELA 02 — INTERAÇÃO ==================== */}
          {slide.id === 2 && (
            <div className="flex flex-col items-center text-center w-full max-w-5xl">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#3A6351] uppercase mb-2 sm:mb-3 font-sans">
                Dinâmica de Abertura
              </span>

              <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif italic font-bold text-[#2C2C2C] tracking-tight leading-tight max-w-3xl">
                Quem aqui já sabe o que quer ser?
              </h2>

              <p className="text-gray-500 text-xs sm:text-base mt-2 sm:mt-3 mb-6 sm:mb-8 font-sans">
                Vote na opção que mais representa o seu momento hoje ou levante a mão:
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-6 w-full max-w-4xl">
                {[
                  {
                    id: 'ja_sei',
                    label: 'Já Sei',
                    desc: 'Tenho clareza ou um curso em mente.',
                    emoji: '🎯',
                  },
                  {
                    id: 'ainda_nao',
                    label: 'Ainda Não',
                    desc: 'Completamente em dúvida ou sem foco.',
                    emoji: '🤔',
                  },
                  {
                    id: 'ja_mudei',
                    label: 'Mudei de Ideia',
                    desc: 'Cada mês uma profissão diferente!',
                    emoji: '🔄',
                  },
                ].map((opt) => {
                  const isChosen = selectedOption === opt.id;
                  return (
                    <button
                      key={opt.id}
                      id={`vote-opt-${opt.id}`}
                      onClick={() => setSelectedOption(opt.id)}
                      className={`pill-btn w-full max-w-[280px] sm:w-52 md:w-56 h-auto py-5 sm:h-56 rounded-3xl border-2 flex flex-col items-center justify-center gap-2.5 sm:gap-3 transition-all cursor-pointer relative shadow-sm ${
                        isChosen
                          ? 'border-[#3A6351] bg-[#3A6351] text-white shadow-xl shadow-[#3A6351]/20'
                          : 'border-[#3A6351]/80 text-[#3A6351] bg-white hover:bg-[#F4F7F5]'
                      }`}
                    >
                      <span className="text-3xl sm:text-5xl">{opt.emoji}</span>
                      <span className="font-bold text-xs sm:text-sm tracking-widest uppercase font-sans">
                        {opt.label}
                      </span>
                      <span className={`text-[11px] px-3 text-center leading-tight ${isChosen ? 'text-white/80' : 'text-gray-500'}`}>
                        {opt.desc}
                      </span>

                      {isChosen && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white text-[#3A6351] flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedOption && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 sm:mt-8 text-[#3A6351] text-xs sm:text-sm font-semibold bg-[#F4F7F5] px-4 sm:px-5 py-2.5 rounded-full border border-[#3A6351]/20 font-sans max-w-lg"
                >
                  💡 Perfeito! Fiquem tranquilos: a maioria absoluta das pessoas está no segundo ou terceiro grupo.
                </motion.p>
              )}
            </div>
          )}

          {/* ==================== TELA 03 — PRESSÃO ==================== */}
          {slide.id === 3 && (
            <div className="flex flex-col items-center text-center max-w-4xl">
              <h4 className="text-3xl sm:text-5xl md:text-6xl font-serif mb-2 sm:mb-4 italic text-[#2C2C2C]">
                “Eu tenho 17 anos...”
              </h4>

              <h1 className="text-xl sm:text-3xl md:text-4xl font-light mb-2 sm:mb-4 text-gray-600 font-sans">
                Preciso saber o que vou fazer pelo resto da vida?
              </h1>

              {/* Big animated NO with Artistic Flair red (#E63946) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 220 }}
                className="my-1 sm:my-2"
              >
                <div className="text-7xl sm:text-[140px] md:text-[190px] font-serif font-bold text-[#E63946] leading-none select-none tracking-tight">
                  NÃO.
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-5 sm:p-6 bg-white border border-[#E5E9E6] rounded-3xl max-w-xl shadow-xl shadow-[#3A6351]/5 mt-2"
              >
                <p className="text-base sm:text-xl text-gray-700 font-serif italic leading-relaxed">
                  “Escolher uma profissão não significa decidir toda a sua vida hoje.”
                </p>
                <p className="text-[11px] sm:text-xs text-gray-400 mt-2 font-sans uppercase tracking-wider">
                  Significa apenas escolher onde você vai começar a construir sua bagagem.
                </p>
              </motion.div>
            </div>
          )}

          {/* ==================== TELA 04 — A HISTÓRIA DA PALESTRANTE ==================== */}
          {slide.id === 4 && (
            <div className="flex flex-col w-full max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3 sm:mb-4 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-[#3A6351] uppercase tracking-[0.2em] font-sans">
                    Trajetória Real
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-serif text-[#2C2C2C] tracking-tight">
                    Eu também já estive aqui...
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 font-sans mt-0.5">
                    A minha carreira não foi uma linha reta aos 17 anos. Foi uma construção por etapas:
                  </p>
                </div>

                <button
                  id="slide-4-config-btn"
                  onClick={onOpenConfig}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#F4F7F5] hover:bg-[#EAF0EC] text-[#3A6351] text-xs font-bold border border-[#3A6351]/20 flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-colors uppercase tracking-wider font-sans cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Personalizar Fotos</span>
                </button>
              </div>

              {/* Responsive Timeline Bar with horizontal scroll on mobile */}
              <div className="flex sm:grid sm:grid-cols-4 lg:grid-cols-8 overflow-x-auto gap-2 w-full my-2 sm:my-3 pb-2 scrollbar-none snap-x">
                {TIMELINE_MILESTONES.map((m) => {
                  const isActive = activeMilestoneId === m.id;
                  const photoUrl =
                    config.timelinePhotos[m.customImageKey as keyof typeof config.timelinePhotos] ||
                    m.defaultImage;

                  return (
                    <button
                      key={m.id}
                      id={`milestone-step-${m.id}`}
                      onClick={() => setActiveMilestoneId(m.id)}
                      className={`shrink-0 w-28 sm:w-auto p-2 sm:p-2.5 rounded-2xl border text-left flex flex-col transition-all cursor-pointer group snap-start ${
                        isActive
                          ? 'bg-[#F4F7F5] border-[#3A6351] shadow-lg shadow-[#3A6351]/10 scale-[1.02]'
                          : 'bg-white border-[#E5E9E6] hover:border-gray-300'
                      }`}
                    >
                      <div className="aspect-square w-full rounded-xl overflow-hidden mb-1.5 bg-gray-100 relative">
                        <img
                          src={photoUrl}
                          alt={m.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <span className={`absolute top-1 left-1 w-4 h-4 sm:w-5 sm:h-5 rounded-md text-[9px] sm:text-[10px] font-sans font-bold flex items-center justify-center ${
                          isActive ? 'bg-[#3A6351] text-white' : 'bg-white/90 text-gray-700'
                        }`}>
                          {m.stepNumber}
                        </span>
                      </div>

                      <span
                        className={`text-[11px] sm:text-xs font-bold truncate font-sans ${
                          isActive ? 'text-[#3A6351]' : 'text-gray-800'
                        }`}
                      >
                        {m.label}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-gray-400 truncate font-sans">
                        {m.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Detailed Active Milestone Card */}
              {(() => {
                const currentMilestone =
                  TIMELINE_MILESTONES.find((m) => m.id === activeMilestoneId) ||
                  TIMELINE_MILESTONES[0];
                const activePhoto =
                  config.timelinePhotos[
                    currentMilestone.customImageKey as keyof typeof config.timelinePhotos
                  ] || currentMilestone.defaultImage;

                return (
                  <div className="bg-white border border-[#E5E9E6] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6 mt-2 shadow-xl shadow-[#3A6351]/5">
                    <div className="w-full sm:w-48 h-36 rounded-2xl overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
                      <img
                        src={activePhoto}
                        alt={currentMilestone.label}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F4F7F5] text-[#3A6351] text-xs font-sans font-bold border border-[#3A6351]/20">
                          Etapa {currentMilestone.stepNumber} de 8
                        </span>
                        <span className="text-xs text-gray-400 font-sans uppercase tracking-wider">
                          {currentMilestone.subtitle}
                        </span>
                      </div>
                      <h4 className="text-2xl font-serif font-bold text-[#2C2C2C] mt-1.5">
                        {currentMilestone.label}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed font-sans">
                        {currentMilestone.description}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ==================== TELA 05 — O QUE VOCÊ IMAGINA? ==================== */}
          {slide.id === 5 && (
            <div className="flex flex-col items-center text-center max-w-5xl">
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#3A6351] uppercase mb-3 font-sans">
                Desmistificando Conceitos
              </span>

              <h2 className="text-3xl sm:text-5xl font-serif text-[#2C2C2C] tracking-tight leading-tight max-w-4xl">
                Quando você ouve “Farmacêutica”, o que vem à sua cabeça?
              </h2>

              {/* Cloud of floating words */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 my-8 max-w-3xl">
                {[
                  { word: 'REMÉDIO', size: 'text-xl sm:text-2xl' },
                  { word: 'FARMÁCIA', size: 'text-2xl sm:text-3xl font-bold' },
                  { word: 'DROGARIA', size: 'text-lg sm:text-xl' },
                  { word: 'HOSPITAL', size: 'text-xl sm:text-2xl' },
                  { word: 'LABORATÓRIO', size: 'text-xl sm:text-2xl' },
                  { word: 'COSMÉTICOS', size: 'text-lg sm:text-xl' },
                ].map((item, idx) => (
                  <motion.span
                    key={item.word}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.12 * idx }}
                    className={`font-sans font-bold uppercase tracking-wider px-6 py-3 rounded-2xl bg-white border border-[#E5E9E6] text-gray-700 shadow-sm ${item.size}`}
                  >
                    {item.word}
                  </motion.span>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="p-6 bg-[#F4F7F5] border border-[#3A6351]/30 rounded-3xl max-w-2xl shadow-sm"
              >
                <p className="text-2xl sm:text-3xl font-serif font-bold text-[#3A6351] tracking-tight">
                  Mas é muito mais do que isso.
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 font-sans">
                  Farmácia é uma ciência que vai da pesquisa molecular à gestão de grandes negócios e estética avançada.
                </p>
              </motion.div>
            </div>
          )}

          {/* ==================== TELA 06 — UMA PROFISSÃO, VÁRIOS CAMINHOS ==================== */}
          {slide.id === 6 && (
            <div className="flex flex-col items-center text-center w-full max-w-6xl">
              <span className="text-[10px] font-bold text-[#3A6351] uppercase tracking-[0.2em] mb-1 font-sans">
                Leque de Atuação
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2C2C2C] tracking-tight">
                Uma Profissão. Vários Caminhos.
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-6 font-sans">
                Veja como uma única formação abre portas para dezenas de mercados distintos:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full max-w-5xl my-2">
                {[
                  { name: 'Drogaria & Varejo', desc: 'Atenção primária à saúde' },
                  { name: 'Hospitalar & Clínica', desc: 'UTIs e suporte médico' },
                  { name: 'Indústria Farmacêutica', desc: 'Produção em larga escala' },
                  { name: 'Laboratórios & Genética', desc: 'Diagnósticos e exames' },
                  { name: 'Cosméticos & P&D', desc: 'Fórmulas e dermocosméticos' },
                  { name: 'Pesquisa Científica', desc: 'Vacinas e novos fármacos' },
                  { name: 'Gestão em Saúde', desc: 'Liderança e auditoria' },
                  { name: 'Educação & Ensino', desc: 'Docência e mentoria' },
                  { name: 'Perícia Criminal', desc: 'Toxicologia forense' },
                  { name: 'ESTÉTICA AVANÇADA', desc: 'Autoestima, saúde e clínica', highlight: true },
                ].map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * idx }}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      item.highlight
                        ? 'bg-[#F4F7F5] border-[#3A6351] shadow-md shadow-[#3A6351]/10 col-span-2 sm:col-span-1'
                        : 'bg-white border-[#E5E9E6] hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <span
                        className={`text-xs sm:text-sm font-bold block font-sans ${
                          item.highlight ? 'text-[#3A6351]' : 'text-[#2C2C2C]'
                        }`}
                      >
                        {item.name}
                      </span>
                      <span className="text-[11px] text-gray-500 mt-1 block font-sans">
                        {item.desc}
                      </span>
                    </div>

                    {item.highlight && (
                      <span className="mt-3 text-[10px] font-bold text-[#3A6351] uppercase tracking-wider flex items-center gap-1 font-sans">
                        <Sparkles className="w-3 h-3" /> Nosso foco hoje
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-full bg-white border border-[#E5E9E6] text-gray-700 text-xs sm:text-sm font-serif italic shadow-sm">
                “Você não precisa conhecer todos os caminhos antes de começar a caminhar.”
              </div>
            </div>
          )}

          {/* ==================== TELA 07 — A DESCOBERTA ==================== */}
          {slide.id === 7 && (
            <div className="flex flex-col items-center text-center max-w-4xl">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#3A6351] mb-2 font-sans">
                O Ponto de Inflexão
              </span>

              <h2 className="text-3xl sm:text-5xl font-serif text-[#2C2C2C] tracking-tight mb-8">
                E foi aqui que meu caminho mudou...
              </h2>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full my-4">
                {[
                  { step: 'FARMÁCIA', desc: 'A base científica' },
                  { step: 'CONHECIMENTO', desc: 'Fisiologia e ativos' },
                  { step: 'ESPECIALIZAÇÃO', desc: 'Pós-graduação focada' },
                  { step: 'ESTÉTICA', desc: 'Paixão e propósito', highlight: true },
                ].map((s, idx) => (
                  <React.Fragment key={s.step}>
                    <div
                      className={`px-6 py-4 rounded-2xl border flex flex-col items-center text-center min-w-[150px] shadow-sm ${
                        s.highlight
                          ? 'bg-[#3A6351] text-white border-[#3A6351] shadow-lg shadow-[#3A6351]/20 font-sans'
                          : 'bg-white border-[#E5E9E6] text-[#2C2C2C] font-sans'
                      }`}
                    >
                      <span className="text-sm sm:text-base font-bold tracking-wide">
                        {s.step}
                      </span>
                      <span
                        className={`text-[11px] mt-0.5 ${
                          s.highlight ? 'text-white/80 font-medium' : 'text-gray-400'
                        }`}
                      >
                        {s.desc}
                      </span>
                    </div>

                    {idx < 3 && (
                      <ArrowRight className="w-5 h-5 text-[#3A6351] hidden sm:block shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="mt-8 p-6 bg-white border border-[#E5E9E6] rounded-3xl max-w-2xl shadow-xl shadow-[#3A6351]/5">
                <p className="text-xl font-serif italic text-gray-700 leading-relaxed">
                  “Às vezes, você descobre o seu caminho depois que começa a caminhar.”
                </p>
                <p className="text-xs text-gray-400 mt-2 font-sans uppercase tracking-wider">
                  O interesse genuíno nasce do aprofundamento prático, não apenas de um palpite prévio.
                </p>
              </div>
            </div>
          )}

          {/* ==================== TELA 08 — FARMÁCIA + ESTÉTICA ==================== */}
          {slide.id === 8 && (
            <div className="flex flex-col items-center text-center max-w-4xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A6351] mb-2 font-sans">
                Conexão Profissional
              </span>

              <h2 className="text-3xl sm:text-5xl font-serif text-[#2C2C2C] tracking-tight mb-4">
                Farmácia + Estética
              </h2>

              <p className="text-gray-600 text-sm sm:text-base max-w-2xl mb-8 font-sans">
                Estética na área da saúde não é superficialidade: é a união da ciência com a dignidade e a autoestima das pessoas.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 my-2 max-w-3xl">
                {['CIÊNCIA', '+', 'SAÚDE', '+', 'FARMACOLOGIA', '+', 'ESTÉTICA', '+', 'CUIDADO HUMANO'].map(
                  (item, i) =>
                    item === '+' ? (
                      <span key={i} className="text-xl font-bold text-[#3A6351]">
                        +
                      </span>
                    ) : (
                      <span
                        key={i}
                        className="px-4 py-2 rounded-full bg-white border border-[#E5E9E6] text-gray-800 font-bold text-xs uppercase tracking-wider shadow-sm font-sans"
                      >
                        {item}
                      </span>
                    )
                )}
              </div>

              <div className="my-5 text-2xl font-serif font-bold text-[#3A6351]">=</div>

              <div className="p-8 bg-[#F4F7F5] border border-[#3A6351]/30 rounded-3xl max-w-xl shadow-xl shadow-[#3A6351]/5">
                <h3 className="text-3xl sm:text-4xl font-serif font-bold text-[#2C2C2C]">
                  Estética de Saúde
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed font-sans">
                  Trabalhar com responsabilidade ética, anatomia, fisiologia e bem-estar para gerar resultados seguros e reais.
                </p>
              </div>
            </div>
          )}

          {/* ==================== TELA 09 — COMO É UM DIA DE TRABALHO? ==================== */}
          {slide.id === 9 && (
            <div className="flex flex-col items-center text-center w-full max-w-5xl">
              <span className="text-[10px] font-bold text-[#3A6351] uppercase tracking-[0.2em] mb-1 font-sans">
                Rotina Real
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#2C2C2C] tracking-tight">
                Como é um dia de trabalho de verdade?
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-6 font-sans">
                Desmistificando o dia a dia de um consultório / clínica:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left">
                {/* Manhã */}
                <div className="p-6 rounded-3xl bg-white border border-[#E5E9E6] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[#3A6351] font-bold text-xs uppercase tracking-widest mb-3 font-sans">
                      <Clock className="w-4 h-4" />
                      MANHÃ
                    </div>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600 font-sans">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#3A6351] shrink-0" />
                        Conferência de agenda e prontuários
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#3A6351] shrink-0" />
                        Planejamento clínico personalizado
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#3A6351] shrink-0" />
                        Alinhamento com a equipe e recepção
                      </li>
                    </ul>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-4 block uppercase font-sans tracking-wider">
                    Foco: Organização & Método
                  </span>
                </div>

                {/* Durante o Dia */}
                <div className="p-6 rounded-3xl bg-white border border-[#E5E9E6] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-widest mb-3 font-sans">
                      <Heart className="w-4 h-4" />
                      DURANTE O DIA
                    </div>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600 font-sans">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        Avaliações detalhadas e escuta atenta
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        Execução cuidadosa de protocolos
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        Orientações de cuidados home-care
                      </li>
                    </ul>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-4 block uppercase font-sans tracking-wider">
                    Foco: Paciente & Técnica
                  </span>
                </div>

                {/* Bastidores */}
                <div className="p-6 rounded-3xl bg-white border border-[#E5E9E6] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-widest mb-3 font-sans">
                      <Briefcase className="w-4 h-4" />
                      BASTIDORES
                    </div>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600 font-sans">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Estudos de artigos e atualização
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Gestão financeira e fluxo de caixa
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Compras, fornecedores e marketing
                      </li>
                    </ul>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-4 block uppercase font-sans tracking-wider">
                    Foco: Sustentabilidade do Negócio
                  </span>
                </div>
              </div>

              <p className="mt-8 text-xs sm:text-sm text-gray-600 font-serif italic bg-[#F4F7F5] px-6 py-2.5 rounded-full border border-[#3A6351]/20">
                “Não existe só a parte bonita que aparece nos vídeos de 15 segundos.”
              </p>
            </div>
          )}

          {/* ==================== TELA 10 — QUEM EMPREENDE USA MUITOS CHAPÉUS ==================== */}
          {slide.id === 10 && (
            <div className="flex flex-col items-center text-center w-full max-w-5xl">
              <span className="text-[10px] font-bold text-[#3A6351] uppercase tracking-[0.2em] mb-1 font-sans">
                Multi-competências
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2C2C2C] tracking-tight">
                Quando você empreende...
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-6 font-sans">
                Você usa muitos chapéus ao mesmo tempo:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl">
                {[
                  { role: 'Profissional', desc: 'O coração técnico do negócio', icon: '👩‍⚕️' },
                  { role: 'Gestora', desc: 'Cuidando dos processos e números', icon: '📈' },
                  { role: 'Marketing', desc: 'Sendo a voz da sua marca', icon: '📣' },
                  { role: 'Financeiro', desc: 'Fluxo de caixa e investimentos', icon: '💰' },
                  { role: 'Vendas', desc: 'Conquistando a confiança dos clientes', icon: '🤝' },
                  { role: 'Líder', desc: 'Inspirando a equipe e crescendo', icon: '✨' },
                  { role: 'Estrategista', desc: 'Planejando os próximos 5 anos', icon: '🧠' },
                  { role: 'Inovadora', desc: 'Buscando o que há de novo no mundo', icon: '💡' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.role}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.04 * idx }}
                    className="p-5 rounded-2xl bg-white border border-gray-100 shadow-md flex flex-col items-center text-center hover:border-[#3A6351]/40 transition-colors"
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <span className="text-xs font-bold text-[#2C2C2C] uppercase tracking-wider font-sans">
                      {item.role}
                    </span>
                    <span className="text-[11px] text-gray-500 mt-1 leading-snug font-sans">
                      {item.desc}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 italic text-[#3A6351] font-serif font-bold text-base sm:text-lg">
                “Ser excelente na sua profissão não significa automaticamente saber administrar um negócio.”
              </div>
            </div>
          )}

          {/* ==================== TELA 11 — HABILIDADES ==================== */}
          {slide.id === 11 && (
            <div className="flex flex-col items-center text-center w-full max-w-5xl">
              <span className="text-[10px] font-bold text-[#3A6351] uppercase tracking-[0.2em] mb-1 font-sans">
                Pilares de Excelência
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2C2C2C] tracking-tight mb-6">
                O que faz um bom profissional?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl text-left">
                {/* Conhecimento Técnico */}
                <div className="p-6 rounded-3xl bg-white border border-[#E5E9E6] shadow-xl shadow-[#3A6351]/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[#3A6351] font-bold text-xs uppercase tracking-widest mb-4 font-sans">
                      <BookOpen className="w-4 h-4" />
                      CONHECIMENTO TÉCNICO
                    </div>
                    <ul className="space-y-3 text-sm text-gray-700 font-sans">
                      <li className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3A6351]" />
                        Estudo contínuo e fundamentação científica
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3A6351]" />
                        Domínio minucioso da técnica e segurança
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3A6351]" />
                        Atualização permanente em congressos e artigos
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3A6351]" />
                        Responsabilidade com o bem-estar e a ética
                      </li>
                    </ul>
                  </div>
                  <span className="text-xs text-gray-400 font-sans mt-4 block italic">
                    (Você adquire na faculdade e em especializações)
                  </span>
                </div>

                {/* Habilidades Humanas */}
                <div className="p-6 rounded-3xl bg-white border border-[#E5E9E6] shadow-xl shadow-[#3A6351]/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sky-800 font-bold text-xs uppercase tracking-widest mb-4 font-sans">
                      <Heart className="w-4 h-4" />
                      HABILIDADES HUMANAS (SOFT SKILLS)
                    </div>
                    <ul className="space-y-3 text-sm text-gray-700 font-sans">
                      <li className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                        Comunicação clara e transparência
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                        Empatia genuína para ouvir as dores do paciente
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                        Organização, disciplina e pontualidade
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                        Paciência e criatividade para resolver imprevistos
                      </li>
                    </ul>
                  </div>
                  <span className="text-xs text-gray-400 font-sans mt-4 block italic">
                    (Você constrói na postura do dia a dia)
                  </span>
                </div>
              </div>

              <div className="mt-8 text-center text-sm font-serif italic text-gray-600">
                “Gostar da profissão é importante. Gostar de aprender é ainda mais importante.”
              </div>
            </div>
          )}

          {/* ==================== TELA 12 — BASTIDORES ==================== */}
          {slide.id === 12 && (
            <div className="flex flex-col items-center text-center w-full max-w-5xl">
              <span className="text-[10px] font-bold text-[#3A6351] uppercase tracking-[0.2em] mb-1 font-sans">
                A Vida Fora da Tela
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2C2C2C] tracking-tight mb-2">
                A parte que o Instagram não mostra
              </h2>

              <button
                id="toggle-behind-the-scenes-btn"
                onClick={() => setShowBehindTheScenes(!showBehindTheScenes)}
                className="my-3 px-5 py-2 rounded-full bg-[#F4F7F5] hover:bg-[#EAF0EC] text-[#3A6351] text-xs font-bold border border-[#3A6351]/20 flex items-center gap-2 transition-colors uppercase tracking-wider font-sans cursor-pointer"
              >
                {showBehindTheScenes ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Ver o "Palco" (Resultado Bonito)</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Revelar os Bastidores Reais</span>
                  </>
                )}
              </button>

              <div className="w-full max-w-3xl aspect-[16/8] sm:aspect-[16/7] rounded-3xl overflow-hidden relative border border-[#E5E9E6] shadow-xl my-2 flex items-center justify-center">
                {showBehindTheScenes ? (
                  <div className="w-full h-full bg-[#FDFDFD] p-6 flex flex-col justify-center items-center">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3 font-sans">
                      Os Tijolos da Construção Silenciosa:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-2xl">
                      {[
                        'ESTUDO INCANSÁVEL',
                        'INVESTIMENTO FINANCEIRO',
                        'INSEGURANÇA INICIAL',
                        'PRIMEIROS CLIENTES',
                        'ERROS & APRENDIZADOS',
                        'RESPONSABILIDADE LEGAL',
                        'CONCORRÊNCIA',
                        'CONSTÂNCIA ANOS A FIO',
                      ].map((item) => (
                        <div
                          key={item}
                          className="p-3 rounded-xl bg-white border border-[#E5E9E6] text-[11px] font-bold text-gray-700 text-center flex items-center justify-center shadow-sm font-sans"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    <img
                      src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80"
                      alt="Clínica Moderna"
                      className="w-full h-full object-cover filter brightness-[0.8]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/30">
                      <span className="text-xs font-semibold uppercase tracking-widest text-white/90 font-sans">
                        O Feed das Redes Sociais
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                        O Resultado Pronto & Iluminado
                      </h3>
                      <p className="text-xs text-white/80 mt-2 max-w-md font-sans">
                        Clique acima para ver o que sustenta essa foto.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 p-5 bg-white border border-[#E5E9E6] rounded-3xl max-w-2xl shadow-sm">
                <p className="text-base sm:text-lg font-serif italic text-gray-700">
                  “Você vê o resultado. Não vê todos os anos que vieram antes.”
                </p>
              </div>
            </div>
          )}

          {/* ==================== TELA 13 — EXPECTATIVA X REALIDADE ==================== */}
          {slide.id === 13 && (
            <div className="flex flex-col items-center text-center w-full max-w-5xl">
              <span className="text-[10px] font-bold text-[#3A6351] uppercase tracking-[0.2em] mb-1 font-sans">
                Alinhando Expectativas
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2C2C2C] tracking-tight mb-6">
                Expectativa x Realidade
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-4xl text-left">
                {/* Expectativa */}
                <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block font-sans">
                    💭 A EXPECTATIVA COMUM:
                  </span>

                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 text-sm font-sans">
                    “Vou me formar e tudo vai acontecer naturalmente.”
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 text-sm font-sans">
                    “Vou abrir minha clínica e começar faturando alto logo de cara.”
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 text-sm font-sans">
                    “Vou trabalhar com o que amo, então nunca terei estresse.”
                  </div>
                </div>

                {/* Realidade */}
                <div className="p-6 rounded-3xl bg-[#F4F7F5] border border-[#3A6351]/30 shadow-sm space-y-3">
                  <span className="text-xs font-bold text-[#3A6351] uppercase tracking-wider block font-sans">
                    🌱 A REALIDADE CONSTRUTIVA:
                  </span>

                  <div className="p-3.5 rounded-xl bg-white border border-[#3A6351]/20 text-gray-800 font-medium text-sm font-sans">
                    “Preciso continuar aprendendo e me especializando todo dia.”
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#3A6351]/20 text-gray-800 font-medium text-sm font-sans">
                    “Vou precisar aprender a administrar custos e fidelizar pacientes.”
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#3A6351]/20 text-gray-800 font-medium text-sm font-sans">
                    “Mesmo amando minha profissão, haverá dias difíceis e cansativos.”
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <span className="text-sm font-serif italic text-[#3A6351] font-bold">
                  Mensagem: Carreira é uma construção diária.
                </span>
              </div>
            </div>
          )}

          {/* ==================== TELA 14 — DINHEIRO ==================== */}
          {slide.id === 14 && (
            <div className="flex flex-col items-center text-center w-full max-w-5xl">
              <span className="text-[10px] font-bold text-[#3A6351] uppercase tracking-[0.2em] mb-1 font-sans">
                Remuneração & Mercado
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2C2C2C] tracking-tight mb-3">
                E quanto dá para ganhar?
              </h2>

              <p className="text-gray-600 text-sm sm:text-base max-w-2xl mb-6 font-sans">
                Não existe um salário fixo tabelado para todo mundo. O retorno financeiro é o resultado de uma soma de variáveis:
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl my-2">
                {[
                  'FORMAÇÃO SÓLIDA',
                  '+',
                  'EXPERIÊNCIA PRÁTICA',
                  '+',
                  'ESPECIALIZAÇÕES',
                  '+',
                  'MERCADO & REGIÃO',
                  '+',
                  'POSICIONAMENTO',
                  '+',
                  'MODELO DE TRABALHO',
                  '+',
                  'EMPREENDEDORISMO',
                ].map((item, idx) =>
                  item === '+' ? (
                    <span key={idx} className="text-[#3A6351] font-bold text-base">
                      +
                    </span>
                  ) : (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5E9E6] text-xs font-bold text-gray-700 shadow-sm font-sans"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>

              {/* Speaker's perspective card */}
              <div className="mt-6 p-6 bg-white border border-[#E5E9E6] rounded-3xl max-w-2xl text-left shadow-xl shadow-[#3A6351]/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#3A6351] uppercase tracking-wider font-sans">
                    Visão da Palestrante ({config.speakerName})
                  </span>
                  <button
                    id="edit-experience-btn"
                    onClick={onOpenConfig}
                    className="text-[11px] text-gray-400 hover:text-[#3A6351] underline font-sans"
                  >
                    Editar texto
                  </button>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed font-serif italic">
                  "{config.customExperienceText}"
                </p>
              </div>

              <div className="mt-6 text-sm font-serif italic text-gray-700">
                “Não existe um único caminho. Também não existe um único salário.”
              </div>
            </div>
          )}

          {/* ==================== TELA 15 — ESCOLHA PROFISSIONAL ==================== */}
          {slide.id === 15 && (
            <div className="flex flex-col items-center text-center max-w-4xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A6351] mb-2 font-sans">
                Método de Autoanálise
              </span>

              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#2C2C2C] tracking-tight mb-4">
                Então como eu escolho?
              </h2>

              <div className="p-4 bg-[#F4F7F5] border border-[#3A6351]/30 rounded-2xl mb-8">
                <p className="text-xl sm:text-2xl font-serif italic text-[#3A6351] font-bold">
                  “Qual profissão combina comigo de verdade?”
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-3xl text-left">
                {[
                  { num: '01', title: 'O que eu gosto?', desc: 'Interesses que me mantêm curioso' },
                  { num: '02', title: 'No que eu sou bom?', desc: 'Meus talentos e pontos fortes naturais' },
                  { num: '03', title: 'Como gosto de trabalhar?', desc: 'Com pessoas, computadores, laboratório...' },
                  { num: '04', title: 'Que vida eu quero ter?', desc: 'Estabilidade, liberdade ou desafios?' },
                  { num: '05', title: 'Estou disposto à rotina?', desc: 'Aceitar as exigências reais da área', span: 'sm:col-span-2' },
                ].map((q) => (
                  <div
                    key={q.num}
                    className={`p-4 rounded-2xl bg-white border border-[#E5E9E6] flex items-center gap-4 shadow-sm ${
                      q.span || ''
                    }`}
                  >
                    <span className="w-10 h-10 rounded-full bg-[#F4F7F5] text-[#3A6351] font-serif font-bold flex items-center justify-center shrink-0">
                      {q.num}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-[#2C2C2C] font-sans">{q.title}</h4>
                      <p className="text-xs text-gray-500 font-sans">{q.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TELA 16 — O QUE EU GOSTO? ==================== */}
          {slide.id === 16 && (
            <div className="flex flex-col items-center text-center w-full max-w-5xl">
              <span className="text-[10px] font-bold text-[#3A6351] uppercase tracking-[0.2em] mb-1 font-sans">
                Passo 1 de Autoanálise
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2C2C2C] tracking-tight mb-2">
                1. O que eu gosto?
              </h2>

              <p className="text-gray-600 text-sm sm:text-base max-w-2xl mb-6 font-serif italic">
                “Sobre quais assuntos você conseguiria passar horas aprendendo por prazer?”
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full max-w-4xl">
                {[
                  { id: 'pessoas', name: 'PESSOAS', emoji: '👥' },
                  { id: 'tecnologia', name: 'TECNOLOGIA', emoji: '💻' },
                  { id: 'ciencia', name: 'CIÊNCIA', emoji: '🧬' },
                  { id: 'negocios', name: 'NEGÓCIOS', emoji: '💼' },
                  { id: 'criatividade', name: 'CRIATIVIDADE', emoji: '🎨' },
                  { id: 'animais', name: 'ANIMAIS', emoji: '🐾' },
                  { id: 'comunicacao', name: 'COMUNICAÇÃO', emoji: '🎙️' },
                  { id: 'saude', name: 'SAÚDE', emoji: '🩺' },
                  { id: 'natureza', name: 'NATUREZA', emoji: '🌿' },
                  { id: 'arte', name: 'ARTE', emoji: '🎭' },
                ].map((cat) => {
                  const isSelected = selectedInterests.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      id={`interest-btn-${cat.id}`}
                      onClick={() => toggleInterest(cat.id)}
                      className={`p-4 rounded-2xl border transition-all flex flex-col items-center text-center cursor-pointer ${
                        isSelected
                          ? 'bg-[#3A6351] border-[#3A6351] text-white shadow-md shadow-[#3A6351]/20 scale-105'
                          : 'bg-white border-[#E5E9E6] text-gray-700 hover:border-[#3A6351]/40'
                      }`}
                    >
                      <span className="text-2xl mb-1">{cat.emoji}</span>
                      <span className="text-xs font-bold font-sans">{cat.name}</span>
                      {isSelected && (
                        <span className="text-[10px] text-white/90 mt-1 font-semibold">
                          Marcado ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-gray-400 mt-6 font-sans">
                Clique nas áreas para marcar (exercício mental com a sala).
              </p>
            </div>
          )}

          {/* ==================== TELA 17 — NO QUE EU SOU BOM? ==================== */}
          {slide.id === 17 && (
            <div className="flex flex-col items-center text-center w-full max-w-5xl">
              <span className="text-[10px] font-bold text-[#3A6351] uppercase tracking-[0.2em] mb-1 font-sans">
                Passo 2 de Autoanálise
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2C2C2C] tracking-tight mb-2">
                2. No que eu sou bom?
              </h2>

              <p className="text-gray-600 text-sm sm:text-base max-w-2xl mb-6 font-serif italic">
                “O que as pessoas costumam pedir a sua ajuda para fazer no dia a dia?”
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 w-full max-w-3xl">
                {[
                  { id: 'comunicacao', name: 'COMUNICAÇÃO & ESCUTA' },
                  { id: 'criatividade', name: 'CRIATIVIDADE VISUAL' },
                  { id: 'organizacao', name: 'ORGANIZAÇÃO & PLANEJAMENTO' },
                  { id: 'lideranca', name: 'LIDERANÇA & INICIATIVA' },
                  { id: 'calculo', name: 'CÁLCULO & DADOS' },
                  { id: 'cuidado', name: 'CUIDADO & EMPATIA' },
                  { id: 'persuasao', name: 'PERSUASÃO & NEGOCIAÇÃO' },
                  { id: 'tecnologia', name: 'TECNOLOGIA & SISTEMAS' },
                  { id: 'resolucao', name: 'RESOLUÇÃO DE PROBLEMAS' },
                ].map((talent) => {
                  const isSelected = selectedTalents.includes(talent.id);
                  return (
                    <button
                      key={talent.id}
                      id={`talent-btn-${talent.id}`}
                      onClick={() => toggleTalent(talent.id)}
                      className={`p-3.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer font-sans ${
                        isSelected
                          ? 'bg-[#3A6351] border-[#3A6351] text-white shadow-sm'
                          : 'bg-white border-[#E5E9E6] text-gray-700 hover:border-[#3A6351]/40'
                      }`}
                    >
                      {talent.name} {isSelected ? '✓' : ''}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-white border border-[#E5E9E6] rounded-2xl max-w-xl text-xs text-gray-500 font-sans shadow-sm">
                💡 Seu talento muitas vezes parece tão fácil para você que você nem percebe que é um grande diferencial.
              </div>
            </div>
          )}

          {/* ==================== TELA 18 — QUE VIDA EU QUERO? ==================== */}
          {slide.id === 18 && (
            <div className="flex flex-col items-center text-center w-full max-w-5xl">
              <span className="text-[10px] font-bold text-[#3A6351] uppercase tracking-[0.2em] mb-1 font-sans">
                Passo 3 de Autoanálise
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2C2C2C] tracking-tight mb-4">
                3. Que tipo de vida eu quero ter?
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 w-full max-w-4xl my-4">
                {[
                  'ESTABILIDADE',
                  'LIBERDADE',
                  'EMPREENDER',
                  'VIAJAR',
                  'COM PESSOAS',
                  'SOZINHO / FOCO',
                  'FLEXIBILIDADE',
                  'DESAFIOS',
                  'AJUDAR PESSOAS',
                  'CRIAR COISAS',
                ].map((item) => {
                  const isSelected = selectedLifestyles.includes(item);
                  return (
                    <button
                      key={item}
                      id={`lifestyle-btn-${item}`}
                      onClick={() => toggleLifestyle(item)}
                      className={`p-3 rounded-full border text-xs font-bold transition-all cursor-pointer font-sans uppercase tracking-wider ${
                        isSelected
                          ? 'bg-[#3A6351] border-[#3A6351] text-white shadow-sm'
                          : 'bg-white border-[#E5E9E6] text-gray-600 hover:border-[#3A6351]/40'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 p-6 bg-white border border-[#E5E9E6] rounded-3xl max-w-2xl shadow-xl shadow-[#3A6351]/5">
                <p className="text-gray-500 text-sm font-serif italic">
                  Talvez a pergunta principal não seja apenas:
                </p>
                <p className="text-xl sm:text-2xl font-serif font-bold text-gray-800 mt-1">
                  “Qual profissão eu quero?”
                </p>
                <div className="h-0.5 w-16 bg-[#3A6351]/40 my-3 mx-auto" />
                <p className="text-2xl sm:text-3xl font-serif italic font-bold text-[#3A6351]">
                  “Qual vida eu quero construir?”
                </p>
              </div>
            </div>
          )}

          {/* ==================== TELA 19 — ROTINA ==================== */}
          {slide.id === 19 && (
            <div className="flex flex-col items-center text-center w-full max-w-5xl">
              <span className="text-[10px] font-bold text-[#3A6351] uppercase tracking-[0.2em] mb-1 font-sans">
                Consciência Prática
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#2C2C2C] tracking-tight leading-tight max-w-3xl mb-6">
                Uma coisa é gostar da profissão. Outra é gostar da rotina.
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl text-left">
                {[
                  {
                    title: '“Quero ser médico”',
                    question: 'Gosto da rotina de plantões, pressão constante e hospital?',
                  },
                  {
                    title: '“Quero ser empreendedor”',
                    question: 'Estou disposto a lidar com riscos, noites sem dormir e contas?',
                  },
                  {
                    title: '“Quero trabalhar com estética”',
                    question: 'Gosto de lidar diariamente com pessoas, ouvir queixas e ter tato?',
                  },
                  {
                    title: '“Quero trabalhar com tecnologia”',
                    question: 'Gosto de passar horas sentado resolvendo bugs e aprendendo sozinho?',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-[#E5E9E6] shadow-sm flex flex-col justify-between"
                  >
                    <h4 className="text-sm font-serif italic font-bold text-[#3A6351]">
                      {item.title}
                    </h4>
                    <p className="text-gray-700 text-sm font-medium mt-2 font-sans">
                      → {item.question}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-sm font-serif italic text-gray-700">
                “Conheça a rotina antes de se apaixonar apenas pelo título.”
              </div>
            </div>
          )}

          {/* ==================== TELA 20 — DINÂMICA COM CRONÔMETRO ==================== */}
          {slide.id === 20 && (
            <div className="flex flex-col items-center text-center w-full max-w-5xl">
              <span className="text-[10px] font-bold text-[#3A6351] uppercase tracking-[0.2em] mb-1 font-sans">
                Exercício Prático em Sala
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#2C2C2C] tracking-tight mb-2">
                Agora é com você.
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-6 font-sans">
                Pegue seu celular ou uma folha de papel.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-5xl items-center text-left">
                {/* 6 questions sheet styled exactly as design */}
                <div className="lg:col-span-7 space-y-3">
                  {[
                    '1. O que eu gosto?',
                    '2. No que eu sou bom?',
                    '3. O que quero aprender?',
                    '4. Uma profissão que considerei',
                    '5. Uma profissão que gostaria de conhecer melhor',
                    '6. Que tipo de vida quero ter aos 30 anos?',
                  ].map((q, i) => (
                    <div key={i} className="p-4 bg-[#F4F7F5] rounded-xl border border-gray-100">
                      <span className="text-[10px] font-bold text-[#3A6351] uppercase font-sans tracking-wider block">
                        {q}
                      </span>
                      <div className="h-6 border-b border-gray-200 mt-1" />
                    </div>
                  ))}
                </div>

                {/* 2-minute visual timer widget */}
                <div className="lg:col-span-5 flex justify-center">
                  <TimerWidget durationSeconds={120} />
                </div>
              </div>
            </div>
          )}

          {/* ==================== TELA 21 — ANTES DE ESCOLHER ==================== */}
          {slide.id === 21 && (
            <div className="flex flex-col items-center text-center max-w-4xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A6351] mb-2 font-sans">
                Ação Prática
              </span>

              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#2C2C2C] tracking-tight mb-6">
                Antes de escolher, conheça.
              </h2>

              <div className="flex flex-wrap justify-center gap-3 my-4 max-w-3xl">
                {[
                  'CONVERSE COM PROFISSIONAIS',
                  'PESQUISE O MERCADO',
                  'VISITE EMPRESAS E CLÍNICAS',
                  'FAÇA CURSOS INTRODUTÓRIOS',
                  'EXPERIMENTE PROJETOS',
                  'FAÇA PERGUNTAS SINCERAS',
                  'OBSERVE A ROTINA REAL',
                ].map((action, i) => (
                  <span
                    key={i}
                    className="px-5 py-2.5 rounded-full bg-white border border-[#E5E9E6] text-gray-700 font-bold text-xs shadow-sm font-sans tracking-wider"
                  >
                    {action}
                  </span>
                ))}
              </div>

              <div className="mt-8 p-6 bg-white border border-[#E5E9E6] rounded-3xl max-w-2xl shadow-xl shadow-[#3A6351]/5">
                <p className="text-lg sm:text-xl font-serif italic text-[#3A6351] font-bold">
                  “Não escolha uma profissão que você conhece apenas pelo feed do Instagram.”
                </p>
                <p className="text-xs text-gray-400 mt-2 font-sans uppercase tracking-wider">
                  Vá atrás de quem está trabalhando há 5 ou 10 anos na área e faça perguntas sinceras.
                </p>
              </div>
            </div>
          )}

          {/* ==================== TELA 22 — NÃO PRECISA SER PERFEITO ==================== */}
          {slide.id === 22 && (
            <div className="flex flex-col items-center text-center max-w-3xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A6351] mb-3 font-sans">
                Paz de Espírito
              </span>

              <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-[#2C2C2C] tracking-tight uppercase leading-none mb-6">
                Você pode mudar de ideia.
              </h2>

              <div className="space-y-4 my-4">
                <p className="text-xl sm:text-3xl font-serif italic text-gray-600 leading-relaxed">
                  “Mudar de caminho não significa fracassar.”
                </p>
                <p className="text-xl sm:text-3xl font-serif italic font-bold text-[#3A6351] leading-relaxed">
                  “Significa que você descobriu algo novo sobre você.”
                </p>
              </div>

              <div className="mt-8 p-5 bg-white border border-[#E5E9E6] rounded-2xl text-xs sm:text-sm text-gray-500 font-sans shadow-sm">
                Todo aprendizado acumula. Quem você é hoje é o ponto de partida, não a linha de chegada.
              </div>
            </div>
          )}

          {/* ==================== TELA 23 — MENSAGEM FINAL ==================== */}
          {slide.id === 23 && (
            <div className="flex flex-col items-center text-center max-w-4xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A6351] mb-3 font-sans">
                Síntese da Nossa Conversa
              </span>

              <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-[#2C2C2C] tracking-tight leading-tight mb-4">
                Você não precisa ter todas as respostas aos 17.
              </h2>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="my-6 p-4 bg-[#F4F7F5] border border-[#3A6351]/30 rounded-2xl"
              >
                <p className="text-xl sm:text-2xl font-serif italic font-bold text-[#3A6351]">
                  Mas precisa começar a fazer perguntas.
                </p>
              </motion.div>

              <div className="flex flex-wrap justify-center gap-3 mt-4 max-w-2xl">
                {[
                  'CONHEÇA-SE',
                  'PESQUISE',
                  'EXPERIMENTE',
                  'CONVERSE',
                  'APRENDA',
                  'DESCUBRA',
                ].map((word, idx) => (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + 0.1 * idx }}
                    className="px-5 py-2.5 rounded-full bg-white border border-[#E5E9E6] text-gray-700 font-bold text-xs tracking-wider shadow-sm font-sans uppercase"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TELA 24 — ENCERRAMENTO ==================== */}
          {slide.id === 24 && (
            <div className="flex flex-col items-center text-center max-w-4xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif italic mb-4 text-[#2C2C2C]">
                “Não tenham pressa para escolher.”
              </h1>

              <h1 className="text-2xl sm:text-3xl font-light text-gray-500 mb-8 font-serif">
                Tenham curiosidade para descobrir.
              </h1>

              <div className="w-32 h-[1px] bg-[#3A6351] mx-auto mb-8" />

              <div className="flex flex-col items-center gap-2">
                <span className="text-xl font-bold text-[#2C2C2C] font-sans">
                  {config.speakerName}
                </span>
                <span className="text-sm text-gray-500 font-sans">
                  {config.speakerRole} {config.instagram ? `| ${config.instagram}` : ''}
                </span>
                {config.clinicName && (
                  <span className="text-xs text-gray-400 font-sans">
                    {config.clinicName}
                  </span>
                )}
                <span className="text-xs tracking-[0.25em] font-bold text-[#3A6351] uppercase mt-4 font-sans">
                  Obrigado!
                </span>
              </div>

              <div className="mt-8">
                <button
                  id="slide-24-config-btn"
                  onClick={onOpenConfig}
                  className="text-xs text-gray-400 hover:text-[#3A6351] underline font-sans"
                >
                  Personalizar dados de contato da palestrante
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
