import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIButtonProps {
  isOpen: boolean;
  onClick: () => void;
  isLoading?: boolean;
}

export const AIButton: React.FC<AIButtonProps> = ({ isOpen, onClick, isLoading = false }) => {
  return (
    <button
      id="ai-assistant-toggle-btn"
      onClick={onClick}
      className={`relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer select-none ${
        isOpen
          ? 'bg-gradient-to-r from-[#3A6351] to-[#2A483B] text-white shadow-md shadow-[#3A6351]/30 ring-2 ring-[#E3B04B]'
          : 'bg-gradient-to-r from-[#F4F7F5] to-[#E9F0EC] hover:from-[#E2ECE5] hover:to-[#D4E4DC] text-[#244234] border border-[#3A6351]/25 hover:border-[#3A6351]/50 shadow-xs'
      }`}
      title="Abrir Assistente de IA (Ctrl+I)"
    >
      <Sparkles
        className={`w-3.5 h-3.5 text-[#E3B04B] ${isLoading ? 'animate-spin' : 'animate-pulse'}`}
      />
      <span className="font-extrabold tracking-wide">✨ IA</span>
      {isLoading && (
        <span className="hidden lg:inline text-[10px] font-normal opacity-80 lowercase font-sans">
          pensando…
        </span>
      )}
    </button>
  );
};
