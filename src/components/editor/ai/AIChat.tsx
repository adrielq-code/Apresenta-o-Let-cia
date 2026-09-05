import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { chatWithAICopilot } from '../../../services/aiService';
import { EditorSlide } from '../../../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedAction?: {
    label: string;
    prompt: string;
  };
}

interface AIChatProps {
  slide: EditorSlide;
  slideIndex: number;
  onApplyPrompt: (prompt: string) => void;
}

export const AIChat: React.FC<AIChatProps> = ({ slide, slideIndex, onApplyPrompt }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Olá! Sou seu Copiloto de Design e Apresentação. Estou analisando o Slide #${slideIndex + 1}: "${slide.title || 'Sem título'}". Como posso ajudar você a deixá-lo impecável?`,
      suggestedAction: {
        label: '✨ Deixar mais moderno',
        prompt: 'Deixe este slide mais moderno e profissional',
      },
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAICopilot({
        messages: [...messages, newMsg].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        slideContext: {
          title: slide.title,
          elementsCount: slide.elements.length,
          slideIndex,
        },
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: response.reply,
          suggestedAction: userText.toLowerCase().includes('pergunta')
            ? { label: '✨ Adicionar pergunta ao slide', prompt: 'Adicione uma pergunta reflexiva de impacto no slide' }
            : userText.toLowerCase().includes('resum')
            ? { label: '✨ Resumir em tópicos agora', prompt: 'Resuma este slide em tópicos' }
            : undefined,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: 'Desculpe, tive um contratempo ao formular a resposta, mas posso aplicar ajustes visuais diretamente no seu slide!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {messages.map((m) => {
          const isAI = m.role === 'assistant';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  isAI
                    ? 'bg-[#3A6351] text-white'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                {isAI ? <Bot className="w-4 h-4 text-[#E3B04B]" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-sans ${
                  isAI
                    ? 'bg-gray-50 border border-gray-200/80 text-gray-800'
                    : 'bg-[#3A6351] text-white shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>

                {m.suggestedAction && (
                  <button
                    onClick={() => onApplyPrompt(m.suggestedAction!.prompt)}
                    className="mt-2.5 px-2.5 py-1 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-[#3A6351] text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-[#E3B04B]" />
                    <span>{m.suggestedAction.label}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-xs text-gray-400 italic">
            <Bot className="w-4 h-4 text-[#3A6351] animate-spin" />
            <span>Copiloto formulando resposta…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-2.5 bg-gray-50 border-t border-gray-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Converse com o copiloto sobre o slide..."
          className="flex-1 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3A6351]/20 focus:border-[#3A6351]"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-xl bg-[#3A6351] hover:bg-[#2e5041] disabled:opacity-40 text-white transition-colors cursor-pointer"
          title="Enviar mensagem"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
