import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Classroom, MaintenanceTicket } from '../types/campus';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  DoorOpen, 
  Loader2 
} from 'lucide-react';

interface AiChatViewProps {
  onOpenBookingModal?: (room: Classroom) => void;
  onOpenReportModal?: (prefill?: Partial<MaintenanceTicket>) => void;
}

export const AiChatView: React.FC<AiChatViewProps> = ({
  onOpenBookingModal,
  onOpenReportModal
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: "Hello! I'm CampusOps Copilot, your real-time campus management assistant. I can inspect classroom availability, check maintenance logs, file complaint tickets, schedule room bookings, or query building telemetry. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });

      if (!res.ok) throw new Error('Failed to communicate with AI server');
      const data = await res.json();

      const cards = data.actionType === 'room_recommendations' && Array.isArray(data.actionPayload)
        ? data.actionPayload.map((r: any) => ({ type: 'room' as const, data: r }))
        : undefined;

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Request processed successfully.',
        cards,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          sender: 'assistant',
          text: "I'm currently unable to connect to the Gemini service. Please verify your GEMINI_API_KEY or try again shortly.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Find available computer lab with 30+ seats",
    "Report projector flicker in Orion A-101",
    "List critical pending maintenance tickets",
    "Show energy demand for all 3 buildings"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-2xl bg-[#121318] border border-[#252630] overflow-hidden shadow-2xl">
      {/* Top Banner */}
      <div className="p-4 bg-[#0e0f14] border-b border-[#252630] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF2E88] to-[#007BA7] flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              CampusOps Intelligent Copilot
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </h2>
            <p className="text-[11px] text-slate-400">
              Grounded on real-time campus buildings, classrooms, inventory, and staff rosters.
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white text-xs ${
                isUser ? 'bg-[#007BA7]' : 'bg-gradient-to-tr from-[#FF2E88] to-[#007BA7]'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-2 max-w-[85%] sm:max-w-[75%]">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#007BA7] text-white rounded-tr-none'
                    : 'bg-[#181924] border border-[#252630] text-slate-200 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>

                {/* Cards */}
                {m.cards && m.cards.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {m.cards.map((c, idx) => {
                      if (c.type === 'room') {
                        const room = c.data as Classroom;
                        return (
                          <div
                            key={room.id || idx}
                            className="p-3 rounded-xl bg-[#0d0e14] border border-[#007BA7]/40 flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <DoorOpen className="w-3.5 h-3.5 text-[#007BA7]" />
                                Room {room.roomNumber} ({room.name})
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Cap: {room.capacity} • {room.type}
                              </div>
                            </div>
                            {onOpenBookingModal && (
                              <button
                                onClick={() => onOpenBookingModal(room)}
                                className="px-3 py-1.5 rounded-lg bg-[#007BA7] hover:bg-[#0284c7] text-white text-xs font-semibold cursor-pointer"
                              >
                                Book Room
                              </button>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}

                <span className={`text-[10px] text-slate-500 block ${isUser ? 'text-right' : 'text-left'}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF2E88] to-[#007BA7] flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-[#181924] border border-[#252630] text-xs text-slate-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#FF2E88]" />
              <span>Thinking and querying campus systems...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Pills */}
      <div className="px-4 py-2 border-t border-[#252630]/60 bg-[#0e0f14] overflow-x-auto flex gap-2 no-scrollbar">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s)}
            className="px-3 py-1 rounded-full text-[11px] bg-[#1a1c26] text-slate-300 hover:text-white hover:border-[#FF2E88]/50 border border-[#252630] whitespace-nowrap cursor-pointer transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-[#0d0e14] border-t border-[#252630]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask CampusOps Copilot about rooms, complaints, power draw, or inventory..."
            className="flex-1 px-4 py-3 rounded-xl bg-[#161720] border border-[#252630] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2E88]"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#d8196e] text-white hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-lg shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
