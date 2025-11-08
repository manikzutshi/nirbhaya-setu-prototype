"use client";

import { useMemo, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0";

function getGreeting(date = new Date()) {
  const h = date.getHours();
  if (h < 4) return "Good Night";
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function getRoles(user) {
  if (!user) return [];
  // Common places roles might be present; adjust to your Auth0 rule/action mapping
  const candidates = [
    user.roles,
    user["https://nirbhaya-setu/roles"],
    user["https://schemas.quickstarts/roles"],
  ].filter(Boolean);
  return Array.isArray(candidates[0]) ? candidates[0] : [];
}

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [hour, setHour] = useState(new Date().getHours());

  const greeting = useMemo(() => getGreeting(), []);
  const roles = getRoles(user);
  const isStudent = roles.includes("Student");
  const isWarden = roles.includes("Warden");

  // Temporary mocked safety score; wire to backend later
  const safetyScore = 8.7;
  const safetyLabel = safetyScore >= 8 ? "Very Safe" : safetyScore >= 6 ? "Safe" : safetyScore >= 4 ? "Caution" : "Risky";

  // Simple colored zone preview: mimics a heatmap visually
  const colorsForHour = (h) => {
    if (h >= 6 && h < 18) return ["#22c55e", "#84cc16", "#f59e0b"]; // day
    if (h >= 18 && h < 22) return ["#84cc16", "#f59e0b", "#ef4444"]; // evening
    return ["#f59e0b", "#ef4444", "#ef4444"]; // night
  };
  const zoneColors = colorsForHour(hour);

  return (
    <div className="w-full">
      <div className="px-4 pt-4">
        <div className="mx-auto max-w-md w-full">
          <div className="mt-6">
            <h1 className="text-xl font-semibold text-base-content/70">
              {isLoading ? "Loading…" : `${greeting}, ${user?.name || "Explorer"}`}
            </h1>

            {/* Safety Score Card */}
            <div className="mt-5 bg-linear-to-br from-success/10 to-success/5 rounded-2xl p-6 shadow-sm border border-success/20">
              <div className="flex items-end gap-3">
                <div className="flex items-baseline gap-1">
                  <p className="text-6xl font-bold text-success" style={{ lineHeight: 1 }}>{safetyScore}</p>
                  <span className="text-2xl font-semibold text-success/70">/10</span>
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-base font-semibold text-base-content">{safetyLabel}</p>
                  <p className="text-sm text-base-content/60">Based on your location</p>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Concierge (GenAI) */}
          <div className="mt-6">
            <label className="input input-bordered flex items-center gap-2 shadow-sm w-full bg-base-100 focus-within:ring-2 focus-within:ring-primary/20 transition-shadow">
              <SearchIcon className="text-base-content/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask Safety Concierge… e.g., ‘Is the market area safe at 9 pm?’"
                className="grow bg-transparent outline-none"
              />
            </label>
            <div className="mt-3 flex gap-2">
              <button
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  if (!query.trim()) return;
                  setLoading(true);
                  setAnswer("");
                  try {
                    const res = await fetch("/api/concierge", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ query }),
                    });
                    const data = await res.json();
                    setAnswer(data.answer || data.error || "No response");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Ask
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setQuery(""); setAnswer(""); }}>Clear</button>
            </div>
            {loading && (
              <div className="mt-3 text-sm text-base-content/60">Thinking…</div>
            )}
            {!loading && !!answer && (
              <div className="mt-3 bg-base-100 border border-base-300 rounded-xl p-3 text-sm">
                {answer}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="mx-auto max-w-md w-full">
          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-base-content mb-4">Quick Actions</h2>

            <a href="/sos" className="btn btn-error btn-lg w-full mb-4 text-lg shadow-lg hover:shadow-xl transition-shadow">
              <SosIcon className="mr-2 h-6 w-6" /> Emergency SOS
            </a>

            <div className="grid grid-cols-2 gap-3">
              <a href="/community" className="bg-base-100 border border-base-300 rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ChatIcon className="text-primary h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-base-content">Community</p>
                  <p className="text-xs text-base-content/60">Safety reports</p>
                </div>
              </a>

              <a href="/report" className="bg-base-100 border border-base-300 rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <WarningIcon className="text-warning h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-base-content">Report</p>
                  <p className="text-xs text-base-content/60">Share incident</p>
                </div>
              </a>
            </div>
          </div>

          {/* Heatmap Section */}
          <div className="mt-10">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-base-content">Safety Heatmap</h2>
                <p className="text-sm text-base-content/60 mt-0.5">See how safety changes by time</p>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden shadow-lg border border-base-300 bg-base-100" style={{ height: 260 }}>
              <div className="relative w-full h-full">
                {/* Simple circles to simulate zones */}
                <div className="absolute rounded-full opacity-70" style={{ left: 40, top: 60, width: 160, height: 160, background: zoneColors[0] }} />
                <div className="absolute rounded-full opacity-60" style={{ left: 140, top: 80, width: 120, height: 120, background: zoneColors[1] }} />
                <div className="absolute rounded-full opacity-50" style={{ left: 80, top: 120, width: 100, height: 100, background: zoneColors[2] }} />
              </div>
            </div>

            {/* Time Slider */}
            <div className="mt-5 bg-base-100 border border-base-300 rounded-xl p-4">
              <div className="flex items-baseline justify-between mb-3">
                <label htmlFor="hour" className="text-sm font-semibold text-base-content">
                  Time of Day
                </label>
                <span className="text-lg font-bold text-primary">{hour}:00</span>
              </div>
              <input
                id="hour"
                type="range"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="range range-primary range-sm w-full"
              />
              <div className="flex justify-between text-xs text-base-content/50 mt-2 px-1">
                <span>12am</span>
                <span>6am</span>
                <span>12pm</span>
                <span>6pm</span>
                <span>11pm</span>
              </div>
            </div>
          </div>

          {/* Conditional actions based on role */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {isStudent && (
              <a href="/campus" className="btn btn-primary btn-lg">
                Campus Mode
              </a>
            )}
            {isWarden && (
              <a href="/warden" className="btn btn-secondary btn-lg">
                Warden
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Floating SOS */}
      <a
        href="/sos"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-error text-error-content shadow-lg hover:shadow-xl flex items-center justify-center"
        aria-label="Emergency SOS"
      >
        <SosIcon />
      </a>
    </div>
  );
}

function SearchIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${className}`}>
      <path d="M10 2a8 8 0 105.293 14.293l4.207 4.207 1.414-1.414-4.207-4.207A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
    </svg>
  );
}

function SosIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${className}`}>
      <path d="M12 2a1 1 0 01.894.553l8 16A1 1 0 0120 20H4a1 1 0 01-.894-1.447l8-16A1 1 0 0112 2zm0 4.618L6.618 18h10.764L12 6.618zM11 10h2v4h-2v-4zm0 6h2v2h-2v-2z" />
    </svg>
  );
}

function ChatIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${className}`}>
      <path d="M4 3h16a1 1 0 011 1v11a1 1 0 01-1 1H8.414L4.707 19.707A1 1 0 013 19V4a1 1 0 011-1zm1 2v11.586L7.586 14H19V5H5z" />
    </svg>
  );
}

function WarningIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${className}`}>
      <path d="M12 4l9 16H3l9-16zm0 3.618L6.618 18h10.764L12 7.618zM11 10h2v4h-2v-4zm0 6h2v2h-2v-2z" />
    </svg>
  );
}
