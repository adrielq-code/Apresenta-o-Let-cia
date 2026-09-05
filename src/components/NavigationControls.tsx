import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  Minimize, 
  Layers, 
  FileText, 
  Sliders, 
  MonitorPlay,
  RotateCcw
} from 'lucide-react';

interface NavigationControlsProps {
  currentIndex: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onResetToStart: () => void;
  onToggleDrawer: () => void;
  onToggleNotes: () => void;
  onToggleCockpit: () => void;
  onToggleConfig: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isNotesOpen: boolean;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentIndex,
  totalSlides,
  onPrev,
  onNext,
  onResetToStart,
  onToggleDrawer,
  onToggleNotes,
  onToggleCockpit,
  onToggleConfig,
  isFullscreen,
  onToggleFullscreen,
  isNotesOpen,
}) => {
  const currentNumber = currentIndex + 1;
  const progressPercent = (currentNumber / totalSlides) * 100;

  return (
    <nav
      id="presentation-bottom-nav"
      aria-label="Controles da Apresentação"
      className="fixed bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-4xl transition-all duration-300 pointer-events-auto"
    >
      <div className="bg-white/95 backdrop-blur-md border border-[#E5E9E6] rounded-2xl sm:rounded-3xl shadow-xl shadow-[#3A6351]/10 px-2 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-1 sm:gap-3 text-[#2C2C2C]">
        
        {/* Left Side: Slide Drawer & Progress */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Restart to slide 1 */}
          {currentIndex > 0 && (
            <button
              id="nav-btn-restart"
              onClick={onResetToStart}
              title="Voltar ao início"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-gray-400 hover:text-[#3A6351] hover:bg-[#F4F7F5] flex items-center justify-center transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          {/* Slide list drawer button */}
          <button
            id="nav-btn-drawer"
            onClick={onToggleDrawer}
            title="Ver todas as 24 telas"
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl hover:bg-[#F4F7F5] active:bg-[#EAF0EC] text-gray-700 hover:text-[#3A6351] transition-colors text-xs font-sans font-medium cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#3A6351]" />
            <span className="tabular-nums">
              <span className="text-[#2C2C2C] font-bold text-xs sm:text-sm">
                {String(currentNumber).padStart(2, '0')}
              </span>
              <span className="text-gray-300 mx-0.5 sm:mx-1">/</span>
              <span className="text-gray-400 text-xs sm:text-sm">
                {String(totalSlides).padStart(2, '0')}
              </span>
            </span>
          </button>

          {/* Mini progress bar on tablet/desktop */}
          <div className="hidden md:block w-20 lg:w-32 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="bg-[#3A6351] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Center: Previous / Next Slide Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            id="nav-btn-prev"
            onClick={onPrev}
            disabled={currentIndex === 0}
            title="Tela anterior (←)"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 bg-white hover:bg-[#F4F7F5] active:scale-95 text-gray-700 hover:text-[#3A6351] disabled:opacity-20 disabled:hover:bg-white flex items-center justify-center transition-all shadow-sm cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            id="nav-btn-next"
            onClick={onNext}
            disabled={currentIndex === totalSlides - 1}
            title="Próxima tela (→ ou Espaço)"
            className="pill-btn flex items-center justify-center gap-1 sm:gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#3A6351] hover:bg-[#2e5041] active:scale-95 text-white font-bold text-xs tracking-wider uppercase disabled:opacity-25 disabled:hover:bg-[#3A6351] transition-all shadow-md shadow-[#3A6351]/20 cursor-pointer shrink-0"
          >
            <span className="hidden xs:inline text-[11px] sm:text-xs">Avançar</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Right Side: Speaker Tools */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Notes Toggle */}
          <button
            id="nav-btn-notes"
            onClick={onToggleNotes}
            title="Notas da Palestrante (Tecla N)"
            className={`flex items-center justify-center gap-1 w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
              isNotesOpen
                ? 'bg-[#3A6351]/15 text-[#3A6351] border border-[#3A6351]/30'
                : 'hover:bg-[#F4F7F5] text-gray-500 hover:text-[#3A6351] border border-gray-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#3A6351]" />
            <span className="hidden md:inline text-[10px] font-bold uppercase">Notas</span>
          </button>

          {/* Config Data (Ajustes da Palestrante) */}
          <button
            id="nav-btn-config"
            onClick={onToggleConfig}
            title="Ajustes da Palestrante (Nome, fotos, clínica)"
            className="flex items-center justify-center gap-1 w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-full text-gray-500 hover:text-[#3A6351] hover:bg-[#F4F7F5] border border-gray-200 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-[#3A6351]" />
            <span className="hidden md:inline text-[10px] font-bold uppercase">Ajustes</span>
          </button>

          {/* Presenter Mode (Cockpit) - tablet/desktop */}
          <button
            id="nav-btn-cockpit"
            onClick={onToggleCockpit}
            title="Modo Apresentador (Tecla P)"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase border border-gray-200 hover:bg-[#F4F7F5] text-gray-600 hover:text-[#3A6351] transition-colors cursor-pointer"
          >
            <MonitorPlay className="w-3.5 h-3.5 text-[#3A6351]" />
            <span className="hidden lg:inline">Cockpit</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            id="nav-btn-fullscreen"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia (F11)'}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full text-gray-400 hover:text-[#3A6351] hover:bg-[#F4F7F5] flex items-center justify-center transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>
    </nav>
  );
};
