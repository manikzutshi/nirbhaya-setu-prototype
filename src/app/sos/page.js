"use client";

import { useEffect, useRef, useState } from "react";

export default function SosPage() {
  const [active, setActive] = useState(false);
  const [contactsAlerted, setContactsAlerted] = useState(false);
  const [authoritiesNotified, setAuthoritiesNotified] = useState(false);
  const [eta, setEta] = useState(7); // minutes remaining mock
  const [transcript, setTranscript] = useState([]);
  const [listening, setListening] = useState(false);
  const [panicWord, setPanicWord] = useState("help");
  const recognitionRef = useRef(null);
  const etaTimerRef = useRef(null);

  // Setup speech recognition for ambient transcript + panic word trigger
  useEffect(() => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(" ").trim();
      if (!text) return;
      setTranscript(t => [...t.slice(-19), `[User]: ${text}`]);
      if (panicWord && text.toLowerCase().includes(panicWord.toLowerCase())) {
        if (!active) startSos();
      }
    };
    rec.onend = () => {
      if (listening) {
        try { rec.start(); } catch { /* ignore */ }
      }
    };
    recognitionRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, [listening, panicWord, active]);

  function vibrate(pattern) {
    try { if (navigator?.vibrate) navigator.vibrate(pattern); } catch {}
  }

  async function startSos() {
    setActive(true);
    vibrate([150,70,250,70,300]);
    // Trigger backend (stub AWS SNS)
    fetch("/api/sos/activate", { method: "POST" }).catch(() => {});
    // Simulate checklist progression
    setTimeout(() => setContactsAlerted(true), 1200);
    setTimeout(() => setAuthoritiesNotified(true), 2500);
    // Start ETA countdown
    etaTimerRef.current = setInterval(() => {
      setEta(m => {
        if (m <= 1) { clearInterval(etaTimerRef.current); return 0; }
        return m - 1;
      });
    }, 60000);
    // Begin ambient listening if supported
    if (recognitionRef.current && !listening) {
      setListening(true);
      try { recognitionRef.current.start(); } catch {}
    }
  }

  function cancelSos() {
    setActive(false);
    vibrate(80);
    setListening(false);
    try { recognitionRef.current?.stop(); } catch {}
  }

  function toggleListening() {
    if (!recognitionRef.current) return;
    setListening(l => !l);
    if (!listening) { try { recognitionRef.current.start(); } catch {} } else { try { recognitionRef.current.stop(); } catch {} }
  }

  return (
    <div className="min-h-screen bg-base-100 pb-24">
      {/* Header / Status */}
      <div className="px-4 pt-4 max-w-md mx-auto w-full">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <SosIcon className={active ? "text-error" : "text-base-content"} /> {active ? "SOS ACTIVE" : "Emergency SOS"}
        </h1>
        <p className="text-xs text-base-content/60 mt-1">{active ? "Help is on the way." : "Trigger SOS to alert contacts and authorities."}</p>
      </div>

      {/* Map + overlay */}
      <div className="mt-4 mx-auto max-w-md w-full px-4">
        <div className="relative rounded-xl overflow-hidden shadow border border-base-300 bg-base-100" style={{ height: 240 }}>
          <SimpleZoneMap active={active} />
          {active && (
            <div className="absolute top-2 left-2 flex flex-col gap-2">
              <span className="badge badge-error">Distress</span>
            </div>
          )}
          {active && (
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs">
              <span className="font-medium">Response ETA</span>
              <span className="font-bold text-primary">{eta} min</span>
            </div>
          )}
        </div>
      </div>

      {/* Checklist */}
      <div className="mt-6 mx-auto max-w-md w-full px-4">
        <div className="bg-base-100 border border-base-300 rounded-xl p-5 flex flex-col gap-3 shadow-sm">
          <h2 className="text-sm font-bold">Status</h2>
          <ChecklistItem done={contactsAlerted} label="Contacts Alerted" detail="3/3" />
          <ChecklistItem done={authoritiesNotified} label="Authorities Notified" />
          <ChecklistItem done={eta === 0} label="Responder Arrival" detail={eta === 0 ? "Arrived" : "En route"} />
        </div>
      </div>

      {/* Voice Trigger Settings */}
      <div className="mt-6 mx-auto max-w-md w-full px-4">
        <div className="bg-base-100 border border-base-300 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Voice Trigger</h3>
              <p className="text-xs text-base-content/60">Hands-free activation using panic word</p>
            </div>
            {listening && <span className="badge badge-info">Listening</span>}
          </div>
          <div>
            <label htmlFor="panicWordInput" className="block mb-2 text-xs font-semibold">Panic Word</label>
            <input id="panicWordInput" className="input input-bordered w-full input-sm" value={panicWord} onChange={(e) => setPanicWord(e.target.value)} placeholder="e.g., help me" />
            <p className="text-[11px] text-base-content/50 mt-1">Say this word loudly to auto-trigger SOS.</p>
          </div>
          <label className="flex items-center justify-between cursor-pointer p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
            <span className="text-xs font-semibold">Enable Voice Trigger</span>
            <input type="checkbox" className="toggle toggle-primary" checked={listening} onChange={toggleListening} />
          </label>
        </div>
      </div>

      {/* Transcript */}
      <div className="mt-6 mx-auto max-w-md w-full px-4">
        <div className="bg-base-100 border border-base-300 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold">Live Transcript</h3>
            <span className="text-[10px] text-base-content/50">Gemini (mock)</span>
          </div>
          {transcript.length === 0 ? (
            <p className="text-xs text-base-content/50">No speech captured yet…</p>
          ) : (
            <ul className="space-y-1 max-h-40 overflow-y-auto text-xs leading-relaxed">
              {transcript.map((line, i) => <li key={i}>{line}</li>)}
            </ul>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 mx-auto max-w-md w-full px-4 flex flex-col gap-3">
        {!active ? (
          <button className="btn btn-error w-full btn-lg text-lg font-bold shadow-2xl" onClick={startSos}>
            <SosIcon className="h-6 w-6" /> EMERGENCY SOS
          </button>
        ) : (
          <button className="btn btn-error w-full btn-lg text-lg font-bold" disabled>
            <SosIcon className="h-6 w-6" /> SOS ACTIVATED
          </button>
        )}
        <div className="flex gap-2 w-full">
          <button className="btn btn-outline flex-1" onClick={() => vibrate(40)}>
            <PhoneIcon className="h-5 w-5" /> Call
          </button>
          <button className="btn btn-outline flex-1" onClick={() => vibrate(40)}>
            <ChatIcon className="h-5 w-5" /> Message
          </button>
          {active && (
            <button className="btn btn-ghost flex-1" onClick={cancelSos}>
              <CancelIcon className="h-5 w-5" /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({ done, label, detail }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        {done ? <CheckIcon className="text-success" /> : <SpinnerIcon className="text-base-content/40" />}
        <span className={done ? "font-semibold" : ""}>{label}{detail ? ` (${detail})` : ""}</span>
      </div>
      <span className="text-[10px] text-base-content/50">{done ? "Done" : "Pending"}</span>
    </div>
  );
}

function SimpleZoneMap({ active }) {
  const width = 360; const height = 240;
  const zones = [
    { x: 100, y: 120, r: 110, color: "#22c55e" },
    { x: 180, y: 130, r: 80, color: "#f59e0b" },
    { x: 220, y: 150, r: 60, color: "#ef4444" },
  ];
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8fafc" />
      {zones.map((z, i) => (
        <circle key={i} cx={z.x} cy={z.y} r={z.r} fill={z.color} fillOpacity={0.28} />
      ))}
      {active && <pulse-circle cx={180} cy={140} r={14} />}
      {/* User marker */}
      <circle cx={180} cy={140} r={10} fill="#3b82f6" stroke="#fff" strokeWidth={2} />
    </svg>
  );
}

function SosIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
    </svg>
  );
}
function PhoneIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg">
      <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.72 11.72 0 003.68.59 1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h2.37a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.24 1.01l-2.1 2.1z" />
    </svg>
  );
}
function ChatIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4h16a1 1 0 011 1v11a1 1 0 01-1 1H7l-4 4V5a1 1 0 011-1z" />
    </svg>
  );
}
function CancelIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg">
      <path d="M6.343 6.343l11.314 11.314-1.414 1.414L4.93 7.757l1.414-1.414z" />
      <path d="M17.657 6.343L6.343 17.657l-1.414-1.414L16.243 4.93l1.414 1.414z" />
    </svg>
  );
}
function CheckIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`h-4 w-4 ${className}`} xmlns="http://www.w3.org/2000/svg">
      <path d="M9.173 16.727l-4.9-4.9 1.414-1.414 3.486 3.485 8.485-8.485 1.414 1.414-9.9 9.9z" />
    </svg>
  );
}
function SpinnerIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="60" strokeDashoffset="20" />
    </svg>
  );
}
