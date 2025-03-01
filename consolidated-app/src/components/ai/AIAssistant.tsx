'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, RefreshCw } from 'lucide-react';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
}

export function AIAssistant({ isOpen, onClose, initialQuestion }: AIAssistantProps) {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Set initial question if provided
  useEffect(() => {
    if (initialQuestion && messages.length === 0) {
      handleSend(initialQuestion);
    }
  }, [initialQuestion]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response with delay
    setTimeout(() => {
      let response = "Estoy aquí para ayudarte con el proceso de evaluación psicológica. ¿Tienes alguna pregunta específica sobre las pruebas, la interpretación de resultados o la redacción del informe?";
      
      if (text.toLowerCase().includes("prueba") || text.toLowerCase().includes("test")) {
        response = "Las pruebas psicológicas son herramientas estandarizadas que nos permiten evaluar diferentes aspectos del funcionamiento psicológico. Es importante seleccionar las pruebas adecuadas según las áreas que deseas evaluar y las características del paciente.";
      } else if (text.toLowerCase().includes("informe")) {
        response = "Para redactar un buen informe psicológico, asegúrate de incluir: datos de identificación, motivo de consulta, técnicas utilizadas, resultados de la evaluación, conclusiones y recomendaciones. Mantén un lenguaje claro y profesional.";
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md h-[600px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h3 className="font-medium">Asistente IA</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none text-gray-800 flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Escribiendo...</span>
              </div>
            </div>
          )}
          
          <div ref={bottomRef} />
        </div>
        
        {/* Input */}
        <div className="p-3 border-t">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 