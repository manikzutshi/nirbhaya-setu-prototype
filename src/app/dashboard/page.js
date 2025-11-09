"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import GMap from "../components/GMap";
import { Siren, ChatCircle, Warning } from "../components/PhosphorIcons";
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
  const { location: userLoc } = useLocation();

  // Tabs: route planner vs safety check (from former /route page)
  const [activeTab, setActiveTab] = useState("route");

  // Route planner state
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);
  const [routePlan, setRoutePlan] = useState(null);
  const [routeStatus, setRouteStatus] = useState("");

  // Safety check state
  const [checkLocation, setCheckLocation] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [checkStatus, setCheckStatus] = useState("");

  // Map / heatmap state
  const [heatmapData, setHeatmapData] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const mapsObjRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [geocoder, setGeocoder] = useState(null);

  // Refs for inputs (autocomplete)
  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const checkInputRef = useRef(null);

  // Internal markers (user/start/end/safety check point)
  const [markers, setMarkers] = useState([]);

  // Mongo enhanced (single map, choose data source)
  const [useMongo, setUseMongo] = useState(false);
  const [heatmapDataMongo, setHeatmapDataMongo] = useState([]);
  const [mongoLoading, setMongoLoading] = useState(false);

  // Contact onboarding (local) + banner
  const [contacts, setContacts] = useState([]);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [showContactBanner, setShowContactBanner] = useState(false);

  const greeting = useMemo(() => getGreeting(), []);
  const roles = getRoles(user);
  const isStudent = roles.includes("Student");
  const isWarden = roles.includes("Warden");

  // Polylines for routes
  const polylines = useMemo(() => {
    if (!routePlan) return [];
    return [
      { path: routePlan.fastest.path, strokeColor: '#ef4444', strokeWeight: 5, dashed: true },
      { path: routePlan.safest.path, strokeColor: '#22c55e', strokeWeight: 5 }
    ];
  }, [routePlan]);

  // Fetch heatmap data once (legacy)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/heatmap');
        const data = await res.json();
        if (!data.error && Array.isArray(data)) setHeatmapData(data);
      } catch (_) {}
    })();
  }, []);

  // Fetch Mongo heatmap data once
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/heatmap_mongo');
        const data = await res.json();
        if (!data.error && Array.isArray(data)) setHeatmapDataMongo(data);
      } catch (_) {}
    })();
  }, []);

  // Load & persist contacts for onboarding
  useEffect(() => {
    try {
      const raw = localStorage.getItem('trustedContacts');
      if (raw) setContacts(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('trustedContacts', JSON.stringify(contacts)); } catch {}
    if (contacts.length > 0) setShowContactBanner(false);
  }, [contacts]);

  useEffect(() => {
    if (user && !isLoading) {
      if (contacts.length === 0) {
        const skipped = localStorage.getItem('contactOnboardingSkipped');
        if (skipped === 'true') setShowContactBanner(true); else setShowContactModal(true);
      }
    }
  }, [user, isLoading, contacts.length]);

  // Initialize Places Autocomplete when map ready
  useEffect(() => {
    if (!mapReady || !mapsObjRef.current) return;
    const maps = mapsObjRef.current;
    const bounds = new maps.LatLngBounds(new maps.LatLng(28.4, 76.8), new maps.LatLng(28.9, 77.3));
    const setup = (ref, setter) => {
      if (!ref.current) return;
      const ac = new maps.places.Autocomplete(ref.current, { componentRestrictions: { country: 'in' } });
      ac.setBounds(bounds);
      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        setter(place.formatted_address || place.name || "");
      });
    };
    setup(originRef, setOrigin);
    setup(destinationRef, setDestination);
    setup(checkInputRef, setCheckLocation);
  }, [mapReady]);

  async function handlePlanRoute() {
    if (!origin || !destination) { setRouteStatus('Please enter both start and end points.'); return; }
    setActiveTab('route');
    setRouteLoading(true);
    setRoutePlan(null);
    setScoreResult(null);
    setMarkers([]);
    setRouteStatus('1. Finding routes from Google...');
    try {
      const res = await fetch('/api/route/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ origin, destination }) });
      if (!res.ok) throw new Error('Route API failed');
      setRouteStatus('2. Analyzing route safety...');
      const data = await res.json();
      if (data.error) {
        setRouteStatus('Error: ' + data.error);
        setMarkers([]);
      } else {
        setRoutePlan(data);
        setMarkers([
          { lat: data.start_location.lat, lng: data.start_location.lng, label: 'Start' },
          { lat: data.end_location.lat, lng: data.end_location.lng, label: 'End' }
        ]);
        setRouteStatus('Fastest (Red), Safest (Green)');
      }
    } catch (e) {
      setRouteStatus('Failed to plan route');
    } finally { setRouteLoading(false); }
  }

  function onMapReady({ map, maps }) {
    mapsObjRef.current = maps;
    mapInstanceRef.current = map;
    setMapReady(true);
    setGeocoder(new maps.Geocoder());
  // Click-to-score -> safety check tab
    try {
      maps.event.addListener(map, 'click', (ev) => {
        const lat = ev.latLng.lat();
        const lng = ev.latLng.lng();
        setActiveTab('check');
        setRoutePlan(null);
        fetchAndShowScore(lat, lng, 'Selected Point');
      });
    } catch (_) {}
  }

  // Single map approach: click handler chooses current data source

  async function fetchAndShowScore(lat, lng, name) {
    setCheckLoading(true);
    setCheckStatus('Analyzing safety score...');
    setRoutePlan(null);
    setScoreResult(null);
    setMarkers([{ lat, lng, label: name }]);
  try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat, lng });
        mapInstanceRef.current.setZoom(15);
      }
      const res = await fetch('/api/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lat, lng }) });
      if (!res.ok) throw new Error('Score API failed');
      const data = await res.json();
      setScoreResult({ ...data, name });
      setCheckStatus('Score calculated.');
    } catch (e) {
      setCheckStatus('Error calculating score');
      setScoreResult(null);
    } finally {
      setCheckLoading(false);
    }
  }

  async function fetchAndShowScoreMongo(lat, lng, name) {
    setMongoLoading(true); setCheckStatus('Analyzing (Mongo)...');
    setRoutePlan(null); setScoreResult(null); setMarkers([{ lat, lng, label: name }]);
    try {
      if (mapInstanceRef.current) { mapInstanceRef.current.panTo({ lat, lng }); mapInstanceRef.current.setZoom(15); }
      const res = await fetch('/api/score_mongo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lat, lng }) });
      if (!res.ok) throw new Error('Score Mongo API failed');
      const data = await res.json();
      setScoreResult({ ...data, name });
      setCheckStatus('Score (Mongo) done');
    } catch(e) { setCheckStatus('Mongo score error'); setScoreResult(null); }
    finally { setMongoLoading(false); }
  }

  async function handleCheckScore() {
    if (!checkLocation) { setCheckStatus('Please enter a location to check.'); return; }
    if (!geocoder) { setCheckStatus('Map not ready'); return; }
    setActiveTab('check');
    setCheckLoading(true);
    setScoreResult(null);
    setRoutePlan(null);
    setCheckStatus(`1. Finding "${checkLocation}"...`);
    try {
      const { results } = await geocoder.geocode({ address: checkLocation + ', Delhi' });
      if (results && results[0]) {
        const loc = results[0].geometry.location;
        const name = results[0].formatted_address.split(',')[0];
        await fetchAndShowScore(loc.lat(), loc.lng(), name);
      } else {
        setCheckStatus(`Could not find "${checkLocation}".`);
      }
    } catch (e) {
      setCheckStatus('Error finding location.');
    } finally {
      setCheckLoading(false);
    }
  }

  function getCurrentLocation() {
    if (!geocoder) { alert('Map still loading'); return; }
    if (!navigator.geolocation) { alert('Geolocation unsupported'); return; }
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      geocoder.geocode({ location: coords }, (results, status) => {
        if (status === 'OK' && results[0]) setOrigin(results[0].formatted_address);
      });
    });
  }

  async function handlePlanRouteMongo() {
    if (!origin || !destination) { setRouteStatus('Need start/end'); return; }
    setMongoLoading(true); setRoutePlan(null); setScoreResult(null); setMarkers([]); setRouteStatus('Mongo planning...');
    try {
      const res = await fetch('/api/route/plan_mongo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ origin, destination }) });
      if (!res.ok) throw new Error('Route Mongo API failed');
      const data = await res.json();
      if (data.error) { setRouteStatus('Error: ' + data.error); setMarkers([]); }
      else {
        setRoutePlan(data);
        setMarkers([
          { lat: data.start_location.lat, lng: data.start_location.lng, label: 'Start' },
          { lat: data.end_location.lat, lng: data.end_location.lng, label: 'End' }
        ]);
        setRouteStatus('Fastest (Red/Orange), Safest (Green/Blue)');
      }
    } catch(e) { setRouteStatus('Mongo plan failed'); }
    finally { setMongoLoading(false); }
  }

  // Adapt polylines based on source
  const polylinesMongo = useMemo(() => {
    if (!routePlan || !useMongo) return [];
    if (!routePlan.fastest || !routePlan.safest) return [];
    return [
      { path: routePlan.fastest.path, strokeColor: '#fb923c', strokeWeight: 5, dashed: true },
      { path: routePlan.safest.path, strokeColor: '#3b82f6', strokeWeight: 5 }
    ];
  }, [routePlan, useMongo]);

  function checkMyAreaMongo() {
    if (!userLoc) { setCheckStatus('Location unavailable'); return; }
    fetchAndShowScoreMongo(userLoc.lat, userLoc.lng, 'Your Area');
  }

  function addTrustedContact() {
    if (!contactName.trim() || !contactPhone.trim()) return;
    const entry = { id: crypto.randomUUID(), name: contactName.trim(), phone: contactPhone.trim() };
    setContacts(prev => [entry, ...prev]);
    setContactName('');
    setContactPhone('');
    setShowContactModal(false);
  }

  function skipTrustedContact() {
    localStorage.setItem('contactOnboardingSkipped', 'true');
    setShowContactModal(false);
    setShowContactBanner(true);
  }

  function checkMyArea() {
    if (!userLoc) { setCheckStatus('Location unavailable'); return; }
    setActiveTab('check');
    fetchAndShowScore(userLoc.lat, userLoc.lng, 'Your Area');
  }

  return (
    <div className="w-full">
      {showContactBanner && (
        <div className="bg-warning/10 border border-warning text-warning px-4 py-2 text-xs flex items-center justify-between">
          <span>Add a trusted contact for SOS alerts.</span>
          <button className="btn btn-warning btn-xs" onClick={() => setShowContactModal(true)}>Add Now</button>
        </div>
      )}
      <div className="px-4 md:px-6 pt-6 mx-auto w-full max-w-[1100px] lg:grid lg:grid-cols-12 lg:gap-10">
        {/* LEFT COLUMN (inputs + quick actions) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <h1 className="mt-6 text-xl font-semibold text-base-content/70">
            {isLoading ? 'Loading…' : `${greeting}, ${user?.name || 'Explorer'}`}
          </h1>

          {/* Tabs */}
          <div role="tablist" className="tabs tabs-boxed mt-6">
            <a role="tab" className={`tab ${activeTab === 'route' ? 'tab-active' : ''}`} onClick={() => setActiveTab('route')}>Route Planner</a>
            <a role="tab" className={`tab ${activeTab === 'check' ? 'tab-active' : ''}`} onClick={() => setActiveTab('check')}>Safety Check</a>
          </div>

          {/* Route Planner Tab */}
          <div className={`mt-4 grid grid-cols-1 gap-3 ${activeTab !== 'route' ? 'hidden' : ''}`}>
            <label className="input input-bordered flex items-center gap-2">
              <span className="text-xs font-medium text-base-content/50">From</span>
              <input ref={originRef} value={origin} onChange={(e)=>setOrigin(e.target.value)} placeholder="Origin (e.g., Current Location)" className="grow bg-transparent outline-none" />
              <button onClick={getCurrentLocation} className="btn btn-ghost btn-xs">Use</button>
            </label>
            <label className="input input-bordered flex items-center gap-2">
              <span className="text-xs font-medium text-base-content/50">To</span>
              <input ref={destinationRef} value={destination} onChange={(e)=>setDestination(e.target.value)} placeholder="Destination" className="grow bg-transparent outline-none" />
            </label>
            <div className="flex gap-2 flex-wrap">
              <button className="btn btn-primary btn-sm" onClick={useMongo ? handlePlanRouteMongo : handlePlanRoute} disabled={routeLoading || mongoLoading}>{(routeLoading||mongoLoading) ? 'Planning…' : 'Plan Route'}</button>
              <button className="btn btn-ghost btn-sm" onClick={()=>{ setRoutePlan(null); setRouteStatus(''); setMarkers([]); setScoreResult(null); }}>Reset</button>
              <label className="flex items-center gap-1 text-[11px] ml-auto cursor-pointer">
                <span className="text-base-content/60">Mongo</span>
                <input type="checkbox" className="toggle toggle-xs" checked={useMongo} onChange={()=>setUseMongo(!useMongo)} />
              </label>
            </div>
            <p className="text-xs text-base-content/60 h-5">{routeStatus}</p>
            {mongoLoading && <p className="text-[11px] text-base-content/50 h-4">Mongo analyzing…</p>}
            {routePlan && (
              <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                <InfoStat label="Fastest" val={`${routePlan.fastest.meta.eta} | ${routePlan.fastest.meta.distance}`} color={useMongo ? 'text-warning' : 'text-error'} />
                <InfoStat label="Safest" val={`${routePlan.safest.meta.eta} | ${routePlan.safest.meta.distance}`} color={useMongo ? 'text-info' : 'text-success'} />
                <div className="col-span-2 text-[11px] text-base-content/50">Risk (Safest): {routePlan.safest.meta.risk}/10</div>
              </div>
            )}
          </div>

            {/* Safety Check Tab */}
          <div className={`mt-4 grid grid-cols-1 gap-3 ${activeTab !== 'check' ? 'hidden' : ''}`}>
            <p className="text-xs text-base-content/60">Search for a place or click the map.</p>
            <label className="input input-bordered flex items-center gap-2">
              <span className="text-xs font-medium text-base-content/50">Location</span>
              <input ref={checkInputRef} value={checkLocation} onChange={(e)=>setCheckLocation(e.target.value)} placeholder="Enter location" className="grow bg-transparent outline-none" />
            </label>
            <div className="flex gap-2 flex-wrap">
              <button className="btn btn-success btn-sm" onClick={useMongo ? ()=>checkMyAreaMongo() : handleCheckScore} disabled={checkLoading || mongoLoading}>{(checkLoading||mongoLoading) ? 'Checking…' : 'Check Score'}</button>
              <button className="btn btn-ghost btn-sm" onClick={useMongo ? checkMyAreaMongo : checkMyArea} disabled={checkLoading || mongoLoading}>My Area</button>
              <label className="flex items-center gap-1 text-[11px] ml-auto cursor-pointer">
                <span className="text-base-content/60">Mongo</span>
                <input type="checkbox" className="toggle toggle-xs" checked={useMongo} onChange={()=>setUseMongo(!useMongo)} />
              </label>
            </div>
            <p className="text-xs text-base-content/60 h-5">{checkStatus}</p>
            {scoreResult && (
              <div className="mt-1 p-3 rounded-lg bg-base-200 border border-base-300">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-bold">{scoreResult.name}</h3>
                  <span className={`text-sm font-bold ${
                    scoreResult.level === 'High Risk' ? 'text-error' : scoreResult.level === 'Medium Risk' ? 'text-warning' : 'text-success'
                  }`}>{scoreResult.level}</span>
                </div>
                <div className="text-[11px] text-base-content/70 mt-1">
                  Score: {scoreResult.score}/10 • Incidents: {scoreResult.incidentCount} (recent: {scoreResult.recentIncidentCount})
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-10">
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

          {/* Role based */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {isStudent && <a href="/campus" className="btn btn-primary btn-lg">Campus Mode</a>}
            {isWarden && <a href="/warden" className="btn btn-secondary btn-lg">Warden</a>}
          </div>
        </div>
        {/* RIGHT COLUMN */}
        {/* RIGHT COLUMN (map) */}
        <aside className="mt-10 lg:mt-0 lg:col-span-7 xl:col-span-8">
          <div className="rounded-xl overflow-hidden shadow-lg border border-base-300 bg-base-100" style={{ height: 420 }}>
            <GMap
              zoom={13}
              center={userLoc || { lat: 28.6139, lng: 77.2090 }}
              markers={[...(userLoc ? [{ lat: userLoc.lat, lng: userLoc.lng, label: 'You' }] : []), ...markers]}
              polylines={useMongo ? polylinesMongo : polylines}
              heatmapData={useMongo ? heatmapDataMongo : heatmapData}
              showHeatmap={showHeatmap}
              onReady={onMapReady}
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 text-xs flex-wrap">
            <div className="flex items-center gap-4 flex-wrap">
              {useMongo ? (
                <>
                  <LineLegend color="#fb923c" text="Fastest" dashed />
                  <LineLegend color="#3b82f6" text="Safest" />
                </>
              ) : (
                <>
                  <LineLegend color="#ef4444" text="Fastest" dashed />
                  <LineLegend color="#22c55e" text="Safest" />
                </>
              )}
              {routePlan?.safest?.meta?.risk && (
                <span className="font-medium text-base-content/70">Risk: {routePlan.safest.meta.risk}/10</span>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer ml-auto">
              <span className="text-base-content/70">Heatmap</span>
              <input type="checkbox" className="toggle toggle-sm" checked={showHeatmap} onChange={()=>setShowHeatmap(!showHeatmap)} />
            </label>
          </div>
          {scoreResult && (
            <div className="mt-2 p-2 rounded-lg bg-base-200 border border-base-300 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{scoreResult.name}</span>
                <span className="font-semibold">{scoreResult.level}</span>
              </div>
              <div>Score: {scoreResult.score}/10 • Incidents: {scoreResult.incidentCount}</div>
            </div>
          )}
          {(mongoLoading || checkLoading) && <p className="mt-1 text-[10px] text-base-content/50">Analyzing…</p>}
        </aside>
      </div>
      {/* Contact Onboarding Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-base-300/50 backdrop-blur-sm" onClick={skipTrustedContact} />
          <div className="relative w-full max-w-sm bg-base-100 border border-base-300 rounded-2xl shadow-xl p-5 space-y-4">
            <h2 className="text-lg font-bold">Add Trusted Contact</h2>
            <p className="text-xs text-base-content/60">Add a phone we can notify (prototype SMS) during SOS.</p>
            <input type="text" value={contactName} onChange={(e)=>setContactName(e.target.value)} placeholder="Name" className="input input-bordered w-full text-sm" />
            <input type="tel" value={contactPhone} onChange={(e)=>setContactPhone(e.target.value)} placeholder="Phone (+91...)" className="input input-bordered w-full text-sm" />
            <div className="flex gap-2 justify-end pt-2">
              <button className="btn btn-ghost btn-sm" onClick={skipTrustedContact}>Skip</button>
              <button className="btn btn-primary btn-sm" disabled={!contactName.trim() || !contactPhone.trim()} onClick={addTrustedContact}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoStat({ label, val, color = '' }) {
  return (
    <div className={`px-2 py-1 rounded-md border border-base-300 bg-base-100 flex items-center gap-1 ${color}`}>
      <span className="font-semibold">{label}</span>
      <span className="text-base-content/60">{val}</span>
    </div>
  );
}

function LineLegend({ color, text, dashed }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="28" height="6" viewBox="0 0 28 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 3H27" stroke={color} strokeWidth="3" strokeDasharray={dashed ? '6 6' : undefined} strokeLinecap="round" />
      </svg>
      <span className="text-base-content/70">{text}</span>
    </span>
  );
}
