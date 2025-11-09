'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GlobalVoiceSOS() {
  const router = useRouter();
  const recRef = useRef(null);
  const [armed, setArmed] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [panicWord, setPanicWord] = useState('help');

  useEffect(() => {
    // Load settings
    try {
      const en = localStorage.getItem('voiceTriggerEnabled');
      const pw = localStorage.getItem('panicWord');
      setArmed(en === 'true');
      if (pw) setPanicWord(pw);
    } catch {}
  }, []);

  useEffect(() => {
    if (!armed) { try { recRef.current?.stop?.(); } catch {} return; }
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(' ').toLowerCase();
      if (!text) return;
      const key = (panicWord || 'help').toLowerCase().trim();
      if (key && text.includes(key)) {
        triggerSOSFeedback();
      }
    };
    rec.onend = () => {
      // Keep it alive while armed
      if (armed) { try { rec.start(); } catch {} }
    };
    recRef.current = rec;
    // Browsers often require a user interaction; try starting soon after first tap
    const startNow = () => { try { rec.start(); } catch {} };
    document.addEventListener('click', startNow, { once: true });
    // Also attempt immediate start
    startNow();
    return () => {
      try { rec.stop(); } catch {}
      document.removeEventListener('click', startNow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, panicWord]);

  function vibrate(pattern) { try { if (navigator?.vibrate) navigator.vibrate(pattern); } catch {} }

  function triggerSOSFeedback() {
    // Backend
    try { fetch('/api/sos/activate', { method: 'POST' }).catch(()=>{}); } catch {}
    // Haptics + overlay + navigate
    vibrate([160,60,220,60,280]);
    setOverlay(true);
    setTimeout(() => setOverlay(false), 2500);
    router.push('/sos');
  }

  // Listen to storage changes (if user changes panic word in /sos)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'voiceTriggerEnabled') setArmed(e.newValue === 'true');
      if (e.key === 'panicWord' && e.newValue) setPanicWord(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!armed) return null;
  return (
    overlay ? (
  <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-60">
        <div className="px-4 py-2 rounded-full bg-error text-error-content text-xs font-bold shadow-lg animate-bounce">
          SOS ACTIVATED
        </div>
      </div>
    ) : null
  );
}
