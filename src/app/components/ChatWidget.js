"use client";

import { useRef, useState } from "react";
import { useLocation } from "./LocationProvider";

export default function ChatWidget() {
  const { location } = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I’m your Safety Concierge. Ask about area safety, routes, or tips." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, location, hour: new Date().getHours() }),
      });
      const data = await res.json();
      const ans = data.answer || data.error || "No response";
      setMessages((m) => [...m, { role: "assistant", text: ans }]);
      // Scroll to bottom
      setTimeout(() => {
        bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
      }, 50);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Sorry, I couldn’t respond just now." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-6 sm:right-24 z-40">
      {!open && (
        <button
          className="btn btn-error normal-case text-white shadow-lg rounded-full px-4"
          onClick={() => setOpen(true)}
          aria-label="Open Safety Concierge"
        >
          Safety Concierge
        </button>
      )}
      {open && (
        <div className="w-[320px] sm:w-[360px] h-[420px] bg-base-100 border border-base-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-base-300 flex items-center justify-between bg-base-200">
            <div>
              <p className="text-sm font-semibold">Safety Concierge</p>
              <p className="text-[11px] text-base-content/60">Ask about safety, routes, and tips</p>
            </div>
            <button className="btn btn-ghost btn-xs" onClick={() => setOpen(false)}>
              <IconX className="h-4 w-4" />
            </button>
          </div>
          <div ref={bodyRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`chat ${m.role === "user" ? "chat-end" : "chat-start"}`}>
                <div className={`chat-bubble ${m.role === "user" ? "chat-bubble-primary" : ""}`}>
                  {renderMessage(m.text)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat chat-start">
                <div className="chat-bubble">Thinking…</div>
              </div>
            )}
          </div>
          <div className="p-2 border-t border-base-300 flex items-center gap-2">
            <input
              className="input input-bordered input-sm w-full"
              placeholder="Type your question"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="btn btn-primary btn-sm" onClick={send} disabled={loading}>
              <IconPaperPlaneRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function renderMessage(text) {
  if (!text || typeof text !== "string") return text;
  let s = text.replace(/\*\*\s+([^*]+?)\s+\*\*/g, "**$1**");
  const lines = s.split(/\r?\n/);
  const blocks = [];
  let list = [];
  const flush = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc pl-5 space-y-1 text-sm">
        {list.map((li, i) => (
          <li key={i}>{renderInline(li)}</li>
        ))}
      </ul>
    );
    list = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const m = line.match(/^(?:[*•\-]\s+)(.*)$/);
    if (m) { list.push(m[1].trim()); continue; }
    flush();
    blocks.push(
      <p key={`p-${blocks.length}`} className="text-sm mb-1">{renderInline(line)}</p>
    );
  }
  flush();
  return <>{blocks.length ? blocks : renderInline(s)}</>;
}

function renderInline(line) {
  if (!line.includes("**")) return line;
  const parts = line.split("**");
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i];
    if (i % 2 === 1) out.push(<strong key={`b-${i}`}>{seg.trim()}</strong>);
    else if (seg) out.push(<span key={`t-${i}`}>{seg}</span>);
  }
  return <>{out}</>;
}

// Inline Phosphor SVGs (from phosphor.txt)
function IconX({ className = "", size = 16 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width={size} height={size} className={className} fill="currentColor">
      <path d="M204.24,195.76a6,6,0,1,1-8.48,8.48L128,136.49,60.24,204.24a6,6,0,0,1-8.48-8.48L119.51,128,51.76,60.24a6,6,0,0,1,8.48-8.48L128,119.51l67.76-67.75a6,6,0,0,1,8.48,8.48L136.49,128Z" />
    </svg>
  );
}

function IconPaperPlaneRight({ className = "", size = 16 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width={size} height={size} className={className} fill="currentColor">
      <path d="M230.88,115.69l-168-95.88a14,14,0,0,0-20,16.87L73.66,128,42.81,219.33A14,14,0,0,0,56,238a14.15,14.15,0,0,0,6.93-1.83L230.84,140.1a14,14,0,0,0,0-24.41Zm-5.95,14L57,225.73a2,2,0,0,1-2.86-2.42.42.42,0,0,0,0-.1L84.3,134H144a6,6,0,0,0,0-12H84.3L54.17,32.8a.3.3,0,0,0,0-.1,1.87,1.87,0,0,1,.6-2.2A1.85,1.85,0,0,1,57,30.25l168,95.89a1.93,1.93,0,0,1,1,1.74A2,2,0,0,1,224.93,129.66Z" />
    </svg>
  );
}
