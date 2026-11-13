import { useState, useEffect } from 'react';

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

/** Finds the best installed voice for the active language (kn-IN / en-IN). */
export function useSpeechVoice(lang = 'kn') {
  const [voice, setVoice] = useState(null);
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;
    const synth = window.speechSynthesis;
    const prefix = lang === 'en' ? 'en' : 'kn';
    const pick = () => {
      const voices = synth.getVoices?.() || [];
      setVoice(voices.find((v) => String(v.lang).toLowerCase().startsWith(prefix)) || null);
    };
    setVoice(null);
    pick();
    synth.addEventListener?.('voiceschanged', pick);
    const timer = setTimeout(pick, 1200);
    return () => {
      synth.removeEventListener?.('voiceschanged', pick);
      clearTimeout(timer);
    };
  }, [lang]);
  return voice;
}

export function speakText(voice, text, lang = 'kn') {
  if (!voice || !('speechSynthesis' in window) || !text) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = lang === 'en' ? 'en-IN' : 'kn-IN';
  utterance.rate = lang === 'en' ? 0.95 : 0.86;
  utterance.pitch = 1;
  synth.speak(utterance);
}
