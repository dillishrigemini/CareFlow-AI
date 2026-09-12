import en from './en.json';
import ta from './ta.json';
import te from './te.json';
import hi from './hi.json';
import { LanguageCode } from '../types';

export const translations: Record<LanguageCode, Record<string, string>> = {
  en,
  ta,
  te,
  hi,
};

export function t(key: string, lang: LanguageCode = 'en'): string {
  const dict = translations[lang] || translations.en;
  return dict[key] || translations.en[key] || key;
}

// Browser Web Speech API text-to-speech helper with voice selection
export function speakText(text: string, lang: LanguageCode = 'en', slowMode = false) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = slowMode ? 0.8 : 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (lang === 'ta') {
      utterance.lang = 'ta-IN';
      selectedVoice = voices.find(v => (v?.lang && v.lang.includes('ta')) || (v?.name && v.name.toLowerCase().includes('tamil')));
    } else if (lang === 'te') {
      utterance.lang = 'te-IN';
      selectedVoice = voices.find(v => (v?.lang && v.lang.includes('te')) || (v?.name && v.name.toLowerCase().includes('telugu')));
    } else if (lang === 'hi') {
      utterance.lang = 'hi-IN';
      selectedVoice = voices.find(v => (v?.lang && v.lang.includes('hi')) || (v?.name && v.name.toLowerCase().includes('hindi')));
    } else {
      utterance.lang = 'en-IN';
      selectedVoice = voices.find(v => v?.lang && (v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en')));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}
