// Speech Recognition Service
// This service provides a unified interface for speech recognition
// with options for standard Web Speech API or enhanced processing via OpenAI

interface SpeechRecognitionOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onResult?: (text: string) => void;
  onInterim?: (text: string) => void;
  onError?: (error: string) => void;
  useOpenAI?: boolean;
  enhancedProcessing?: boolean;
  initialText?: string; // Added new option for initial text
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

// Define SpeechRecognitionResult interface
interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
    confidence: number;
  };
  length: number;
}

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isRecognizing: boolean = false;
  private options: SpeechRecognitionOptions;
  private accumulatedText: string = ''; // Store accumulated text
  
  constructor(options: SpeechRecognitionOptions = {}) {
    this.options = options;
    // Initialize accumulated text with any initial text provided
    this.accumulatedText = options.initialText || '';
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
      console.log("Speech recognition service onstart triggered");
      if (this.options.onStart) {
        this.options.onStart();
      }
    };
    
    this.recognition.onend = () => {
      console.log("Speech recognition service onend triggered");
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
      try {
        // Get the latest result
        const results = event.results;
        const lastResult = results[results.length - 1];
        const transcript = lastResult[0].transcript;
        
        console.log(`Raw speech input: "${transcript}"`);
        
        // Process with enhanced processing if enabled
        if (this.options.enhancedProcessing && this.options.useOpenAI) {
          console.log("Using enhanced processing for speech");
          this.processWithOpenAI(transcript);
        } else {
          console.log("Using standard processing for speech");
          // Basic processing for standard mode to match enhanced mode
          const processed = transcript
            // Capitalize first letter of sentences
            .replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
          
          // We only want to use the latest complete utterance as our text
          // This prevents duplication issues when pausing and resuming
          this.accumulatedText = processed;
          
          // Send the processed text to the callback
          if (this.options.onResult) {
            this.options.onResult(this.accumulatedText);
          }
        }
      } catch (error) {
        console.error("Error processing speech recognition results:", error);
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
        // Always reinitialize recognition before starting
        this.initRecognition();
        this.recognition.start();
        this.isRecognizing = true;
        console.log("Speech recognition started successfully");
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
    if (this.recognition) {
      try {
        // Force recognition to stop
        this.recognition.stop();
        // Set isRecognizing to false to ensure state is updated
        this.isRecognizing = false;
        
        // Remove all listeners to prevent any further processing
        this.recognition.onresult = null;
        this.recognition.onend = null;
        this.recognition.onstart = null;
        this.recognition.onerror = null;
        
        // Nullify the recognition object to force recreation on next start
        this.recognition = null;
        
        // Manually call onEnd to ensure UI is updated
        if (this.options.onEnd) {
          this.options.onEnd();
        }
        
        // Return the current accumulated text (useful for the calling code)
        return this.accumulatedText;
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    return this.accumulatedText;
  }
  
  // Force abort any ongoing recognition
  public forceAbort() {
    if (this.recognition) {
      try {
        // Force stop and clean up
        this.recognition.stop();
        this.recognition.onresult = null;
        this.recognition.onend = null;
        this.recognition.onstart = null;
        this.recognition.onerror = null;
        this.recognition = null;
        this.isRecognizing = false;
        
        if (this.options.onEnd) {
          this.options.onEnd();
        }
        
        // Return the current accumulated text
        return this.accumulatedText;
      } catch (error) {
        console.error('Error force aborting speech recognition:', error);
      }
    }
    return this.accumulatedText;
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
    
    // We only want to use the latest complete utterance as our text
    // This prevents duplication issues when pausing and resuming
    this.accumulatedText = processed;
    
    if (this.options.onResult) {
      this.options.onResult(this.accumulatedText);
    }
  }
  
  // Get the current accumulated text
  public getCurrentText(): string {
    return this.accumulatedText;
  }
  
  // Set the accumulated text (useful for resuming from existing text)
  public setCurrentText(text: string): void {
    this.accumulatedText = text || '';
  }
}

// Add type definitions for Window object
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
} 