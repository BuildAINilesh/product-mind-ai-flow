import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import SupportChatWindow from './support/SupportChatWindow';

/**
 * Chat Support component that provides a floating chat button and support window.
 * This component allows users to get help with the Product Mind application.
 */
export default function ChatSupport() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };
  
  const closeChat = () => {
    setIsChatOpen(false);
  };
  
  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 z-40 p-3 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg transition-all duration-300 ease-in-out"
        aria-label="Chat Support"
      >
        <MessageCircle size={24} />
      </button>
      
      {/* Chat window */}
      <SupportChatWindow isOpen={isChatOpen} onClose={closeChat} />
    </>
  );
}