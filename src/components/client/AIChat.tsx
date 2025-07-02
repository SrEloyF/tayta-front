'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AIMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'error';
  timestamp: string;
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Enviar solicitud al endpoint de API con el formato de DeepSeek
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          model: 'deepseek/deepseek-r1:free',
          messages: [
            { role: 'user', content: inputMessage }
          ]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error desconocido al conectar con la IA');
      }

      const aiMessage: AIMessage = {
        id: Date.now().toString(),
        content: data.answer || 'Lo siento, no pude generar una respuesta.',
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error de conexión:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error desconocido al conectar con la IA';

      const aiMessage: AIMessage = {
        id: Date.now().toString(),
        content: `Error: ${errorMessage}. Por favor, verifica tu conexión.`,
        sender: 'error',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col">
          {/* Encabezado del Chat */}
          <div className="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6" />
              <h3 className="font-bold">Tayta AI Assistant</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-blue-700"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${
                  msg.sender === 'user' ? 'justify-end' 
                  : msg.sender === 'error' ? 'justify-center'
                  : 'justify-start'
                }`}
              >
                <div 
                  className={`
                    max-w-[80%] p-3 rounded-2xl 
                    ${msg.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : msg.sender === 'error'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-gray-100 text-gray-800'}
                  `}
                >
                  {msg.sender === 'error' && (
                    <div className="flex items-center mb-2">
                      <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                      <span className="font-semibold">Error de Conexión</span>
                    </div>
                  )}
                  <p>{msg.content}</p>
                  <span className="text-xs opacity-70 block text-right mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de Mensaje */}
          <div className="p-4 border-t flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Escribe tu mensaje..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
              className="flex-1 p-2 border rounded-full focus:ring-2 focus:ring-blue-300 transition"
            />
            <Button 
              variant="blue" 
              size="sm" 
              onClick={handleSendMessage} 
              disabled={isLoading || !inputMessage.trim()}
              className="p-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          variant="blue" 
          size="lg" 
          className="rounded-full p-4 shadow-2xl hover:scale-105 transition"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
        >
          <Bot className="w-8 h-8" />
        </Button>
      )}
    </div>
  );
} 