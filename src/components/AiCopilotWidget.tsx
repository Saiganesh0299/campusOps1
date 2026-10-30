import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Loader2, ArrowRight } from 'lucide-react';
import { Classroom } from '../types/campus';

interface AiCopilotWidgetProps {
  onOpenBookingModal?: (room: Classroom) => void;
  onOpenReportModal?: () => void;
}

export const AiCopilotWidget: React.FC<AiCopilotWidgetProps> = ({
  onOpenBookingModal,
  onOpenReportModal
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Hi! Need help finding an available room, reporting an issue, or querying campus data?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const query = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });

      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply || 'Request completed.' }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Sorry, I had trouble reaching the AI server. Please verify your GEMINI_API_KEY.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#FF2E88] to-[#007BA7] text-white font-semibold text-xs shadow-[0_8px_30px_rgba(255,46,136,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 animate-spin group-hover:rotate-45 transition-transform" />
          <span>AI Copilot</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </button>
      )}

      {/* Floating Popup Drawer */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] rounded-2xl bg-[#0A0A0C]/95 backdrop-blur-xl border border-[#252630] shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-white animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-[#121318] border-b border-[#252630] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF2E88] to-[#007BA7] flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold">CampusOps Copilot</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Online</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-[10px] ${
                  m.role === 'user' ? 'bg-[#007BA7]' : 'bg-[#FF2E88]'
                }`}>
                  {m.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                </div>
                <div className={`p-2.5 rounded-xl max-w-[80%] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#007BA7] text-white rounded-tr-none'
                    : 'bg-[#181924] border border-[#252630] text-slate-200 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-md bg-[#FF2E88] shrink-0 flex items-center justify-center">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="p-2.5 rounded-xl bg-[#181924] border border-[#252630] text-slate-400 flex items-center gap-1.5 text-xs">
                  <Loader2 className="w-3 h-3 animate-spin text-[#FF2E88]" />
                  <span>Checking campus ops...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 bg-[#121318] border-t border-[#252630] flex gap-1.5 overflow-x-auto no-scrollbar">
            {['Find available rooms', 'Report issue', 'Campus energy status'].map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(p);
                }}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e202c] hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer border border-[#252630]"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-2 bg-[#0e0f14] border-t border-[#252630] flex items-center gap-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask copilot..."
              className="flex-1 px-3 py-2 rounded-xl bg-[#161720] border border-[#252630] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2E88]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-[#FF2E88] text-white hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
