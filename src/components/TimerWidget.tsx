import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TimerWidgetProps {
  durationSeconds?: number;
  onComplete?: () => void;
}

export const TimerWidget: React.FC<TimerWidgetProps> = ({
  durationSeconds = 120,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isActive, setIsActive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play gentle chime on complete using Web Audio API
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.3); // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.6); // G5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(261.63, now); // C4

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.8);
      osc2.stop(now + 1.8);
    } catch (e) {
      console.warn('Audio playback not supported in iframe', e);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#14b8a6', '#38bdf8', '#fbbf24'],
      });
      if (onComplete) onComplete();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onComplete]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(durationSeconds);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((durationSeconds - timeLeft) / durationSeconds) * 100;
  const isFinished = timeLeft === 0;

  return (
    <div className="bg-white border border-[#E5E9E6] rounded-3xl p-6 shadow-xl shadow-[#3A6351]/5 flex flex-col items-center max-w-sm w-full text-[#2C2C2C]">
      <div className="flex items-center gap-2 mb-3 text-[#3A6351]">
        <Clock className="w-4 h-4" />
        <span className="text-[11px] font-bold tracking-[0.2em] uppercase font-sans">Tempo de Reflexão</span>
      </div>

      {/* Circular / Progress Ring display */}
      <div className="relative w-44 h-44 flex items-center justify-center my-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="currentColor"
            strokeWidth="4"
            className="text-[#F4F7F5]"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={264}
            strokeDashoffset={264 - (264 * progressPercent) / 100}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-linear ${
              isFinished ? 'text-[#3A6351]' : isActive ? 'text-[#E63946]' : 'text-[#3A6351]'
            }`}
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          {isFinished ? (
            <div className="flex flex-col items-center text-[#3A6351] animate-bounce">
              <CheckCircle className="w-8 h-8 mb-1" />
              <span className="text-xs font-bold uppercase tracking-wider">Tempo Concluído!</span>
            </div>
          ) : (
            <>
              <span className={`text-5xl font-serif font-bold tracking-tight transition-colors ${
                isActive ? 'timer-running text-[#E63946]' : 'text-[#2C2C2C]'
              }`}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-[11px] text-gray-400 mt-1 font-sans uppercase tracking-wider">
                {isActive ? 'Em contagem...' : '2 minutos'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mt-4 w-full">
        <button
          id="timer-toggle-btn"
          onClick={handleStartPause}
          className={`pill-btn flex-1 py-3 px-5 rounded-full font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md ${
            isActive
              ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              : 'bg-[#3A6351] text-white hover:bg-[#2e5041] shadow-[#3A6351]/20'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Pausar
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" /> {timeLeft === durationSeconds ? 'COMEÇAR 2 MIN' : 'Continuar'}
            </>
          )}
        </button>

        <button
          id="timer-reset-btn"
          onClick={handleReset}
          title="Reiniciar Cronômetro"
          className="p-3 rounded-full bg-white text-gray-500 hover:text-[#3A6351] hover:bg-[#F4F7F5] transition-colors border border-gray-200 shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
