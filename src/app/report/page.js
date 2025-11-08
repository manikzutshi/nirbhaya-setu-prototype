"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const CATEGORIES = ["Poor Lighting", "Harassment", "Suspicious Activity", "Theft"]; 

export default function ReportPage() {
  const [selectedCategory, setSelectedCategory] = useState("Theft");
  const [reportText, setReportText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [coords, setCoords] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [busy, setBusy] = useState(false);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords([p.coords.latitude, p.coords.longitude]),
      () => setCoords(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const locationLabel = useMemo(() => {
    if (!coords) return "Current Location";
    return `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
  }, [coords]);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    const mr = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = mr;
    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    mr.onstop = async () => {
      clearInterval(timerRef.current);
      setRecording(false);
      const blob = new Blob(chunks, { type: mimeType });
      await transcribe(blob);
      stream.getTracks().forEach((t) => t.stop());
    };
    mr.start();
    setRecordSecs(0);
    setRecording(true);
    timerRef.current = setInterval(() => setRecordSecs((s) => s + 1), 1000);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  async function transcribe(blob) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("audio", blob, `note.webm`);
      const res = await fetch("/api/report/transcribe", { method: "POST", body: fd });
      const data = await res.json();
      const text = [data.transcript, data.summary ? `\n\nSummary: ${data.summary}` : ""].filter(Boolean).join("");
      setReportText((prev) => prev ? `${prev}\n\n${text}` : text);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  async function submitReport() {
    setBusy(true);
    try {
      const payload = {
        category: selectedCategory,
        description: reportText,
        location: coords ? { lat: coords[0], lng: coords[1] } : null,
        anonymous: isAnonymous,
        attachments: uploadFiles.map((f) => ({ name: f.name, type: f.type, size: f.size })),
      };
      const res = await fetch("/api/report/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      alert(`Report received. Hash: ${data.hash}\n(Blockchain write pending)`);
      setReportText("");
      setUploadFiles([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-base-100">
      <div className="px-4 pt-4 pb-8">
        <div className="mx-auto max-w-md w-full">
          <div className="mt-6 bg-primary/5 border border-primary/20 rounded-xl p-4">
            <p className="text-sm text-base-content/80">
              <span className="font-semibold text-base-content">Help keep everyone safe.</span> Your report helps the community stay informed.
            </p>
          </div>

          {/* Incident Type */}
          <div className="mt-8">
            <div className="mb-3">
              <span className="text-sm font-bold text-base-content">Incident Type</span>
              <span className="text-error ml-1">*</span>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Incident type selection">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat ? "bg-primary text-primary-content shadow-md" : "bg-base-200 text-base-content hover:bg-base-300"}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <label htmlFor="reportText" className="block mb-3">
              <span className="text-sm font-bold text-base-content">What Happened?</span>
              <span className="text-error ml-1">*</span>
            </label>
            <textarea
              id="reportText"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Describe the incident in detail... When did it happen? Who was involved? Any other relevant details?"
              className="textarea textarea-bordered w-full h-32 resize-none leading-relaxed text-base"
            />
            <p className="text-xs text-base-content/50 mt-2">Be as specific as possible to help others</p>
          </div>

          {/* Recording */}
          <div className="mt-6 flex items-center gap-2">
            {!recording ? (
              <button className="btn btn-outline" onClick={startRecording} disabled={busy}>
                <MicIcon />
                Record What's Happening
              </button>
            ) : (
              <button className="btn btn-error" onClick={stopRecording}>
                <StopIcon />
                Stop ({recordSecs}s)
              </button>
            )}
            {busy && <span className="loading loading-dots loading-sm" />}
          </div>

          {/* Upload */}
          <div className="mt-8">
            <div className="mb-3">
              <span className="text-sm font-bold text-base-content">Evidence</span>
              <span className="text-xs text-base-content/60 ml-2">(Optional)</span>
            </div>
            <label className="btn btn-outline w-full h-auto py-4 cursor-pointer" htmlFor="file-input">
              <div className="flex items-center justify-center gap-3">
                <CameraIcon className="h-6 w-6" />
                <div className="text-left">
                  <p className="font-semibold">Upload Photo or Video</p>
                  <p className="text-xs text-base-content/60 font-normal">Helps verify the incident</p>
                </div>
              </div>
            </label>
            <input id="file-input" type="file" className="hidden" accept="image/*,video/*" multiple onChange={(e) => setUploadFiles(Array.from(e.target.files || []))} />
            {!!uploadFiles.length && (
              <ul className="mt-2 text-xs text-base-content/70">
                {uploadFiles.map((f) => (
                  <li key={f.name}>{f.name} ({Math.round(f.size/1024)} KB)</li>
                ))}
              </ul>
            )}
          </div>

          {/* Location & Anon */}
          <div className="mt-8">
            <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                <span className="text-sm font-medium">Submit Anonymously</span>
              </label>
              <p className="text-xs text-base-content/50 font-mono truncate max-w-32">{locationLabel}</p>
            </div>
          </div>

          {/* Submit */}
          <button className="btn btn-primary w-full mt-8 btn-lg shadow-lg" disabled={!reportText.trim() || busy} onClick={submitReport}>
            <SendIcon className="mr-2" /> Submit Report
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-base-content/60">
              In immediate danger? <a href="/sos" className="text-error font-bold hover:underline">Trigger Emergency SOS</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MicIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${className}`}>
      <path d="M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3zm-1 15.9V22h2v-4.1A7.002 7.002 0 0019 11h-2a5 5 0 01-10 0H5a7.002 7.002 0 006 6.9z" />
    </svg>
  );
}

function StopIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${className}`}>
      <path d="M6 6h12v12H6z" />
    </svg>
  );
}

function CameraIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${className}`}>
      <path d="M9 3l1.5 2H20a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1h3L9 3zm3 5a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
    </svg>
  );
}

function SendIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${className}`}>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}
