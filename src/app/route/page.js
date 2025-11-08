// File: src/app/plan/page.js

"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import GMap from "../components/GMap";

export default function RoutePlannerPage() {
  // --- State Variables ---
  const [activeTab, setActiveTab] = useState("route"); // "route" or "check"
  
  // Route Planner State
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);
  const [routePlan, setRoutePlan] = useState(null);
  const [routeStatus, setRouteStatus] = useState("");

  // Safety Check State
  const [checkLocation, setCheckLocation] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [checkStatus, setCheckStatus] = useState("");

  // Map State
  const [heatmapData, setHeatmapData] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [markers, setMarkers] = useState([]);
  
  // Google Maps API State
  // const [gMaps, setGMaps] = useState(null);
  const [mapInstance, setMapInstance] = useState(null); // <-- RENAMED
  const [geocoder, setGeocoder] = useState(null);

  // Input Refs
  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const checkInputRef = useRef(null); // [NEW] For the safety check input

  // --- 1. Data Fetching on Load ---
  useEffect(() => {
    // Only fetches heatmap data once on load
    async function fetchHeatmapData() {
      try {
        const res = await fetch("/api/heatmap");
        const data = await res.json();
        if (data.error) {
          console.error("Failed to fetch heatmap data:", data.error);
        } else {
          setHeatmapData(data);
          console.log(`Loaded ${data.length} heatmap points.`);
        }
      } catch (e) {
        console.error("Error fetching heatmap:", e);
      }
    }
    fetchHeatmapData();
  }, []);

  // --- 2. Google Map "onReady" Callback ---
  // This is where we initialize all the Google APIs
