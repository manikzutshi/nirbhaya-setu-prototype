'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, ChatsCircle, Siren, GraduationCap, NotePencil } from './PhosphorIcons';
import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function MobileDock() {
  const pathname = usePathname();
  const router = useRouter();
  const tab = (href) => (pathname === href);
  const hide = pathname === '/' || pathname?.startsWith('/auth');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const triggerSOS = useCallback(async () => {
    try { fetch('/api/sos/activate', { method: 'POST' }).catch(()=>{}); } catch(_) {}
  try { if (navigator?.vibrate) navigator.vibrate([120,60,180]); } catch {}
  router.push('/sos');
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    try {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRec();
      recognitionRef.current = rec;
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.continuous = true;
      rec.onresult = (evt) => {
        let transcript = '';
        for (let i = evt.resultIndex; i < evt.results.length; i++) {
          transcript += evt.results[i][0].transcript;
        }
        fetch('/api/sos/transcript', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript }) }).catch(()=>{});
      };
      rec.onend = () => setListening(false);
      rec.start();
      setListening(true);
    } catch(e) { setListening(false); }
  }, []);

  if (hide) return null;
  return (
    <div className="bg-base-100 border-t border-base-300 shadow-lg z-40 md:hidden fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-end justify-around px-2 py-2 relative">
        <Link href="/dashboard" className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg hover:bg-base-200 ${tab('/dashboard') ? 'bg-base-200' : ''}`}>
          <House size={20} className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link href="/community" className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg hover:bg-base-200 ${tab('/community') ? 'bg-base-200' : ''}`}>
          <ChatsCircle size={20} className="w-5 h-5" />
          <span className="text-[10px]">Community</span>
        </Link>
        <button onClick={triggerSOS} className="flex flex-col items-center relative -mt-6" aria-label="SOS">
          <div className={`w-16 h-16 rounded-full bg-error shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95`}>
            <Siren size={28} className="w-7 h-7 text-error-content" />
          </div>
          <span className="text-[10px] mt-1 text-error font-semibold">{listening ? 'Listening…' : 'SOS'}</span>
        </button>
        <Link href="/campus" className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg hover:bg-base-200 ${tab('/campus') ? 'bg-base-200' : ''}`}>
          <GraduationCap size={20} className="w-5 h-5" />
          <span className="text-[10px]">Campus</span>
        </Link>
        <Link href="/report" className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg hover:bg-base-200 ${tab('/report') ? 'bg-base-200' : ''}`}>
          <NotePencil size={20} className="w-5 h-5" />
          <span className="text-[10px]">Report</span>
        </Link>
      </div>
    </div>
  );
}
