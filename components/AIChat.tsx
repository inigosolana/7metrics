import React, { useState, useRef, useEffect } from 'react';
import { generateCoachResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

export const AIChat: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: 'Hello coach. I am ready to assist with tactical analysis or training planning.', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        try {
            // Format history for Gemini
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));
            
            const responseText = await generateCoachResponse(history, userMsg.text);
            
            const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() };
            setMessages(prev => [...prev, modelMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: "Sorry, I had trouble connecting to the strategy server.", timestamp: new Date() };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsThinking(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] glass-panel rounded-2xl flex flex-col shadow-2xl z-50 border border-primary/20 animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-primary/10 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">smart_toy</span>
                    <h3 className="font-bold text-sm">AI Tactical Assistant</h3>
                </div>
                <button onClick={onClose} className="text-white/60 hover:text-white">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed ${
                            msg.role === 'user' 
                                ? 'bg-primary text-white rounded-br-none' 
                                : 'bg-white/10 text-white rounded-bl-none'
                        }`}>
                           <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-neon-green underline">$1</a>') }} />
                        </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 p-3 rounded-lg rounded-bl-none flex gap-1">
                            <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-75"></div>
                            <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef}></div>
            </div>

            <div className="p-3 border-t border-white/10 flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about tactics or player stats..."
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                />
                <button onClick={handleSend} disabled={isThinking} className="bg-primary hover:bg-primary/80 p-2 rounded-lg text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
            </div>
        </div>
    );
};
