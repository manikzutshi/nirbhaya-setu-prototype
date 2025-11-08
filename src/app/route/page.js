"use client";

import { useEffect, useMemo, useState } from "react";
import GMap from "../components/GMap";

export default function RoutePlannerPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  async function planRoute() {
    setLoading(true);
    try {
      const res = await fetch("/api/route/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin: origin || "Current Location", destination: destination || "City Center" }),
      });
      const data = await res.json();
      setPlan(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Auto-plan initial mock route
    planRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full min-h-screen bg-base-100 pt-6 pb-24">
      <div className="mx-auto w-full max-w-[1100px] px-4 md:px-6 lg:grid lg:grid-cols-12 lg:gap-10">
        {/* LEFT: Inputs */}
        <div className="lg:col-span-5 xl:col-span-4">
          <h1 className="text-xl font-semibold text-base-content/70">Route Planner</h1>
          <p className="text-sm text-base-content/60 mt-1">Compare fastest vs safest routes.</p>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <label className="input input-bordered flex items-center gap-2">
              <PinIcon className="text-primary" />
              <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Origin (e.g., Current Location)" className="grow bg-transparent outline-none" />
            </label>
            <label className="input input-bordered flex items-center gap-2">
              <FlagIcon className="text-success" />
              <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination (e.g., City Center)" className="grow bg-transparent outline-none" />
            </label>
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={planRoute} disabled={loading}>
                {loading ? "Planning…" : "Plan Route"}
              </button>
            </div>
            {plan && (
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <InfoPill label="Fastest" value={`${plan.fastest.meta.eta} | ${plan.fastest.meta.distance}`} color="text-error" />
                <InfoPill label="Safest" value={`${plan.safest.meta.eta} | ${plan.safest.meta.distance}`} color="text-success" />
              </div>
            )}
            <p className="mt-3 text-xs text-base-content/50">
              Routes computed on backend (A*). Risk scores provided by our AI model. This demo uses mock data.
            </p>
          </div>
        </div>

        {/* RIGHT: Map */}
        <aside className="mt-10 lg:mt-0 lg:col-span-7 xl:col-span-8">
          <div className="rounded-xl overflow-hidden shadow border border-base-300 bg-base-100" style={{ height: 360 }}>
            <GMap
              zoom={14}
              center={{ lat: 28.6139, lng: 77.2090 }}
              polylines={plan ? [
                { path: plan.fastest.path.map(([x,y]) => ({ lat: 28.60 + y/100, lng: 77.20 + x/100 })), strokeColor: '#ef4444', strokeWeight: 5, dashed: true },
                { path: plan.safest.path.map(([x,y]) => ({ lat: 28.60 + y/100, lng: 77.20 + x/100 })), strokeColor: '#22c55e', strokeWeight: 5 }
              ] : []}
            />
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs">
            <Legend color="#ef4444" text="Fastest (High Risk)" dashed />
            <Legend color="#22c55e" text="Safest (Low Risk)" />
            {plan?.safest?.meta?.risk && (
              <span className="font-medium text-base-content/70">Risk: {plan.safest.meta.risk}</span>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoPill({ label, value, color = "" }) {
  return (
    <div className={`px-2 py-1 rounded-lg border border-base-300 bg-base-100 flex items-center gap-2 ${color}`}>
      <span className="font-semibold">{label}</span>
      <span className="text-base-content/70">{value}</span>
    </div>
  );
}

function Legend({ color, text, dashed }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="28" height="6" viewBox="0 0 28 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 3H27" stroke={color} strokeWidth="3" strokeDasharray={dashed ? "6 6" : undefined} strokeLinecap="round" />
      </svg>
      <span className="text-base-content/70">{text}</span>
    </span>
  );
}

function SimpleMap({ fastest = [], safest = [] }) {
  // Normalize coords (lat,lng in [0..1]) to viewBox 360x260
  const width = 360;
  const height = 260;

  function toPoints(arr) {
    return arr
      .map(([x, y]) => {
        const px = Math.round(x * width);
        const py = Math.round((1 - y) * height);
        return `${px},${py}`;
      })
      .join(" ");
  }

  const fastestPts = toPoints(fastest);
  const safestPts = toPoints(safest);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* background grid */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d={`M 20 0 L 0 0 0 20`} fill="none" stroke="#e5e7eb" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="#f8fafc" />
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* paths */}
      {fastestPts && (
        <polyline points={fastestPts} fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="10 8" strokeLinecap="round" />
      )}
      {safestPts && (
        <polyline points={safestPts} fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" />
      )}

      {/* endpoints */}
      {safest[0] && (
        <circle cx={safest[0][0] * width} cy={(1 - safest[0][1]) * height} r="6" fill="#3b82f6" />
      )}
      {safest[safest.length - 1] && (
        <rect x={safest[safest.length - 1][0] * width - 6} y={(1 - safest[safest.length - 1][1]) * height - 6} width="12" height="12" fill="#10b981" />
      )}
    </svg>
  );
}

function PinIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${className}`}>
      <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
    </svg>
  );
}

function FlagIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${className}`}>
      <path d="M4 3h2v18H4V3zm4 0h10l-2 4 2 4H8V3z" />
    </svg>
  );
}
