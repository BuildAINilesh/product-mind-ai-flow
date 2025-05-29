import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useVoiceToText } from '@/hooks/use-voice-to-text';
import { useAuth } from '@/hooks/use-auth';
import { openai } from '@/lib/openai';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  X, 
  Minimize2, 
  Maximize2, 
  Send, 
  Mic, 
  MicOff
} from 'lucide-react';
import '@/styles/animations.css';

// Quick reply button options
const QUICK_REPLIES = [
  { id: 'score', text: 'What does this score mean?' },
  { id: 'validator', text: 'Open Idea Validator' },
  { id: 'bug', text: 'Report a bug' },
];

interface Message {
  id: string;
  sender: 'user' | 'productmind';
  message: string;
  timestamp: Date;
}

interface SupportChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportChatWindow({ isOpen, onClose }: SupportChatWindowProps) {
  const { user } = useAuth();
  const [sessionId] = useState<string>(uuidv4());
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      sender: 'productmind',
      message: 'Hello! I\'m here to help you with any questions about Product Mind. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  
  const {
    isListening,
    error: speechError,
    startListening,
    stopListening,
    updateText
  } = useVoiceToText({
    onTextChange: (text) => setInputValue(text),
    initialText: inputValue
  });

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Save a message to Supabase
  const saveMessageToSupabase = async (message: {
    id: string;
    session_id: string;
    user_id: string;
    sender: string;
    message: string;
    type: string;
    timestamp: string;
  }) => {
    try {
      // Use the Supabase REST API directly to avoid TypeScript errors with the table names
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL}/rest/v1/session_messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error(`Failed to save message: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      // Fallback to localStorage if Supabase fails
      const storedMessages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
      storedMessages.push(message);
      localStorage.setItem('chat_messages', JSON.stringify(storedMessages));
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return;
    
    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      sender: 'user',
      message: inputValue.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);
    
    try {
      // Save user message to Supabase
      await saveMessageToSupabase({
        id: userMessage.id,
        session_id: sessionId,
        user_id: user.id,
        sender: userMessage.sender,
        message: userMessage.message,
        type: 'support',
        timestamp: userMessage.timestamp.toISOString(),
      });

      // Get AI response
      const response = await getAIResponse(userMessage.message, messages);
      
      setIsTyping(false);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        sender: 'productmind',
        message: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save AI response to Supabase
      await saveMessageToSupabase({
        id: assistantMessage.id,
        session_id: sessionId,
        user_id: user.id,
        sender: assistantMessage.sender,
        message: assistantMessage.message,
        type: 'support',
        timestamp: assistantMessage.timestamp.toISOString(),
      });
    } catch (error) {
      console.error('Error in chat:', error);
      setIsTyping(false);
      toast.error('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick reply button click
  const handleQuickReply = (text: string) => {
    setInputValue(text);
  };

  // Handle sending feedback
  const sendFeedback = async (message: string, type: 'feature_request' | 'bug_report' | 'general') => {
    if (!user) return;
    
    try {
      // Save feedback to Supabase
      const feedback = {
        id: uuidv4(),
        user_id: user.id,
        session_id: sessionId,
        message,
        type,
        status: 'new',
        timestamp: new Date().toISOString(),
      };
      
      // Use the Supabase REST API directly to avoid TypeScript errors with the table names
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL}/rest/v1/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(feedback)
      });

      if (!response.ok) {
        throw new Error(`Failed to save feedback: ${response.status}`);
      }
      
      toast.success('Your feedback has been submitted. Thank you!');
    } catch (error) {
      console.error('Error sending feedback:', error);
      // Fallback to localStorage
      try {
        const storedFeedback = JSON.parse(localStorage.getItem('feedback') || '[]');
        storedFeedback.push({
          id: uuidv4(),
          user_id: user.id,
          session_id: sessionId,
          message,
          type,
          status: 'new',
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('feedback', JSON.stringify(storedFeedback));
        toast.success('Your feedback has been submitted locally. Thank you!');
      } catch (storageError) {
        console.error('Error storing feedback locally:', storageError);
        toast.error('Failed to submit feedback. Please try again.');
      }
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle full screen mode
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Get response from OpenAI
  const getAIResponse = async (userMessage: string, messageHistory: Message[]) => {
    try {
      // OpenAI message types
      type ChatRole = 'system' | 'user' | 'assistant';
      
      interface ChatMessage {
        role: ChatRole;
        content: string;
      }
      
      // Convert message history to the format OpenAI expects
      const messages: ChatMessage[] = messageHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.message
      }));
      
      // Add latest user message
      messages.push({
        role: 'user',
        content: userMessage
      });
      
      // Add system message for context
      messages.unshift({
        role: 'system',
        content: `You're an expert React + Tailwind developer helping users with Product Mind, a SaaS app that helps product teams validate ideas using OpenAI, Supabase, and intelligent summaries.

Current features of Product Mind include:
- Creating business requirements
- AI analysis of requirements
- AI validation of requirements for quality/completeness
- Market research and analysis
- Test case generation
- Use case and user story generation

You should be helpful, concise, and friendly in your responses. If you don't know something, admit it.

For bug reports, ask for details about what went wrong and which part of the application had the issue.
For feature requests, collect detailed information about what the user wants.`
      });
      
      // Get response from OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4', // Upgraded from gpt-3.5-turbo to gpt-4
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });
      
      return completion.choices[0].message.content || 'Sorry, I couldn\'t generate a response.';
    } catch (error) {
      console.error('Error getting AI response:', error);
      return 'I\'m having trouble connecting right now. Please try again later.';
    }
  };

  if (!isOpen) return null;

  // Dynamically determine container classes based on state
  const containerClasses = `fixed z-50 transition-all duration-300 ease-in-out ${
    isFullScreen 
      ? 'top-0 left-0 right-0 bottom-0 w-full h-full'
      : isMinimized 
        ? 'bottom-4 right-4 w-72 h-16' 
        : 'bottom-4 right-4 w-80 md:w-96 h-[500px]'
  }`;

  return (
    <div className={containerClasses}>
      {/* Main chat window with glass effect */}
      <div className="rounded-lg shadow-lg overflow-hidden flex flex-col h-full backdrop-blur-md bg-white/30 border border-green-100">
        {/* Header */}
        <div className="p-3 bg-gradient-to-r from-white to-green-50 border-b border-green-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Help with Product Mind</h3>
          <div className="flex items-center space-x-2">
            {!isMinimized && (
              <button 
                onClick={toggleFullScreen} 
                className="text-gray-500 hover:text-gray-700"
                aria-label={isFullScreen ? "Exit full screen" : "Full screen"}
              >
                {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            )}
            {isMinimized ? (
              <button 
                onClick={() => setIsMinimized(false)} 
                className="text-gray-500 hover:text-gray-700"
                aria-label="Maximize"
              >
                <Maximize2 size={16} />
              </button>
            ) : (
              <button 
                onClick={() => setIsMinimized(true)} 
                className="text-gray-500 hover:text-gray-700"
                aria-label="Minimize"
              >
                <Minimize2 size={16} />
              </button>
            )}
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        
        {!isMinimized && (
          <>
            {/* Messages area */}
            <div className="flex-1 p-4 overflow-y-auto bg-white/50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-3 ${
                    message.sender === 'user'
                      ? 'ml-auto text-right'
                      : 'mr-auto'
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                      message.sender === 'user'
                        ? 'bg-green-600 text-white rounded-br-none animate-slide-right'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none animate-fade-in'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {message.message}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start mb-3 animate-fade-in">
                  <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                    <div className="flex items-center">
                      <span className="text-gray-600 text-sm mr-2">Product Mind is typing</span>
                      <span className="flex items-center">
                        <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce mr-1" style={{ animationDelay: '0ms' }}></span>
                        <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce mr-1" style={{ animationDelay: '250ms' }}></span>
                        <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '500ms' }}></span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Quick replies */}
            {messages.length > 0 && messages[messages.length - 1].sender === 'productmind' && !isLoading && !isTyping && (
              <div className="px-3 py-2 bg-gray-50/70">
                <div className="flex flex-wrap gap-2">
                  {QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply.id}
                      onClick={() => handleQuickReply(reply.text)}
                      className="bg-white text-gray-600 px-3 py-1 rounded-full text-xs border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      {reply.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Input area */}
            <div className="p-3 bg-white border-t border-green-100">
              {speechError && (
                <div className="text-xs text-red-500 mb-2">{speechError}</div>
              )}
              <div className="flex items-center space-x-2">
                <textarea
                  className="flex-1 border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none text-sm"
                  placeholder="Type your message..."
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 rounded-full ${
                    isListening
                      ? 'bg-red-100 text-red-500'
                      : 'bg-gray-100 text-gray-500'
                  } hover:bg-opacity-80 transition-colors`}
                  aria-label={isListening ? 'Stop listening' : 'Start listening'}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}