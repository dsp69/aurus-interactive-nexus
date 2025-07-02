import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { WaveformVisualizer } from './WaveformVisualizer';
import { ChatHistory } from './ChatHistory';
import { JarvisAvatar } from './JarvisAvatar';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'jarvis';
  timestamp: Date;
}

export const JarvisInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Good evening. I am Jarvis, your personal AI assistant. How may I assist you today?',
      sender: 'jarvis',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognition = useRef<SpeechRecognition | null>(null);
  const synthesis = useRef<SpeechSynthesis | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Failed to process voice input. Please try again.",
          variant: "destructive",
        });
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    synthesis.current = window.speechSynthesis;

    return () => {
      if (recognition.current) {
        recognition.current.abort();
      }
      if (synthesis.current) {
        synthesis.current.cancel();
      }
    };
  }, [toast]);

  const startListening = () => {
    if (recognition.current && !isListening) {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const stopListening = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text: string) => {
    if (synthesis.current) {
      synthesis.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthesis.current.speak(utterance);
    }
  };

  const processMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple response logic (can be enhanced with actual AI integration)
    let response = generateResponse(text.trim());

    const jarvisMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response,
      sender: 'jarvis',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, jarvisMessage]);
    setIsProcessing(false);
    
    // Speak the response
    speak(response);
  };

  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return "Hello! I'm here to assist you. What would you like me to help you with?";
    }
    
    if (lowerInput.includes('time')) {
      return `The current time is ${new Date().toLocaleTimeString()}.`;
    }
    
    if (lowerInput.includes('date')) {
      return `Today is ${new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}.`;
    }
    
    if (lowerInput.includes('weather')) {
      return "I would need access to weather APIs to provide real-time weather information. This feature can be implemented with proper API integration.";
    }
    
    if (lowerInput.includes('music') || lowerInput.includes('spotify')) {
      return "To control Spotify, I would need API integration with your Spotify account. This feature requires proper authentication setup.";
    }
    
    if (lowerInput.includes('reminder') || lowerInput.includes('alarm')) {
      return "I can help you set reminders! However, this feature would work best with proper cloud storage or local storage implementation.";
    }
    
    if (lowerInput.includes('whatsapp') || lowerInput.includes('message')) {
      return "WhatsApp integration would require Twilio API or WhatsApp Business API setup for sending messages programmatically.";
    }
    
    return "I'm still learning! I can help with basic commands and conversation. For advanced features like Spotify, WhatsApp, and live data, API integrations would be needed.";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processMessage(inputText);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      {/* Header */}
      <div className="jarvis-panel p-6 mb-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-glow bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              J.A.R.V.I.S
            </h1>
            <p className="text-muted-foreground mt-1">Just A Rather Very Intelligent System</p>
          </div>
          <JarvisAvatar isActive={isSpeaking || isListening || isProcessing} />
        </div>
      </div>

      {/* Main Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat History */}
        <div className="lg:col-span-2">
          <ChatHistory messages={messages} isProcessing={isProcessing} />
        </div>

        {/* Control Panel */}
        <div className="space-y-4">
          {/* Voice Visualizer */}
          <div className="jarvis-panel p-6 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4 text-primary">Voice Activity</h3>
            <WaveformVisualizer isActive={isListening || isSpeaking} />
            
            <div className="flex items-center justify-center mt-4 space-x-4">
              <Button
                onClick={isListening ? stopListening : startListening}
                variant={isListening ? "destructive" : "default"}
                size="lg"
                className={isListening ? "animate-pulse-glow" : "jarvis-button"}
                disabled={isSpeaking}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              
              {isSpeaking && (
                <div className="flex items-center text-primary animate-pulse-glow">
                  <Volume2 className="h-5 w-5 mr-2" />
                  <span className="text-sm">Speaking...</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Panel */}
          <div className="jarvis-panel p-6">
            <h3 className="text-lg font-semibold mb-4 text-primary">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Voice Recognition</span>
                <div className={`w-2 h-2 rounded-full ${
                  'SpeechRecognition' in window || 'webkitSpeechRecognition' in window 
                    ? 'bg-primary animate-pulse-glow' 
                    : 'bg-destructive'
                }`} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Text-to-Speech</span>
                <div className={`w-2 h-2 rounded-full ${
                  'speechSynthesis' in window 
                    ? 'bg-primary animate-pulse-glow' 
                    : 'bg-destructive'
                }`} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">AI Core</span>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Panel */}
      <div className="jarvis-panel p-4 mt-4 animate-slide-up">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Jarvis anything..."
            className="jarvis-input flex-1"
            disabled={isProcessing}
          />
          <Button 
            type="submit" 
            className="jarvis-button"
            disabled={!inputText.trim() || isProcessing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="flex justify-center mt-2">
          <p className="text-xs text-muted-foreground">
            {isListening ? "Listening..." : "Click the microphone or type your message"}
          </p>
        </div>
      </div>
    </div>
  );
};