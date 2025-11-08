"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Microphone, Square, PaperPlaneRight } from "../components/PhosphorIcons";

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
    <div className="w-full min-h-screen bg-base-100 pt-6 pb-24">
      <div className="mx-auto w-full max-w-[1100px] px-4 md:px-6 lg:grid lg:grid-cols-12 lg:gap-10">
        {/* LEFT: Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
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
              className="textarea textarea-bordered w-full h-40 resize-none leading-relaxed text-base"
            />
            <p className="text-xs text-base-content/50 mt-2">Be as specific as possible to help others</p>
          </div>

          {/* Upload */}
          <div className="mt-8">
            <div className="mb-3">
              <span className="text-sm font-bold text-base-content">Evidence</span>
              <span className="text-xs text-base-content/60 ml-2">(Optional)</span>
            </div>
      <label className="btn btn-outline w-full h-auto py-4 cursor-pointer" htmlFor="file-input">
              <div className="flex items-center justify-center gap-3">
        <Camera className="h-6 w-6" />
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
            <PaperPlaneRight className="mr-2 h-5 w-5" /> Submit Report
          </button>
        </div>

        {/* RIGHT: Tools */}
        <aside className="mt-10 lg:mt-0 lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="bg-base-100 border border-base-300 rounded-xl p-4">
            <div className="flex items-center gap-2">
              {!recording ? (
                <button className="btn btn-outline" onClick={startRecording} disabled={busy}>
                  <Microphone className="h-5 w-5" />
                  Record What's Happening
                </button>
              ) : (
                <button className="btn btn-error" onClick={stopRecording}>
                  <Square className="h-5 w-5" />
                  Stop ({recordSecs}s)
                </button>
              )}
              {busy && <span className="loading loading-dots loading-sm" />}
            </div>
            <p className="text-[11px] text-base-content/60 mt-3">Use your voice to quickly capture details; transcript is auto-appended.</p>
          </div>
          <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-xs">
            In immediate danger? <a href="/sos" className="text-error font-bold hover:underline">Trigger Emergency SOS</a>
          </div>
          <div className="bg-base-200 rounded-xl p-4 text-xs text-base-content/70 leading-relaxed space-y-2">
            <p className="font-semibold text-base-content">Tips for clear reports:</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Time, place, and description of people involved.</li>
              <li>What you observed vs. what you inferred.</li>
              <li>Attach photos or short video when safe.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

// Replaced inline icons with Phosphor components above
