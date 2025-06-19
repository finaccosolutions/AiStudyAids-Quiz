class SpeechService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  
  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
    }
  }
  
  private loadVoices() {
    this.voices = this.synth.getVoices();
  }
  
  speak(text: string, language: string = 'en-US') {
    // Cancel any ongoing speech
    this.stop();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find a voice that matches the language
    const matchedVoice = this.voices.find(voice => 
      voice.lang.toLowerCase().startsWith(language.toLowerCase()) && !voice.localService
    );
    
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    
    utterance.lang = language;
    utterance.rate = 1;
    utterance.pitch = 1;
    
    // Store current utterance
    this.currentUtterance = utterance;
    
    // Speak the text
    this.synth.speak(utterance);
  }
  
  stop() {
    if (this.currentUtterance) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }
  
  isPaused() {
    return this.synth.paused;
  }
  
  pause() {
    this.synth.pause();
  }
  
  resume() {
    this.synth.resume();
  }
  
  isSpeaking() {
    return this.synth.speaking;
  }
}

export const speechService = new SpeechService();