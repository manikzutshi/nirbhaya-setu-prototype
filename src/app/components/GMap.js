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
  heatmapData = [],
  showHeatmap = true,
  heatmapMaxIntensity = 30, // higher threshold for red hotspots (India density)
  textLabels = [], // legacy support
  commentLabels = [], // [{id,lat,lng,text,color}]
  onCommentVote,
  onMarkerClick,
  className = "w-full h-full",
  style,
  onReady,
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  // [MODIFIED] Added heatmapLayer to overlays
  const overlaysRef = useRef({ markers: [], circles: [], polylines: [], heatmapLayer: null, textLabels: [] });
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
    markers.forEach((m, idx) => {
      const marker = new g.Marker({ position: m, map: mapRef.current, title: m.label });
      if (onMarkerClick) {
        marker.addListener('click', () => onMarkerClick(idx));
      }
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
  }, [markers, circles, polylines, ready, onMarkerClick]);

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
        radius: 26,
        opacity: 0.9,
        maxIntensity: heatmapMaxIntensity,
        gradient: [
          'rgba(0,255,0,0)',      // transparent green start
          'rgba(0,255,0,1)',      // green
          'rgba(173,255,47,1)',   // yellow-green
          'rgba(255,255,0,1)',    // yellow
          'rgba(255,200,0,1)',    // yellow-orange
          'rgba(255,165,0,1)',    // orange
          'rgba(255,140,0,1)',    // dark orange
          'rgba(255,69,0,1)',     // orange-red
          'rgba(255,0,0,1)',      // red (only very dense)
        ],
      });
      overlaysRef.current.heatmapLayer = heatmap;
    }
  }, [heatmapData, showHeatmap, ready]); // Re-run when data or toggle changes

  // [NEW] Comment label overlays showing full text above markers
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const maps = window.google.maps;
    // Clear previous comment label overlays
    if (overlaysRef.current.commentLabels) {
      overlaysRef.current.commentLabels.forEach(o => o.setMap(null));
    }
    overlaysRef.current.commentLabels = [];
    if (!commentLabels?.length) return;

    class CommentLabel extends maps.OverlayView {
      constructor(data) {
        super();
        this.data = data;
        this.div = null;
        this.pos = new maps.LatLng(data.lat, data.lng);
      }
      onAdd() {
        const d = document.createElement('div');
        d.style.position = 'absolute';
        d.style.transform = 'translate(-50%, calc(-100% - 30px))'; // above marker
        d.style.padding = '6px 10px';
        d.style.fontSize = '11px';
        d.style.lineHeight = '1.3';
        d.style.fontWeight = '500';
        d.style.color = '#fff';
        d.style.background = 'rgba(0, 0, 0, 0.75)';
        d.style.borderRadius = '6px';
        d.style.maxWidth = '200px';
        d.style.whiteSpace = 'normal';
        d.style.wordWrap = 'break-word';
        d.style.pointerEvents = 'none';
        d.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        d.style.border = `2px solid ${this.data.color}`;
        d.textContent = this.data.text;
        
        this.div = d;
        const panes = this.getPanes();
        panes.overlayLayer.appendChild(d);
      }
      draw() {
        if (!this.div) return;
        const projection = this.getProjection();
        const point = projection.fromLatLngToDivPixel(this.pos);
        if (point) {
          this.div.style.left = point.x + 'px';
          this.div.style.top = point.y + 'px';
        }
      }
      onRemove() {
        if (this.div?.parentNode) this.div.parentNode.removeChild(this.div);
        this.div = null;
      }
    }

    commentLabels.forEach(cl => {
      const overlay = new CommentLabel(cl);
      overlay.setMap(mapRef.current);
      overlaysRef.current.commentLabels.push(overlay);
    });
  }, [commentLabels, ready]);

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