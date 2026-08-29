
import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon, XMarkIcon } from './Icons';
import type { ChatMessage, FoodItem } from '../types';
import { getBotResponse } from '../services/geminiService';

interface ChatbotProps {
    menu: FoodItem[];
}

const Chatbot: React.FC<ChatbotProps> = ({ menu }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'bot', text: "Hello! I'm the AI assistant for Randi mava restaurent. How can I help you today?" }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        const botResponse = await getBotResponse(newMessages, menu);
        
        setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
        setIsLoading(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 left-8 bg-amber-700 hover:bg-amber-800 text-white font-bold p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-50 focus:ring-amber-600 z-50"
            >
                {isOpen ? <XMarkIcon className="h-8 w-8" /> : <SparklesIcon className="h-8 w-8" />}
            </button>
            {isOpen && (
                <div className="fixed bottom-24 left-8 w-full max-w-sm h-full max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-stone-200">
                    <header className="p-4 bg-stone-50 rounded-t-2xl border-b border-stone-200">
                        <h3 className="text-xl font-bold text-stone-900 text-center">AI Assistant</h3>
                    </header>
                    <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-stone-50/50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-amber-700 text-white rounded-br-lg' : 'bg-stone-100 text-stone-800 rounded-bl-lg'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                             <div className="flex justify-start">
                                <div className="max-w-[80%] p-3 rounded-2xl bg-stone-100 text-stone-800 rounded-bl-lg">
                                    <div className="flex items-center space-x-2">
                                        <div className="h-2 w-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="h-2 w-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="h-2 w-2 bg-amber-500 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                         )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-stone-200 bg-stone-50 rounded-b-2xl">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Ask about our menu..."
                                className="w-full bg-stone-100 rounded-full py-2 px-4 text-stone-800 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                disabled={isLoading}
                            />
                            <button type="submit" className="bg-amber-700 p-3 rounded-full text-white hover:bg-amber-800 disabled:bg-stone-300" disabled={isLoading}>
                                <PaperAirplaneIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default Chatbot;