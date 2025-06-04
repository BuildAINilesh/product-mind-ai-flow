import { useState, useRef, useCallback } from 'react';
import { SpeechRecognitionService } from '@/utils/speechRecognition';

interface UseVoiceToTextProps {
  onTextChange?: (text: string) => void;
  initialText?: string;
}

export function useVoiceToText({ onTextChange, initialText = '' }: UseVoiceToTextProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState(initialText);
  const [error, setError] = useState<string | null>(null);
  const speechService = useRef<SpeechRecognitionService | null>(null);
  
  const startListening = useCallback(() => {
    setError(null);
    
    // Initialize speech service if not already done
    if (!speechService.current) {
      speechService.current = new SpeechRecognitionService({
        onStart: () => {
          setIsListening(true);
        },
        onEnd: () => {
          setIsListening(false);
        },
        onResult: (transcript) => {
          // Accumulate text, don't replace
          const newText = text + ' ' + transcript;
          setText(newText.trim());
          
          if (onTextChange) {
            onTextChange(newText.trim());
          }
        },
        onError: (errorMsg) => {
          setError(errorMsg);
          setIsListening(false);
        }
      });
    }
    
    // Check browser support
    if (!speechService.current.isSupported()) {
      setError('Speech recognition is not supported in this browser');
      return;
    }
    
    // Start listening
    speechService.current.start();
  }, [text, onTextChange]);
  
  const stopListening = useCallback(() => {
    if (speechService.current) {
      speechService.current.stop();
    }
    setIsListening(false);
  }, []);
  
  const resetText = useCallback(() => {
    setText(initialText);
    if (onTextChange) {
      onTextChange(initialText);
    }
  }, [initialText, onTextChange]);
  
  const updateText = useCallback((newText: string) => {
    setText(newText);
    if (onTextChange) {
      onTextChange(newText);
    }
  }, [onTextChange]);
  
  return {
    isListening,
    text,
    error,
    startListening,
    stopListening,
    resetText,
    updateText
  };
} 