function onMapReady({ map, maps }) { // <-- RECEIVES THE OBJECT
  setMapInstance(map); // <-- SAVE THE MAP INSTANCE
  setGeocoder(new maps.Geocoder()); // <-- Create geocoder

  const delhiBounds = new maps.LatLngBounds(
    new maps.LatLng(28.4, 76.8),
    new maps.LatLng(28.9, 77.3)
  );

  // Setup Origin Autocomplete
  if (originInputRef.current) {
    const autocomplete = new maps.places.Autocomplete(originInputRef.current, {
      componentRestrictions: { country: "in" },
    });
    autocomplete.setBounds(delhiBounds);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      setOrigin(place.formatted_address || place.name || "");
    });
  }

  // Setup Destination Autocomplete
  if (destinationInputRef.current) {
    const autocomplete = new maps.places.Autocomplete(destinationInputRef.current, {
      componentRestrictions: { country: "in" },
    });
    autocomplete.setBounds(delhiBounds);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      setDestination(place.formatted_address || place.name || "");
    });
  }

  // Setup Safety Check Autocomplete
  if (checkInputRef.current) {
    const autocomplete = new maps.places.Autocomplete(checkInputRef.current, {
      componentRestrictions: { country: "in" },
    });
    autocomplete.setBounds(delhiBounds);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      setCheckLocation(place.formatted_address || place.name || "");
    });
  }

  // [FIX] Setup Click-to-Score, listening to 'map'
  maps.event.addListener(map, 'click', (mapsMouseEvent) => {
    const latLng = mapsMouseEvent.latLng;
    setActiveTab("check");
    setRoutePlan(null);
    fetchAndShowScore(latLng.lat(), latLng.lng(), "Clicked Location");
  });
}

  // --- 3. Route Planning Functions ---
  async function handlePlanRoute() {
    if (!origin || !destination) {
      setRouteStatus("Please enter both start and end points.");
      return;
    }
    setRouteLoading(true);
    setRoutePlan(null);
    setMarkers([]);
    setScoreResult(null); // Clear score result
    setRouteStatus("1. Finding routes from Google...");

    try {
      const res = await fetch("/api/route/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination }),
      });
      
      if (!res.ok) throw new Error(`API failed with status ${res.status}`);
      
      setRouteStatus("2. Analyzing route safety...");
      const data = await res.json();
      
      if (data.error) {
        setMarkers([]);
        setRouteStatus(`Error: ${data.error}`);
      } else {
        setRoutePlan(data);
        setMarkers([
          { lat: data.start_location.lat, lng: data.start_location.lng, label: "Start" },
          { lat: data.end_location.lat, lng: data.end_location.lng, label: "End" }
        ]);
        setRouteStatus("Fastest (Red), Safest (Green)");
      }
    } catch (error) {
      console.error("Failed to plan route:", error);
      setRouteStatus("Failed to plan route. Check console.");
    } finally {
      setRouteLoading(false);
    }
  }

  // --- 4. Safety Check Functions ---

  // [NEW] This function is called by the "Check Score" button
  async function handleCheckScore() {
    if (!checkLocation) {
      setCheckStatus("Please enter a location to check.");
      return;
    }
    setCheckLoading(true);
    setScoreResult(null);
    setMarkers([]);
    setRoutePlan(null); // Clear route plan
    setCheckStatus(`1. Finding "${checkLocation}"...`);

    if (!geocoder) {
      setCheckStatus("Error: Geocoder not ready. Please wait.");
      setCheckLoading(false);
      return;
    }

    // Geocode the address
    try {
      const { results } = await geocoder.geocode({ address: checkLocation + ", Delhi" });
      if (results && results[0]) {
        const location = results[0].geometry.location;
        const name = results[0].formatted_address.split(',')[0];
        // Now call the score function
        await fetchAndShowScore(location.lat(), location.lng(), name);
      } else {
        setCheckStatus(`Could not find "${checkLocation}".`);
      }
    } catch (error) {
      console.error("Geocode error:", error);
      setCheckStatus("Error finding location.");
    } finally {
      setCheckLoading(false);
    }
  }

  // [NEW] This is the main function for getting a score
  async function fetchAndShowScore(lat, lng, name) {
    setCheckLoading(true); // Show loading on the button
    setCheckStatus("2. Analyzing safety score...");
    setRoutePlan(null); // Clear old routes
    
    // Set a pin on the map
    setMarkers([{ lat, lng, label: name }]);
    if (mapInstance) {
  mapInstance.panTo({ lat, lng });
  mapInstance.setZoom(15);
}

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });
      if (!res.ok) throw new Error("API failed to get score");

      const data = await res.json();
      setScoreResult({ ...data, name }); // Save the result
      setCheckStatus("Score calculated.");

    } catch (error) {
      console.error("Failed to get score:", error);
      setCheckStatus("Error calculating score.");
      setScoreResult(null);
    } finally {
      setCheckLoading(false);
    }
  }

  // --- 5. Current Location Function ---
  function getCurrentLocation() {
    if (!geocoder) {
      alert("Map is still loading, please try again in a second.");
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
          geocoder.geocode({ location: pos }, (results, status) => {
            if (status === "OK" && results[0]) {
              setOrigin(results[0].formatted_address);
            } else {
              alert("Could not find address for your location.");
            }
          });
        },
        () => { alert("Error: The Geolocation service failed."); }
      );
    } else {
      alert("Your browser doesn't support geolocation.");
    }
  }

  // --- 6. Render the Page ---
  return (
    <div className="w-full min-h-screen bg-base-100 pt-6 pb-24">
      <div className="mx-auto w-full max-w-[1100px] px-4 md:px-6 lg:grid lg:grid-cols-12 lg:gap-10">
        
        {/* LEFT: Inputs Panel */}
        <div className="lg:col-span-5 xl:col-span-4">
          
          {/* [NEW] Tab Buttons */}
          <div role="tablist" className="tabs tabs-boxed">
            <a 
              role="tab" 
              className={`tab ${activeTab === 'route' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('route')}
            >
              Route Planner
            </a>
            <a 
              role="tab" 
              className={`tab ${activeTab === 'check' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('check')}
            >
              Safety Check
            </a>
          </div>
          
          {/* [NEW] Route Planner Tab Content */}
          <div className={`mt-4 grid grid-cols-1 gap-3 ${activeTab !== 'route' ? 'hidden' : ''}`}>
            <label className="input input-bordered flex items-center gap-2">
              <PinIcon className="text-primary" />
              <input
                ref={originInputRef}
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Origin (e.g., Current Location)"
                className="grow bg-transparent outline-none w-60"
              />
              <button
                onClick={getCurrentLocation}
                title="Use current location"
                className="p-1 text-gray-500 hover:text-blue-600"
              >
                <LocationIcon />
              </button>
            </label>
            <label className="input input-bordered flex items-center gap-2">
              <FlagIcon className="text-success" />
              <input
                ref={destinationInputRef}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Destination (e.g., City Center)"
                className="grow bg-transparent outline-none w-60"
              />
            </label>
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={handlePlanRoute} disabled={routeLoading}>
                {routeLoading ? "Planning…" : "Plan Route"}
              </button>
            </div>
            <p className="text-sm text-base-content/60 mt-2 h-5">{routeStatus}</p>
            {routePlan && (
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <InfoPill label="Fastest" value={`${routePlan.fastest.meta.eta} | ${routePlan.fastest.meta.distance}`} color="text-error" />
                <InfoPill label="Safest" value={`${routePlan.safest.meta.eta} | ${routePlan.safest.meta.distance}`} color="text-success" />
              </div>
            )}
          </div>

          {/* [NEW] Safety Check Tab Content */}
          <div className={`mt-4 grid grid-cols-1 gap-3 ${activeTab !== 'check' ? 'hidden' : ''}`}>
            <p className="text-sm text-base-content/60">Search for a location or click on the map.</p>
            <label className="input input-bordered flex items-center gap-2">
              <LocationIcon className="text-primary" />
              <input
                ref={checkInputRef}
                value={checkLocation}
                onChange={(e) => setCheckLocation(e.target.value)}
                placeholder="Enter a location to check"
                className="grow bg-transparent outline-none w-60"
              />
            </label>
            <div className="flex gap-2">
              <button className="btn btn-success" onClick={handleCheckScore} disabled={checkLoading}>
                {checkLoading ? "Checking..." : "Check Score"}
              </button>
            </div>
            <p className="text-sm text-base-content/60 mt-2 h-5">{checkStatus}</p>
            
            {/* [NEW] Safety Score Result Box */}
            {scoreResult && (
              <div className="mt-2 p-4 rounded-lg bg-base-200 border border-base-300">
                <h3 className="text-lg font-bold">{scoreResult.name}</h3>
                <p className={`text-2xl font-bold ${
                  scoreResult.level === 'High Risk' ? 'text-error' : 
                  scoreResult.level === 'Medium Risk' ? 'text-warning' : 'text-success'
                }`}>
                  {scoreResult.level} (Score: {scoreResult.score}/10)
                </p>
                <p className="text-sm text-base-content/70 mt-2">
                  Based on {scoreResult.incidentCount} total incidents in the area.
                </p>
                <p className="text-sm text-base-content/70">
                  Includes {scoreResult.recentIncidentCount} recent (scraped/user) reports.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT: Map */}
        <aside className="mt-10 lg:mt-0 lg:col-span-7 xl:col-span-8">
          <div className="rounded-xl overflow-hidden shadow border border-base-300 bg-base-100" style={{ height: 360 }}>
            <GMap
              zoom={11}
              center={{ lat: 28.6139, lng: 77.2090 }}
              heatmapData={heatmapData}
              showHeatmap={showHeatmap}
              polylines={routePlan ? [
                { path: routePlan.fastest.path, strokeColor: '#ef4444', strokeWeight: 5, dashed: true },
                { path: routePlan.safest.path, strokeColor: '#22c55e', strokeWeight: 5 }
              ] : []}
              markers={markers}
              onReady={onMapReady}
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <Legend color="#ef4444" text="Fastest (High Risk)" dashed />
              <Legend color="#22c55e" text="Safest (Low Risk)" />
              {routePlan?.safest?.meta?.risk && (
                <span className="font-medium text-base-content/70">Risk: {routePlan.safest.meta.risk}/10</span>
              )}
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-base-content/70">Show Heatmap</span>
              <input 
                type="checkbox" 
                className="toggle toggle-sm" 
                checked={showHeatmap} 
                onChange={() => setShowHeatmap(!showHeatmap)} 
              />
            </label>
          </div>
        </aside>
      </div>
    </div>
  );
}

// --- Helper Components (No changes below) ---

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
function LocationIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${className}`}>
      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041A11.962 11.962 0 0012 2.5a11.962 11.962 0 00-1.42 19.851zM12 17.5a5.5 5.5 0 100-11 5.5 5.5 0 000 11z" clipRule="evenodd" />
    </svg>
  );
}