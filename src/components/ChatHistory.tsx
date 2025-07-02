import { useEffect, useRef } from 'react';
import { User, Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'jarvis';
  timestamp: Date;
}

interface ChatHistoryProps {
  messages: Message[];
  isProcessing: boolean;
}

export const ChatHistory = ({ messages, isProcessing }: ChatHistoryProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="jarvis-panel h-96 lg:h-[500px] flex flex-col animate-fade-in">
      <div className="p-4 border-b border-border/50">
        <h2 className="text-xl font-semibold text-primary">Communication Log</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 animate-slide-up ${
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.sender === 'jarvis' 
                ? 'bg-gradient-to-r from-primary to-secondary jarvis-glow' 
                : 'bg-muted'
            }`}>
              {message.sender === 'jarvis' ? (
                <Bot className="h-4 w-4 text-primary-foreground" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            
            <div className={`flex-1 max-w-xs lg:max-w-md ${
              message.sender === 'user' ? 'text-right' : ''
            }`}>
              <div className={`rounded-lg p-3 ${
                message.sender === 'jarvis'
                  ? 'bg-gradient-to-r from-muted/50 to-card border border-primary/20'
                  : 'bg-primary/10 border border-primary/30'
              }`}>
                <p className="text-sm">{message.text}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex items-start space-x-3 animate-slide-up">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-primary to-secondary jarvis-glow">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1 max-w-xs lg:max-w-md">
              <div className="rounded-lg p-3 bg-gradient-to-r from-muted/50 to-card border border-primary/20">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};