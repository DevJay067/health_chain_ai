import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Activity, HeartPulse, Sparkles, BrainCircuit } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  isAnalyzing?: boolean;
}

export default function BMaxChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I am B-MAX AI, your advanced health assistant. I can help you understand your medical reports, check symptoms, or provide general health guidance. How can I assist you today?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text: string = inputValue) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      setIsTyping(false);
      let botResponse = "I'm analyzing your request. Since I am in demo mode, I can't provide real medical advice. Please consult a doctor for serious concerns.";
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes('blood') || lowerText.includes('report')) {
        botResponse = "Based on typical blood work, ensure your Hemoglobin, WBC, and Platelets are within reference ranges. If any values are flagged (H or L), I recommend discussing them with your primary care physician. Would you like me to analyze a specific value?";
      } else if (lowerText.includes('headache') || lowerText.includes('pain')) {
        botResponse = "I understand you're experiencing pain. Ensure you stay hydrated and rest. If it's a severe, sudden headache, or accompanied by vision changes or fever, please seek immediate emergency care.";
      } else if (lowerText.includes('diet') || lowerText.includes('food')) {
        botResponse = "A balanced diet rich in leafy greens, lean proteins, and complex carbohydrates is essential for optimal health. Let me know if you have specific dietary restrictions or health goals!";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1500);
  };

  const suggestions = [
    "Analyze my blood report",
    "What do these symptoms mean?",
    "Healthy diet suggestions"
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white/40 backdrop-blur-3xl rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      
      {/* Header */}
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center border border-lime-500/30">
            <BrainCircuit className="w-6 h-6 text-lime-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg flex items-center space-x-2">
              <span>B-MAX AI</span>
              <span className="bg-lime-500 text-slate-900 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">v2.0</span>
            </h3>
            <p className="text-slate-400 text-xs">Medical Analysis Engine</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></div>
          <span className="text-lime-500 text-xs font-bold uppercase tracking-widest hidden sm:inline-block">Online</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`flex max-w-[85%] sm:max-w-[75%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm ${
                msg.type === 'user' 
                  ? 'bg-slate-900 text-white ml-3 sm:ml-4' 
                  : 'bg-white border border-slate-200 text-lime-600 mr-3 sm:mr-4'
              }`}>
                {msg.type === 'user' ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
              </div>

              <div className={`p-4 rounded-2xl sm:rounded-3xl shadow-sm text-sm sm:text-base leading-relaxed ${
                msg.type === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex max-w-[75%] flex-row">
              <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm bg-white border border-slate-200 text-lime-600 mr-3 sm:mr-4">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="p-4 rounded-3xl bg-white border border-slate-100 rounded-tl-none flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-white/50 border-t border-slate-100 shrink-0">
        
        {/* Suggestion Chips */}
        {messages.length < 3 && !isTyping && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(suggestion)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:border-lime-500 hover:text-lime-600 transition-colors shadow-sm"
              >
                <Sparkles className="w-3 h-3" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe your symptoms or ask a health question..."
            className="w-full bg-white border border-slate-200 rounded-full py-3.5 sm:py-4 pl-6 pr-14 text-sm sm:text-base text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 p-2.5 sm:p-3 bg-lime-500 text-white rounded-full hover:bg-lime-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 -ml-0.5" />
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
          B-MAX AI can make mistakes. Always verify with a healthcare professional.
        </p>
      </div>
    </div>
  );
}
