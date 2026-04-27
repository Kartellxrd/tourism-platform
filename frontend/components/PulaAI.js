'use client';
import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaPaperPlane, FaRobot, FaMapMarkerAlt, FaSpinner, FaCheckCircle, FaCalendarAlt, FaWallet, FaStar, FaClock } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SUGGESTED_QUESTIONS = [
  "Book me a safari this weekend",
  "Recommend wildlife places near me",
  "Best time to visit Botswana?",
  "Cheapest attractions near me",
  "Tell me about Gaborone Game Reserve",
  "What's the weather like?",
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none w-fit shadow-sm">
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
    </div>
  );
}

function Message({ msg, onBookNow, onViewDestination }) {
  const isUser = msg.role === 'user';
  const content = msg?.content || "I'm processing your request...";

  const formatText = (text) => {
    if (!text) return <span>Processing...</span>;
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
        <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 mr-2 mt-1 shadow-sm">
          <FaRobot className="text-white text-[10px]" />
        </div>
      )}
      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
        isUser
          ? 'bg-blue-600 text-white rounded-tr-none'
          : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
      }`}>
        {formatText(content)}

        {/* Booking Button */}
        {!isUser && msg?.action === 'ready_to_book' && msg?.booking_data && (
          <button
            onClick={() => onBookNow && onBookNow(msg.booking_data)}
            className="mt-3 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <FaCheckCircle className="text-[10px]" /> Confirm Booking
          </button>
        )}

        {/* Recommendations */}
        {!isUser && msg?.action === 'show_recommendations' && msg?.recommendations && (
          <div className="mt-3 space-y-2">
            <p className="text-[10px] text-slate-500 font-medium mb-1">Top picks for you:</p>
            {msg.recommendations.map((rec, idx) => (
              <button
                key={idx}
                onClick={() => onViewDestination && onViewDestination(rec.id)}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50 rounded-xl transition flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-xs">{rec.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      <FaStar className="text-yellow-400 text-[8px]" />
                      <span className="text-[9px]">{rec.rating}</span>
                    </div>
                    <span className="text-[9px] text-slate-400">•</span>
                    <span className="text-[9px] text-slate-500">{rec.category}</span>
                    <span className="text-[9px] text-slate-400">•</span>
                    <span className={`text-[9px] font-semibold ${rec.price_label === 'FREE' ? 'text-green-600' : 'text-blue-600'}`}>
                      {rec.price_label === 'FREE' ? 'FREE' : `P${rec.price}`}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  {rec.match_score}% match
                </span>
              </button>
            ))}
          </div>
        )}

        {/* View Details Link */}
        {!isUser && msg?.dest_id && (
          <button
            onClick={() => onViewDestination && onViewDestination(msg.dest_id)}
            className="mt-2 flex items-center gap-1.5 text-blue-500 hover:text-blue-600 font-bold text-[10px] transition-colors"
          >
            <FaMapMarkerAlt className="text-[9px]" /> View Details →
          </button>
        )}
      </div>
    </div>
  );
}

export default function PulaAI() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Dumela! I'm **Pula**, your AI travel assistant.\n\nI can help you:\n• 📍 **Book trips** - Just say 'book me a safari'\n• 🔍 **Discover places** - Tell me your interests\n• 📅 **Plan your visit** - Best times and seasons\n• 💰 **Find deals** - Budget-friendly options\n\n**What would you like to do today?**",
      dest_id: null,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      const res = await fetch('http://localhost:8000/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || "I processed your request. How can I help further?",
        dest_id: data.dest_id,
        action: data.action,
        booking_data: data.booking_data,
        recommendations: data.recommendations
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "⚠️ Connection error. Please make sure the backend is running on port 8000.\n\nTry again or visit the Explore page manually.",
        dest_id: null,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = async (bookingData) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/ai/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          destination_id: bookingData.destination_id,
          check_in: bookingData.date || new Date().toISOString().split('T')[0],
          guests: bookingData.guests || 2
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `✅ **Booking Confirmed!**\n\n📍 **${result.destination_name}**\n📅 Date: ${bookingData.date || 'Soon'}\n👥 ${bookingData.guests || 2} guests\n💰 Total: **P${result.total_price}**\n\n📋 **Reference:** ${result.booking_reference}\n\nYou can view your booking in the Bookings page.`,
          action: null
        }]);
        
        setTimeout(() => {
          router.push('/dashboard/bookings');
        }, 3000);
      } else {
        throw new Error('Booking failed');
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "❌ Sorry, I couldn't complete your booking. Please try again or visit the Explore page to book manually.",
        dest_id: null,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDestination = (destId) => {
    router.push(`/dashboard/explore/${destId}`);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button - fixed at bottom right, doesn't interfere with content */}
      <div className="fixed bottom-6 right-6 z-50">
        {pulse && !open && (
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30" />
        )}

        <button
          onClick={() => setOpen(!open)}
          className="relative w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full shadow-xl shadow-blue-300/50 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          {open ? (
            <FaTimes className="text-white text-lg" />
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 relative">
                <div className="w-7 h-6 bg-white rounded-lg absolute top-0 left-0 flex items-center justify-center">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-white" />
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </button>

        {!open && (
          <div className="absolute bottom-16 right-0 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            Ask Pula AI 🤖
          </div>
        )}
      </div>

      {/* Chat panel - modal that appears above content but doesn't hide header */}
      {open && (
        <>
          {/* Backdrop - semi-transparent but doesn't block clicks completely */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />
          
          {/* Chat panel - positioned to the right, doesn't cover the whole screen */}
          <div className="fixed top-1/2 right-6 -translate-y-1/2 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
            style={{ height: '600px', maxHeight: 'calc(100vh - 40px)' }}>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center gap-3 flex-shrink-0">
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
                  <p className="text-blue-200 text-[10px]">Powered by AI · Booking Enabled</p>
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
                <Message 
                  key={i} 
                  msg={msg} 
                  onBookNow={handleBookNow}
                  onViewDestination={handleViewDestination}
                />
              ))}
              {loading && (
                <div className="flex items-start gap-2 mb-3">
                  <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
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
                  {SUGGESTED_QUESTIONS.map(q => (
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
                  placeholder="Ask me to book a trip..."
                  className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-7 h-7 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                >
                  {loading ? <FaSpinner className="animate-spin text-[10px]" /> : <FaPaperPlane className="text-[10px]" />}
                </button>
              </div>
              <p className="text-[9px] text-slate-400 text-center mt-2">
                🤖 AI can book trips, find attractions, and give personalized recommendations
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}