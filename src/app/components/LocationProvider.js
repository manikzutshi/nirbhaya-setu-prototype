"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

// Keys for localStorage
const CACHE_KEY = "ns_loc_cache_v1"; // { lat, lng, ts }
const PROMPTED_KEY = "ns_loc_prompted_v1"; // boolean
const TTL_MS = 10 * 60 * 1000; // 10 minutes cache

const Ctx = createContext({
  location: null,
  status: "idle", // idle | granted | prompt | denied | error
  error: null,
  request: () => {},
  refresh: () => {},
});

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const askedRef = useRef(false);

  // Load cached location
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const { lat, lng, ts } = JSON.parse(raw);
        if (lat && lng && ts && Date.now() - ts < TTL_MS) {
          setLocation({ lat, lng });
        }
      }
    } catch {}
  }, []);

  // Track permission state if available
  useEffect(() => {
    let perm;
    if (typeof navigator !== "undefined" && navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((p) => {
        perm = p;
        setStatus(p.state);
        p.onchange = () => setStatus(p.state);
        // If already granted and no location yet, fetch quietly
        if (p.state === "granted" && !location) {
          getPosition(false);
        }
        // If prompt and we haven't asked in this browser yet, ask once
        if (p.state === "prompt" && !askedRef.current) {
          const alreadyPrompted = localStorage.getItem(PROMPTED_KEY) === "1";
          if (!alreadyPrompted) {
            getPosition(true);
          }
        }
      }).catch(() => {
        // Fallback: attempt a single request
        if (!location && !askedRef.current) getPosition(true);
      });
    } else {
      // No Permissions API
      if (!location && !askedRef.current) getPosition(true);
    }
    return () => { if (perm) perm.onchange = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPosition = useCallback((markPrompted) => {
    if (!("geolocation" in navigator)) return;
    askedRef.current = true;
    if (markPrompted) {
      try { localStorage.setItem(PROMPTED_KEY, "1"); } catch {}
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        setError(null);
        setStatus("granted");
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ...loc, ts: Date.now() })); } catch {}
      },
      (err) => {
        setError(err?.message || "Failed to get location");
        // Map error to a state
        if (err && (err.code === 1 || /denied/i.test(err.message))) setStatus("denied");
        else setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: TTL_MS }
    );
  }, []);

  const request = useCallback(() => getPosition(true), [getPosition]);
  const refresh = useCallback(() => getPosition(false), [getPosition]);

  const value = useMemo(() => ({ location, status, error, request, refresh }), [location, status, error, request, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocation() {
  return useContext(Ctx);
}
