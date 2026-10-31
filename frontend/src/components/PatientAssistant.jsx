import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  HelpCircle, 
  Clock, 
  Calendar, 
  Stethoscope, 
  User, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const PatientAssistant = ({ onBookClick }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your MediFlow Patient Assistant. I can help answer questions about our clinic hours, doctors, consultation preparation, or help you book an appointment. How can I assist you today?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (customMessage) => {
    const textToSend = customMessage || inputText;
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { sender: 'patient', text: textToSend }]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/patient-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      }
    } catch (e) {
      console.error('Patient assistant error', e);
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'ai', 
          text: 'Our clinic is open Monday to Saturday from 8:30 AM to 8:00 PM. Would you like to schedule a visit with Dr. Sharma or Dr. Mitchell?' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'What are your clinic opening hours?',
    'Which doctors and specialists are available?',
    'What should I bring for my first consultation?',
    'How do I book an appointment?',
    'I have chest pain and shortness of breath (Emergency test)'
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-100 text-xs font-bold uppercase tracking-wider mb-2">
            <Bot className="w-4 h-4 text-cyan-300" />
            <span>Module 3 • Patient Portal Care Assistant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Patient Assistant
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
            Ask clinic administrative questions, discover physician specialties, prepare consultation checklists, and navigate hospital care.
          </p>
        </div>

        <button
          onClick={onBookClick}
          className="px-4 py-2.5 rounded-xl bg-white text-blue-700 font-extrabold text-xs shadow-md hover:bg-blue-50 transition-all flex items-center space-x-1.5"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Safety Notice Banner (PRD Module 3) */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-2.5 shadow-sm">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold">Safety & Medical Guardrails:</span>
          <p className="text-slate-600 mt-0.5 leading-relaxed">
            This AI assistant provides administrative information and general clinic guidance. It does not provide medical diagnoses or prescribe medications. In case of acute chest pain, severe injury, or breathing distress, proceed to an Emergency Room immediately or dial 108.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col h-[520px] overflow-hidden">
        
        {/* Messages Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((m, idx) => {
            const isAi = m.sender === 'ai';
            const isEmergency = m.text.includes('⚠️ URGENT');

            return (
              <div key={idx} className={`flex items-start space-x-3 ${isAi ? 'justify-start' : 'justify-end'}`}>
                {isAi && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                    isEmergency
                      ? 'bg-rose-50 border-2 border-rose-400 text-rose-900 font-bold shadow-md'
                      : isAi
                      ? 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                      : 'bg-blue-600 text-white shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
                {!isAi && (
                  <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    🧑
                  </div>
                )}
              </div>
            );
          })}
          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Patient Assistant is thinking...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-6 py-2 border-t border-slate-100 bg-white flex flex-wrap gap-1.5">
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 transition-all text-slate-600"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-slate-200 bg-white flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Type your healthcare question or clinic inquiry..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>

      </div>

    </div>
  );
};

