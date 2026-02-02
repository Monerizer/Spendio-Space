export interface VoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export class VoiceService {
  private recognition: any;
  private isListening: boolean = false;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
    }
  }

  isSupported(): boolean {
    return this.recognition !== undefined;
  }

  start(
    onResult: (transcript: string) => void,
    onError: (error: string) => void,
    options: VoiceRecognitionOptions = {}
  ): boolean {
    if (!this.recognition) {
      onError("Speech Recognition is not supported in this browser");
      return false;
    }

    try {
      this.recognition.language = options.language || "en-US";
      this.recognition.continuous = options.continuous || false;
      this.recognition.interimResults = options.interimResults || true;
      this.recognition.maxAlternatives = options.maxAlternatives || 1;

      let interimTranscript = "";

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            onResult(transcript);
          } else {
            interimTranscript += transcript + " ";
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        onError(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
      return true;
    } catch (error) {
      onError("Error starting voice recognition");
      return false;
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  abort(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  speak(text: string, language: string = "en-US"): void {
    if (!("speechSynthesis" in window)) {
      console.error("Speech Synthesis is not supported in this browser");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.language = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const voiceService = new VoiceService();
