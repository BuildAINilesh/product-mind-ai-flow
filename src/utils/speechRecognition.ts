// Speech Recognition Service
// This service provides a unified interface for speech recognition
// with options for standard Web Speech API or enhanced processing via OpenAI

interface SpeechRecognitionOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
  useOpenAI?: boolean;
  enhancedProcessing?: boolean;
}

// Define SpeechRecognition interface
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onerror: (event: any) => void;
  onend: () => void;
  onresult: (event: any) => void;
  onstart: () => void;
  start: () => void;
  stop: () => void;
}

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isRecognizing: boolean = false;
  private options: SpeechRecognitionOptions;
  
  constructor(options: SpeechRecognitionOptions = {}) {
    this.options = options;
    this.initRecognition();
  }
  
  // Check if speech recognition is supported in this browser
  public isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }
  
  // Initialize the speech recognition object
  private initRecognition() {
    if (!this.isSupported()) {
      console.warn('Speech recognition is not supported in this browser');
      return;
    }
    
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionClass();
    
    // Configure the recognition
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    // Set up event handlers
    this.recognition.onstart = () => {
      this.isRecognizing = true;
      if (this.options.onStart) {
        this.options.onStart();
      }
    };
    
    this.recognition.onend = () => {
      this.isRecognizing = false;
      if (this.options.onEnd) {
        this.options.onEnd();
      }
    };
    
    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (this.options.onError) {
        this.options.onError(event.error);
      }
    };
    
    // Process recognition results
    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(' ');
      
      console.log(`Speech recognized: ${transcript}`);
      
      // If enabled, use enhanced processing
      if (this.options.enhancedProcessing && this.options.useOpenAI) {
        this.processWithOpenAI(transcript);
      } else {
        if (this.options.onResult) {
          this.options.onResult(transcript);
        }
      }
    };
  }
  
  // Start speech recognition
  public start() {
    if (!this.recognition) {
      this.initRecognition();
    }
    
    if (this.recognition && !this.isRecognizing) {
      try {
        this.recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        if (this.options.onError) {
          this.options.onError('Failed to start speech recognition');
        }
      }
    }
  }
  
  // Stop speech recognition
  public stop() {
    if (this.recognition && this.isRecognizing) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }
  
  // Process with OpenAI for enhanced results (mock implementation for now)
  private processWithOpenAI(transcript: string) {
    // In a real implementation, this would send the audio to an edge function
    // For now, we'll just use the browser's recognition and add some processing
    
    console.log('Enhanced processing with OpenAI:', transcript);
    
    // Simple post-processing to improve accuracy
    const processed = transcript
      // Capitalize first letter of sentences
      .replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase())
      // Fix common speech recognition errors
      .replace(/i'm/gi, "I'm")
      .replace(/id/gi, "I'd")
      .replace(/ill/gi, "I'll")
      .replace(/wont/gi, "won't")
      .replace(/cant/gi, "can't")
      .replace(/theres/gi, "there's");
    
    if (this.options.onResult) {
      this.options.onResult(processed);
    }
  }
}

// Add type definitions for Window object
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
} 