'use client';
import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaPaperPlane, FaRobot, FaMapMarkerAlt } from 'react-icons/fa';
import Link from 'next/link';

const SUGGESTED_QUESTIONS = [
  "Should I visit Okavango Delta now?",
  "Recommend a safari under P2000",
  "Where can I see elephants?",
  "What's the weather like?",
  "Best time to visit Chobe?",
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none w-fit shadow-sm">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';

  // Convert markdown-like formatting to JSX
  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mr-2 mt-1 shadow-sm">
          <FaRobot className="text-white text-[10px]" />
        </div>
      )}
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
        isUser
          ? 'bg-blue-600 text-white rounded-tr-none'
          : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
      }`}>
        {formatText(msg.content)}

        {/* Show destination link if AI returned one */}
        {!isUser && msg.dest_id && (
          <Link
            href="/dashboard/explore"
            className="mt-2 flex items-center gap-1.5 text-blue-500 hover:text-blue-600 font-bold text-[10px] transition-colors"
          >
            <FaMapMarkerAlt className="text-[9px]" /> View on Explore →
          </Link>
        )}
      </div>
    </div>
  );
}

export default function PulaAI() {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState([
    {
      role:    'assistant',
      content: "Dumela! 👋 I'm Pula, your AI tourism assistant. Ask me about the best time to visit destinations, budget safaris, wildlife spotting, or get personalised recommendations!",
      dest_id: null,
    }
  ]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [pulse, setPulse]         = useState(true);
  const messagesEndRef            = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Stop pulsing after first open
  useEffect(() => {
    if (open) setPulse(false);
  }, [open]);

  const sendMessage = async (text) => {
    const query = text || input.trim();
    if (!query) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ query }),
      });

      const data = await res.json();

      setMessages(prev => [...prev, {
        role:    'assistant',
        content: data.response || "I couldn't process that. Try rephrasing!",
        dest_id: data.dest_id,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: "Connection error. Make sure FastAPI is running!",
        dest_id: null,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Pulse ring */}
        {pulse && (
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30" />
        )}

        <button
          onClick={() => setOpen(!open)}
          className="relative w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-xl shadow-blue-300/50 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          {open ? (
            <FaTimes className="text-white text-lg" />
          ) : (
            /* Animated robot face */
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 relative">
                {/* Robot head */}
                <div className="w-7 h-6 bg-white rounded-lg absolute top-0 left-0 flex items-center justify-center">
                  {/* Eyes */}
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
                {/* Antenna */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-white" />
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </button>

        {/* Tooltip */}
        {!open && (
          <div className="absolute bottom-16 right-0 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            Ask Pula AI 🤖
          </div>
        )}
      </div>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          style={{ height: '520px' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center gap-3 flex-shrink-0">
            {/* Animated robot */}
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/30">
              <div className="flex flex-col items-center">
                <div className="w-6 h-5 bg-white rounded-md flex items-center justify-center mb-0.5">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" />
                    <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
                <div className="w-4 h-1 bg-white/60 rounded-full" />
              </div>
            </div>
            <div>
              <p className="text-white font-black text-sm">Pula AI</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <p className="text-blue-200 text-[10px]">Tourism Assistant · Online</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto w-7 h-7 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-all"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}
            {loading && (
              <div className="flex items-start gap-2 mb-3">
                <div className="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FaRobot className="text-white text-[10px]" />
                </div>
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex-shrink-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.slice(0, 3).map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-[10px] font-bold px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-full transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-slate-100 flex-shrink-0 bg-white">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2 focus-within:border-blue-200 focus-within:bg-white transition-all">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Botswana tourism..."
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-7 h-7 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0"
              >
                <FaPaperPlane className="text-[10px]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}