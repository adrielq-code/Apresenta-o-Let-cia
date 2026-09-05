import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SLIDES_DATA } from './data/slidesData';
import { loadSpeakerConfig, saveSpeakerConfig, DEFAULT_SPEAKER_CONFIG } from './data/defaultConfig';
import { SpeakerConfig, SlideData } from './types';
import { SlideRenderer } from './components/SlideRenderer';
import { NavigationControls } from './components/NavigationControls';
import { SpeakerNotesDrawer } from './components/SpeakerNotesDrawer';
import { PresenterCockpitModal } from './components/PresenterCockpitModal';
import { SlideDrawer } from './components/SlideDrawer';
import { ConfigModal } from './components/ConfigModal';
import { Sparkles, Play, MonitorPlay, Settings, List, StickyNote } from 'lucide-react';

export default function App() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPresentationStarted, setIsPresentationStarted] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isCockpitOpen, setIsCockpitOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [speakerConfig, setSpeakerConfig] = useState<SpeakerConfig>(loadSpeakerConfig);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const currentSlide = SLIDES_DATA[currentSlideIndex];

  // Touch gesture listeners for mobile swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Slide navigation handlers
  const handleNext = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.min(SLIDES_DATA.length - 1, prev + 1));
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleGoToSlide = useCallback((index: number) => {
    if (index >= 0 && index < SLIDES_DATA.length) {
      setCurrentSlideIndex(index);
    }
  }, []);

  const handleStartPresentation = () => {
    setIsPresentationStarted(true);
    setCurrentSlideIndex(0);
  };

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting when typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case ' ': // Spacebar
          e.preventDefault();
          if (!isPresentationStarted) {
            setIsPresentationStarted(true);
          } else {
            handleNext();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          setIsNotesOpen((prev) => !prev);
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          setIsCockpitOpen((prev) => !prev);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case 'Escape':
          if (isCockpitOpen) setIsCockpitOpen(false);
          else if (isNotesOpen) setIsNotesOpen(false);
          else if (isDrawerOpen) setIsDrawerOpen(false);
          else if (isConfigOpen) setIsConfigOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isPresentationStarted, isCockpitOpen, isNotesOpen, isDrawerOpen, isConfigOpen]);

  // Handle speaker config update
  const handleSaveConfig = (newConfig: SpeakerConfig) => {
    setSpeakerConfig(newConfig);
    saveSpeakerConfig(newConfig);
  };

  const handleResetConfig = () => {
    setSpeakerConfig(DEFAULT_SPEAKER_CONFIG);
    saveSpeakerConfig(DEFAULT_SPEAKER_CONFIG);
  };

  // Miniature slide representation for the cockpit preview
  const renderSlideMini = (slide: SlideData) => {
    return (
      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-3 text-center pointer-events-none select-none">
        <span className="text-[10px] uppercase font-bold text-teal-400 font-mono">
          Tela {slide.id} — {slide.category}
        </span>
        <h5 className="text-xs font-black text-white mt-1 line-clamp-2 leading-tight">
          {slide.title}
        </h5>
        {slide.subtitle && (
          <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
            {slide.subtitle}
          </p>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[100dvh] bg-[#FDFDFD] text-[#2C2C2C] flex flex-col items-center justify-between relative font-sans select-none overflow-x-hidden"
    >
      {/* Background soft artistic ambient lighting */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#3A6351]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#3A6351]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Start Splash Screen if not yet started */}
      {!isPresentationStarted ? (
        <div className="w-full min-h-full flex flex-col items-center justify-start sm:justify-center text-center p-4 sm:p-6 z-20 max-w-4xl relative overflow-y-auto my-auto py-6 sm:py-8">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-full bg-[#F4F7F5] border border-[#3A6351]/20 text-[#3A6351] text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase mb-4 sm:mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#3A6351]" />
            Palestra Inspiracional • Ensino Médio
          </div>

          <h1 className="text-4xl sm:text-7xl md:text-8xl font-serif font-bold text-[#2C2C2C] tracking-tight leading-[1.08]">
            ESCOLHENDO<br />MEU FUTURO
          </h1>

          <h2 className="text-lg sm:text-2xl md:text-3xl text-gray-500 font-serif italic font-normal mt-2 sm:mt-4 mb-2">
            Da Farmácia ao empreendedorismo na Estética
          </h2>

          <div className="my-5 sm:my-8 p-5 sm:p-8 bg-white border border-[#E5E9E6] rounded-3xl max-w-xl shadow-xl shadow-[#3A6351]/5">
            <p className="text-sm sm:text-lg text-gray-600 leading-relaxed font-serif italic">
              “Você não precisa ter sua vida inteira planejada aos 17 anos. Mas precisa começar a descobrir quem você é, o que gosta, no que é bom e quais caminhos existem.”
            </p>
            <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] sm:text-xs text-gray-400 font-sans uppercase tracking-wider">
              <span>Palestrante: <strong className="text-[#3A6351]">{speakerConfig.speakerName}</strong></span>
              <span>Duração: <strong>~45-50 min</strong></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
            <button
              id="splash-start-lecture-btn"
              onClick={handleStartPresentation}
              className="pill-btn w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#3A6351] hover:bg-[#2e5041] text-white font-bold text-xs tracking-widest uppercase shadow-xl shadow-[#3A6351]/25 flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>COMEÇAR PALESTRA</span>
            </button>

            <button
              id="splash-cockpit-btn"
              onClick={() => {
                setIsPresentationStarted(true);
                setIsCockpitOpen(true);
              }}
              className="pill-btn w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-full bg-white hover:bg-[#F4F7F5] text-gray-700 text-xs font-bold uppercase tracking-wider border border-gray-200 flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <MonitorPlay className="w-4 h-4 text-[#3A6351]" />
              <span>Modo Apresentador</span>
            </button>
          </div>

          <div className="mt-6 sm:mt-10 text-[10px] sm:text-[11px] text-gray-400 tracking-wider uppercase font-medium flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            <span>24 telas narrativas</span>
            <span>•</span>
            <span>Notas para a palestrante</span>
            <span>•</span>
            <span>Layout responsivo</span>
          </div>
        </div>
      ) : (
        /* Active Presentation Stage with Header and Responsive Stage */
        <div className="w-full flex-1 flex flex-col justify-between items-center relative overflow-hidden h-[100dvh]">
          {/* Header with Quick Navigation & Settings Shortcuts */}
          <header className="w-full h-12 border-b border-gray-100/90 flex items-center justify-between px-3 sm:px-8 bg-white/90 backdrop-blur-md z-30 shrink-0">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-[10px] tracking-[0.2em] font-bold text-gray-400 uppercase font-sans truncate max-w-[120px] sm:max-w-none">
                ESCOLHENDO MEU FUTURO
              </span>
              <div className="hidden sm:block h-1 w-28 md:w-56 bg-gray-100 rounded-full overflow-hidden">
                <div
                  id="header-progress-bar"
                  className="h-full bg-[#3A6351] transition-all duration-300 rounded-full"
                  style={{ width: `${((currentSlideIndex + 1) / SLIDES_DATA.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Header Right Actions: Quick Access on Mobile & Desktop */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                id="header-slides-drawer-btn"
                onClick={() => setIsDrawerOpen(true)}
                className="sm:hidden p-2 rounded-xl text-gray-500 hover:text-[#3A6351] hover:bg-[#F4F7F5] transition-colors cursor-pointer"
                title="Lista de Telas"
                aria-label="Abrir lista de telas"
              >
                <List className="w-4 h-4" />
              </button>

              <button
                id="header-notes-btn"
                onClick={() => setIsNotesOpen((prev) => !prev)}
                className={`sm:hidden p-2 rounded-xl transition-colors cursor-pointer ${
                  isNotesOpen ? 'bg-[#3A6351] text-white' : 'text-gray-500 hover:text-[#3A6351] hover:bg-[#F4F7F5]'
                }`}
                title="Roteiro / Notas"
                aria-label="Abrir roteiro"
              >
                <StickyNote className="w-4 h-4" />
              </button>

              <button
                id="header-config-btn"
                onClick={() => setIsConfigOpen(true)}
                className="sm:hidden p-2 rounded-xl text-gray-500 hover:text-[#3A6351] hover:bg-[#F4F7F5] transition-colors cursor-pointer"
                title="Ajustes da Palestrante"
                aria-label="Ajustes e personalização"
              >
                <Settings className="w-4 h-4" />
              </button>

              <span className="text-[10px] tracking-[0.15em] font-bold text-gray-400 font-sans uppercase pl-1 sm:pl-0">
                Tela <span className="text-[#3A6351] font-bold text-xs">{currentSlideIndex + 1}</span> / {SLIDES_DATA.length}
              </span>
            </div>
          </header>

          {/* Main Slide Presentation Stage with Touch Swipe Support */}
          <main
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full flex-1 flex items-stretch justify-center relative overflow-hidden"
          >
            <SlideRenderer
              slide={currentSlide}
              config={speakerConfig}
              onNextSlide={handleNext}
              onOpenConfig={() => setIsConfigOpen(true)}
            />
          </main>

          {/* Floating Presentation Bottom Navigation */}
          <NavigationControls
            currentIndex={currentSlideIndex}
            totalSlides={SLIDES_DATA.length}
            onPrev={handlePrev}
            onNext={handleNext}
            onResetToStart={() => handleGoToSlide(0)}
            onToggleDrawer={() => setIsDrawerOpen(true)}
            onToggleNotes={() => setIsNotesOpen((prev) => !prev)}
            onToggleCockpit={() => setIsCockpitOpen(true)}
            onToggleConfig={() => setIsConfigOpen(true)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            isNotesOpen={isNotesOpen}
          />
        </div>
      )}

      {/* Slide Index Drawer */}
      <SlideDrawer
        slides={SLIDES_DATA}
        currentSlideIndex={currentSlideIndex}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectSlide={handleGoToSlide}
      />

      {/* Speaker Notes Drawer (Discrete side/bottom panel) */}
      <SpeakerNotesDrawer
        notes={currentSlide.notes}
        currentSlide={currentSlide.id}
        totalSlides={SLIDES_DATA.length}
        slideTitle={currentSlide.title}
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {/* Presenter Cockpit Modal (Full dual view with timer & script) */}
      <PresenterCockpitModal
        slides={SLIDES_DATA}
        currentSlideIndex={currentSlideIndex}
        isOpen={isCockpitOpen}
        onClose={() => setIsCockpitOpen(false)}
        onGoToSlide={handleGoToSlide}
        renderSlideMini={renderSlideMini}
      />

      {/* Speaker Config Modal (Customize name, clinic, photos, etc.) */}
      <ConfigModal
        config={speakerConfig}
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSave={handleSaveConfig}
        onReset={handleResetConfig}
      />
    </div>
  );
}
