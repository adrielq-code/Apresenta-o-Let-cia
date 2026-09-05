import React, { useRef, useEffect } from 'react';
import { Sparkles, CornerDownLeft, Loader2 } from 'lucide-react';

interface AICommandInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export const AICommandInput: React.FC<AICommandInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = 'Ex.: Deixe este slide mais moderno e profissional…',
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        Math.max(textareaRef.current.scrollHeight, 84),
        160
      )}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 focus-within:border-[#3A6351] focus-within:ring-2 focus-within:ring-[#3A6351]/20 shadow-xs transition-all p-3 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="ai-main-prompt-input"
          className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E3B04B]" />
          <span>O que você quer fazer?</span>
        </label>
        <span className="text-[10px] text-gray-400 font-sans hidden sm:inline">
          Pressione <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded font-mono text-[9px]">Enter</kbd> para gerar
        </span>
      </div>

      <textarea
        id="ai-main-prompt-input"
        ref={textareaRef}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        className="w-full resize-none text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent font-sans leading-relaxed"
      />

      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Canvas 16:9 inteligente</span>
        </div>

        <button
          id="ai-submit-generate-btn"
          onClick={onSubmit}
          disabled={isLoading || !value.trim() || disabled}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3A6351] to-[#2A483B] hover:from-[#2e5041] hover:to-[#1e342a] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Gerando…</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#E3B04B]" />
              <span>Gerar</span>
              <CornerDownLeft className="w-3 h-3 text-white/70" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
