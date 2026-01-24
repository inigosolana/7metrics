import React, { useState, useRef, useEffect } from 'react';
import { generateResponse } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

const GeminiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; text: string; isStream?: boolean }[]>([
    { role: 'model', text: 'Hello! I am your 7metrics AI Assistant. Ask me about player stats, tactical drills, or system status.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Add placeholder for stream
      setMessages(prev => [...prev, { role: 'model', text: '', isStream: true }]);

      const stream = await generateResponse(userMsg.text, history);
      
      let fullText = '';
      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
           fullText += c.text;
           setMessages(prev => {
             const newMsgs = [...prev];
             const lastMsg = newMsgs[newMsgs.length - 1];
             if (lastMsg.isStream) {
               lastMsg.text = fullText;
             }
             return newMsgs;
           });
        }
      }
      // Finalize message
       setMessages(prev => {
         const newMsgs = [...prev];
         const lastMsg = newMsgs[newMsgs.length - 1];
         lastMsg.isStream = false;
         return newMsgs;
       });

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please check your API key.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-primary rounded-full shadow-2xl hover:scale-110 transition-transform duration-200 group"
      >
        <span className="material-symbols-outlined text-white text-3xl group-hover:rotate-12 transition-transform">smart_toy</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-[#1C1612] border border-slate-200 dark:border-stone-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 fade-in">
          <div className="p-4 bg-primary/10 border-b border-primary/20 flex justify-between items-center">
             <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-primary">auto_awesome</span>
                 <h3 className="font-bold text-slate-900 dark:text-white">Gemini Assistant</h3>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-primary">
               <span className="material-symbols-outlined">close</span>
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-slate-100 dark:bg-stone-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && !messages[messages.length-1].isStream && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-stone-800 p-3 rounded-2xl rounded-bl-none flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-stone-900/50 border-t border-slate-200 dark:border-stone-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className="flex-1 bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="p-2 bg-primary hover:bg-orange-600 text-white rounded-xl transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiAssistant;