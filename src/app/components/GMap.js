// "use client";
// import Script from "next/script";
// import { useEffect, useMemo, useRef, useState } from "react";

// const GMAPS_URL = (key) =>
//   `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=quarterly&libraries=places`;

// function loadOnce(key) {
//   if (typeof window === "undefined") return Promise.resolve();
//   if (window.google?.maps) return Promise.resolve();
//   if (window.__gmapsLoading) return window.__gmapsLoading;
//   const url = GMAPS_URL(key);
//   window.__gmapsLoading = new Promise((resolve, reject) => {
//     const s = document.createElement("script");
//     s.src = url;
//     s.async = true;
//     s.defer = true;
//     s.onload = () => resolve();
//     s.onerror = reject;
//     document.head.appendChild(s);
//   });
//   return window.__gmapsLoading;
// }

// export default function GMap({
//   center = { lat: 28.6139, lng: 77.209 },
//   zoom = 14,
//   markers = [], // [{lat,lng,label}]
//   circles = [], // [{center:{lat,lng}, radius, color, fillOpacity}]
//   polylines = [], // [{path:[{lat,lng}], strokeColor, strokeWeight, dashed}]
//   className = "w-full h-full",
//   style,
//   onReady,
// }) {
//   const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
//   const containerRef = useRef(null);
//   const mapRef = useRef(null);
//   const overlaysRef = useRef({ markers: [], circles: [], polylines: [] });
//   const [ready, setReady] = useState(false);

//   useEffect(() => {
//     let mounted = true;
//     if (!apiKey) return;
//     loadOnce(apiKey)
//       .then(() => {
//         if (!mounted) return;
//         if (!mapRef.current && containerRef.current) {
//           mapRef.current = new window.google.maps.Map(containerRef.current, {
//             center,
//             zoom,
//             mapTypeControl: false,
//             streetViewControl: false,
//             fullscreenControl: false,
//           });
//           setReady(true);
//           onReady?.(mapRef.current);
//         }
//       })
//       .catch(() => {});
//     return () => {
//       mounted = false;
//     };
//   }, [apiKey]);

//   // Center/zoom updates
//   useEffect(() => {
//     if (!ready || !mapRef.current) return;
//     mapRef.current.setCenter(center);
//     mapRef.current.setZoom(zoom);
//   }, [center, zoom, ready]);

//   // Overlays updates
//   useEffect(() => {
//     if (!ready || !mapRef.current) return;
//     const g = window.google.maps;
//     // Clear previous overlays
//     overlaysRef.current.markers.forEach((m) => m.setMap(null));
//     overlaysRef.current.circles.forEach((c) => c.setMap(null));
//     overlaysRef.current.polylines.forEach((p) => p.setMap(null));
//     overlaysRef.current = { markers: [], circles: [], polylines: [] };

//     // Markers
//     markers.forEach((m) => {
//       const marker = new g.Marker({ position: m, map: mapRef.current, title: m.label });
//       overlaysRef.current.markers.push(marker);
//     });
//     // Circles
//     circles.forEach((c) => {
//       const circle = new g.Circle({
//         map: mapRef.current,
//         center: c.center,
//         radius: c.radius ?? 120,
//         strokeColor: c.color ?? "#3b82f6",
//         strokeOpacity: 0.9,
//         strokeWeight: 2,
//         fillColor: c.color ?? "#3b82f6",
//         fillOpacity: c.fillOpacity ?? 0.18,
//       });
//       overlaysRef.current.circles.push(circle);
//     });
//     // Polylines
//     polylines.forEach((pl) => {
//       const line = new g.Polyline({
//         map: mapRef.current,
//         path: pl.path || [],
//         strokeColor: pl.strokeColor || "#22c55e",
//         strokeOpacity: 1,
//         strokeWeight: pl.strokeWeight || 4,
//         icons: pl.dashed
//           ? [
//               {
//                 icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 4 },
//                 offset: "0",
//                 repeat: "20px",
//               },
//             ]
//           : undefined,
//       });
//       overlaysRef.current.polylines.push(line);
//     });
//   }, [markers, circles, polylines, ready]);

//   if (!apiKey) {
//     return (
//       <div className={className} style={style}>
//         <div className="w-full h-full flex items-center justify-center bg-base-200 text-xs text-base-content/60">
//           Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={className} style={style}>
//       {/* The script loader is still here in case SSR wants to preload; main load uses loadOnce */}
//       <Script src={GMAPS_URL(apiKey)} strategy="afterInteractive" onError={() => {}} />
//       <div ref={containerRef} className="w-full h-full" />
//     </div>
//   );
// }

// File: src/components/GMap.js
// File: src/components/GMap.js

"use client";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";

// [MODIFIED] Added 'visualization' library for the heatmap
const GMAPS_URL = (key) =>
  `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
    key
  )}&v=quarterly&libraries=places,visualization`;

function loadOnce(key) {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();
  if (window.__gmapsLoading) return window.__gmapsLoading;
  const url = GMAPS_URL(key);
  window.__gmapsLoading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = url;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return window.__gmapsLoading;
}

export default function GMap({
  center = { lat: 28.6139, lng: 77.209 },
  zoom = 14,
  markers = [], 
  circles = [], 
  polylines = [],
  heatmapData = [], // [NEW] Prop for heatmap data
  showHeatmap = true, // [NEW] Prop to toggle heatmap
  className = "w-full h-full",
  style,
  onReady, // This is the key to fixing your page
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  // [MODIFIED] Added heatmapLayer to overlays
  const overlaysRef = useRef({ markers: [], circles: [], polylines: [], heatmapLayer: null });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!apiKey) return;
    loadOnce(apiKey)
      .then(() => {
        if (!mounted) return;
        if (!mapRef.current && containerRef.current) {
          mapRef.current = new window.google.maps.Map(containerRef.current, {
            center,
            zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });
          setReady(true);
          // onReady?.(window.google.maps); // [MODIFIED] Pass the 'google.maps' object back
          onReady?.({ map: mapRef.current, maps: window.google.maps });
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [apiKey, onReady, center, zoom]); // Added dependencies

  // Center/zoom updates
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    mapRef.current.setCenter(center);
    mapRef.current.setZoom(zoom);
  }, [center, zoom, ready]);

  // Overlays updates (Markers, Circles, Polylines)
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const g = window.google.maps;
    // Clear previous overlays
    overlaysRef.current.markers.forEach((m) => m.setMap(null));
    overlaysRef.current.circles.forEach((c) => c.setMap(null));
    overlaysRef.current.polylines.forEach((p) => p.setMap(null));
    overlaysRef.current = { ...overlaysRef.current, markers: [], circles: [], polylines: [] };

    // Markers
    markers.forEach((m) => {
      const marker = new g.Marker({ position: m, map: mapRef.current, title: m.label });
      overlaysRef.current.markers.push(marker);
    });
    // Circles
    circles.forEach((c) => {
      const circle = new g.Circle({
        map: mapRef.current,
        center: c.center,
        radius: c.radius ?? 120,
        strokeColor: c.color ?? "#3b82f6",
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: c.color ?? "#3b82f6",
        fillOpacity: c.fillOpacity ?? 0.18,
      });
      overlaysRef.current.circles.push(circle);
    });
    // Polylines
    polylines.forEach((pl) => {
      const line = new g.Polyline({
        map: mapRef.current,
        path: pl.path || [],
        strokeColor: pl.strokeColor || "#22c55e",
        strokeOpacity: 1,
        strokeWeight: pl.strokeWeight || 4,
        icons: pl.dashed
          ? [{
              icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 4 },
              offset: "0",
              repeat: "20px",
            }]
          : undefined,
      });
      overlaysRef.current.polylines.push(line);
    });
  }, [markers, circles, polylines, ready]);

  // [NEW] Heatmap updates (in its own useEffect)
  useEffect(() => {
    if (!ready || !mapRef.current || !window.google.maps.visualization) return;

    // Convert data to LatLng objects
    const heatmapLayerData = heatmapData.map(point => new window.google.maps.LatLng(point.lat, point.lng));
    
    // Clear old heatmap
    if (overlaysRef.current.heatmapLayer) {
      overlaysRef.current.heatmapLayer.setMap(null);
    }
    
    if (showHeatmap && heatmapLayerData.length > 0) {
      // Create new heatmap
      const heatmap = new window.google.maps.visualization.HeatmapLayer({
        data: heatmapLayerData,
        map: mapRef.current,
        radius: 20,
        opacity: 0.8,
        gradient: [
          "rgba(0, 255, 0, 0)",
          "rgba(0, 255, 0, 1)",
          "rgba(255, 255, 0, 1)",
          "rgba(255, 0, 0, 1)",
        ],
      });
      overlaysRef.current.heatmapLayer = heatmap;
    }
  }, [heatmapData, showHeatmap, ready]); // Re-run when data or toggle changes

  if (!apiKey) {
    return (
      <div className={className} style={style}>
        <div className="w-full h-full flex items-center justify-center bg-base-200 text-xs text-base-content/60">
          Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {/* We don't need the <Script> tag here, loadOnce handles it */}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}