"use client";

import { useEffect, useMemo, useState } from "react";
import GMap from "../components/GMap";
import { MagnifyingGlass, Siren, ChatCircle, Warning } from "../components/PhosphorIcons";
import { useLocation } from "../components/LocationProvider";
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
  const { location: userLoc } = useLocation();

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

  // Derive circles for map heat representation (mock logic)
  const circles = useMemo(() => {
    const center = userLoc || { lat: 28.6139, lng: 77.2090 }; // Delhi fallback
    // Spread 3 circles offset in lat/lng
    return [
      { center: { lat: center.lat + 0.010, lng: center.lng + 0.012 }, radius: 600, color: zoneColors[0], fillOpacity: 0.10 },
      { center: { lat: center.lat - 0.006, lng: center.lng + 0.006 }, radius: 500, color: zoneColors[1], fillOpacity: 0.10 },
      { center: { lat: center.lat + 0.004, lng: center.lng - 0.010 }, radius: 450, color: zoneColors[2], fillOpacity: 0.10 },
    ];
  }, [zoneColors, userLoc]);

  return (
    <div className="w-full">
      <div className="px-4 md:px-6 pt-6 mx-auto w-full max-w-[1100px] lg:grid lg:grid-cols-12 lg:gap-10">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 xl:col-span-8">
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
          <div className="mt-8">
            <label className="input input-bordered flex items-center gap-2 shadow-sm w-full bg-base-100 focus-within:ring-2 focus-within:ring-primary/20 transition-shadow">
              <MagnifyingGlass className="text-base-content/40 h-5 w-5" />
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
        {/* RIGHT COLUMN */}
        <aside className="mt-10 lg:mt-0 lg:col-span-5 xl:col-span-4 space-y-8">
          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-bold text-base-content mb-4">Quick Actions</h2>

            <a href="/sos" className="btn btn-error btn-lg w-full mb-4 text-lg shadow-lg hover:shadow-xl transition-shadow">
              <Siren className="mr-2 h-6 w-6" /> Emergency SOS
            </a>

            <div className="grid grid-cols-2 gap-3">
              <a href="/community" className="bg-base-100 border border-base-300 rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ChatCircle className="text-primary h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-base-content">Community</p>
                  <p className="text-xs text-base-content/60">Safety reports</p>
                </div>
              </a>

              <a href="/report" className="bg-base-100 border border-base-300 rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <Warning className="text-warning h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-base-content">Report</p>
                  <p className="text-xs text-base-content/60">Share incident</p>
                </div>
              </a>
            </div>
          </div>

          {/* Heatmap Section */}
          <div className="mt-8">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-base-content">Safety Heatmap</h2>
                <p className="text-sm text-base-content/60 mt-0.5">See how safety changes by time</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg border border-base-300 bg-base-100" style={{ height: 260 }}>
              <GMap
                zoom={13}
                center={userLoc || { lat: 28.6139, lng: 77.2090 }}
                markers={userLoc ? [{ position: userLoc, label: 'You' }] : []}
                circles={circles}
              />
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs">
              <LegendSwatch color={zoneColors[0]} label="Low Risk" />
              <LegendSwatch color={zoneColors[1]} label="Moderate" />
              <LegendSwatch color={zoneColors[2]} label="Higher" />
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
        </aside>
      </div>
      {/* Floating SOS */}
      <a
        href="/sos"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-error text-error-content shadow-lg hover:shadow-xl flex items-center justify-center"
        aria-label="Emergency SOS"
      >
        <Siren className="h-5 w-5" />
      </a>
    </div>
  );
}

// Phosphor icons used above

function LegendSwatch({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-3 w-6 rounded-sm" style={{ background: color }} />
      <span className="text-base-content/60">{label}</span>
    </span>
  );
}

// end
