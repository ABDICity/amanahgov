import React, { useState } from 'react';
import {
  X,
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Scale,
  Lock,
  Radio,
  Cpu,
  BookOpen,
} from 'lucide-react';
import { askTanyaAmanahGov, TanyaMessage } from '../services/tanyaAmanahGovService';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  category?: string;
  sources?: string[];
  suggestedQuestions?: string[];
}

interface AiAmanahAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFullChat?: () => void;
}

export const AiAmanahAssistantModal: React.FC<AiAmanahAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateToFullChat,
}) => {
  if (!isOpen) return null;

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Assalamu’alaikum Warahmatullahi Wabarakatuh. Saya adalah Tanya AmanahGov AI, asisten cerdas otomatis siap menjawab pertanyaan Anda seputar status prosedur, regulasi, dan pelacakan aduan layanan publik.',
      timestamp: 'Sekarang',
      category: 'Sambutan',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    'Bagaimana status aduan ADU-2026-0811?',
    'Apakah pembuatan NIB UMKM benar-benar Rp 0 tanpa pungli?',
    'Apa sanksi bagi oknum yang meminta uang pelicin/suap?',
    'Berapa standar waktu SLA penanganan jalan rusak darurat?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    const userMsg: Message = {
      sender: 'user',
      text: query,
      timestamp: 'Baru saja',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    const historyPayload: TanyaMessage[] = messages.map((m, i) => ({
      id: `m-${i}`,
      sender: m.sender,
      text: m.text,
      timestamp: m.timestamp,
    }));

    const result = await askTanyaAmanahGov(query, historyPayload);

    const aiMsg: Message = {
      sender: 'ai',
      text: result.answer,
      timestamp: 'Baru saja',
      category: result.category,
      sources: result.sources,
      suggestedQuestions: result.suggestedQuestions,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] max-h-[90vh]"
        id="modal-ai-assistant"
      >
        {/* Modal Header */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                Tanya AmanahGov AI
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Gemini 3.8 Flash
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Jawaban otomatis seputar prosedur, regulasi, &amp; status aduan publik
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onNavigateToFullChat && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToFullChat();
                }}
                className="text-xs px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors"
                title="Buka tampilan penuh di dasbor"
              >
                Dasbor Penuh ↗
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-sm'
                }`}
              >
                {m.category && (
                  <span className="inline-block text-[10px] font-semibold text-emerald-400 mb-1">
                    {m.category}
                  </span>
                )}
                <div className="whitespace-pre-line">{m.text}</div>

                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-slate-700/60 text-[10px] text-slate-400">
                    <span className="font-semibold text-emerald-400">Rujukan: </span>
                    {m.sources.join(' • ')}
                  </div>
                )}

                <span
                  className={`text-[9px] mt-1.5 block ${
                    m.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-9">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-200" />
              <span>Tanya AmanahGov AI sedang menyusun jawaban...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts Chips */}
        <div className="p-2.5 bg-slate-900 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2 text-[11px] scrollbar-none">
          <span className="text-slate-400 shrink-0 font-medium flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Tanya Cepat:
          </span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Tanyakan status aduan, alur NIB, bansos, atau regulasi publik..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

