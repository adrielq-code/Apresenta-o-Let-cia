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
    <div
      id="presentation-bottom-nav"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl transition-all duration-300 pointer-events-auto"
    >
      <div className="bg-white/95 backdrop-blur-md border border-[#E5E9E6] rounded-2xl shadow-xl shadow-[#3A6351]/5 px-4 py-2.5 flex items-center justify-between gap-2 text-[#2C2C2C]">
        
        {/* Left Side: Progress & Jump Drawer */}
        <div className="flex items-center gap-2">
          {/* Restart to slide 1 button if not at start */}
          {currentIndex > 0 && (
            <button
              id="nav-btn-restart"
              onClick={onResetToStart}
              title="Voltar ao início"
              className="p-2 rounded-xl text-gray-400 hover:text-[#3A6351] hover:bg-[#F4F7F5] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Slide list drawer button */}
          <button
            id="nav-btn-drawer"
            onClick={onToggleDrawer}
            title="Ver todas as telas"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#F4F7F5] text-gray-600 hover:text-[#3A6351] transition-colors text-xs font-sans font-medium"
          >
            <Layers className="w-4 h-4 text-[#3A6351]" />
            <span>
              <span className="text-[#2C2C2C] font-bold text-sm">
                {String(currentNumber).padStart(2, '0')}
              </span>
              <span className="text-gray-300 mx-1">/</span>
              <span className="text-gray-400">
                {String(totalSlides).padStart(2, '0')}
              </span>
            </span>
          </button>

          {/* Mini progress bar */}
          <div className="hidden sm:block w-24 md:w-36 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="bg-[#3A6351] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Center: Previous / Next Slide Controls */}
        <div className="flex items-center gap-2">
          <button
            id="nav-btn-prev"
            onClick={onPrev}
            disabled={currentIndex === 0}
            title="Tela anterior (← ou Seta Esquerda)"
            className="p-2.5 rounded-full border border-gray-200 bg-white hover:bg-[#F4F7F5] text-gray-600 hover:text-[#3A6351] disabled:opacity-20 disabled:hover:bg-white transition-all active:scale-95 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            id="nav-btn-next"
            onClick={onNext}
            disabled={currentIndex === totalSlides - 1}
            title="Próxima tela (→ ou Barra de Espaço)"
            className="pill-btn flex items-center gap-2 px-5 py-2 rounded-full bg-[#3A6351] hover:bg-[#2e5041] text-white font-bold text-xs tracking-wider uppercase disabled:opacity-25 disabled:hover:bg-[#3A6351] transition-all shadow-md shadow-[#3A6351]/20 active:scale-95"
          >
            <span className="hidden xs:inline">Avançar</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Side: Speaker Tools */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notes Toggle */}
          <button
            id="nav-btn-notes"
            onClick={onToggleNotes}
            title="Notas da Palestrante (Tecla N)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-colors ${
              isNotesOpen
                ? 'bg-[#3A6351]/10 text-[#3A6351] border border-[#3A6351]/30'
                : 'hover:bg-[#F4F7F5] text-gray-500 hover:text-[#3A6351] border border-gray-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#3A6351]" />
            <span className="hidden md:inline text-[10px] font-bold">Notas</span>
          </button>

          {/* Presenter Mode (Cockpit) */}
          <button
            id="nav-btn-cockpit"
            onClick={onToggleCockpit}
            title="Modo Apresentador Completo (Tecla P)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase border border-gray-200 hover:bg-[#F4F7F5] text-gray-600 hover:text-[#3A6351] transition-colors"
          >
            <MonitorPlay className="w-3.5 h-3.5 text-[#3A6351]" />
            <span className="hidden md:inline">Apresentador</span>
          </button>

          {/* Config Data */}
          <button
            id="nav-btn-config"
            onClick={onToggleConfig}
            title="Personalizar dados da palestrante"
            className="p-2 rounded-full text-gray-400 hover:text-[#3A6351] hover:bg-[#F4F7F5] transition-colors"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            id="nav-btn-fullscreen"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Tela Cheia (F11)'}
            className="p-2 rounded-full text-gray-400 hover:text-[#3A6351] hover:bg-[#F4F7F5] transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
