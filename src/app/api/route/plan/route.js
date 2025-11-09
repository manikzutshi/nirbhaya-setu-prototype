// File: src/app/api/route/plan/route.js

import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongo";
import { Client } from "@googlemaps/google-maps-services-js";
import { distanceBetween } from "geofire-common";


// --- Initialize Google Maps Client ---
const googleMapsClient = new Client({});

// --- Helper Function: Get Risk at a Point ---
const getRiskAtPoint = async (lat, lng) => {
  const col = await getCollection('crime_incidents');
  const radiusInKm = 0.75;
  // Try geo query first
  try {
    const docs = await col.find({
      loc: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusInKm * 1000
        }
      }
    }, { projection: { _id: 0, loc: 1 } }).limit(1000).toArray();
    return docs.length; // Simple count of nearby incidents
  } catch (e) {
    // Fallback bbox scan
    const latPerKm = 1 / 110.574;
    const lngPerKm = 1 / (111.320 * Math.cos(lat * (Math.PI / 180)));
    const latDelta = radiusInKm * latPerKm;
    const lngDelta = radiusInKm * lngPerKm;
    const docs = await col.find({
      'location_coords.latitude': { $gte: lat - latDelta, $lte: lat + latDelta },
      'location_coords.longitude': { $gte: lng - lngDelta, $lte: lng + lngDelta }
    }, { projection: { _id: 0, location_coords: 1 } }).limit(3000).toArray();
    let count = 0;
    for (const d of docs) {
      const dLat = d.location_coords?.lat || d.location_coords?.latitude;
      const dLng = d.location_coords?.lng || d.location_coords?.longitude;
      if (typeof dLat !== 'number' || typeof dLng !== 'number') continue;
      const dist = distanceBetween([dLat, dLng], [lat, lng]);
      if (dist <= radiusInKm) count++;
    }
    return count;
  }
};

// --- Helper Function: Decode Google's Polyline ---
function decodePolyline(encoded) {
  // ... (Same decodePolyline function as before)
  let points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

// --- The Main API Function ---
export async function POST(request) {
  try {
    const { origin, destination } = await request.json();

    // 1. Get REAL routes from Google Maps Directions API
    const directionsResponse = await googleMapsClient.directions({
      params: {
        origin: origin + ", Delhi",
        destination: destination + ", Delhi",
        mode: "driving",
        alternatives: true,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (directionsResponse.data.routes.length === 0) {
      return NextResponse.json({ error: "No routes found" }, { status: 404 });
    }

    // 2. Analyze each route's risk
    const analyzedRoutes = [];
    for (const route of directionsResponse.data.routes) {
      let totalRouteRisk = 0;
      const path = decodePolyline(route.overview_polyline.points);
      for (let i = 0; i < path.length; i += 10) {
        const point = path[i];
        const riskAtThisPoint = await getRiskAtPoint(point.lat, point.lng);
        totalRouteRisk += riskAtThisPoint;
      }
      analyzedRoutes.push({
        path: path,
        meta: {
          eta: route.legs[0].duration.text,
          distance: route.legs[0].distance.text,
          risk: totalRouteRisk, // This is the raw risk score
        },
      });
    }

    // [NEW] Normalize the risk score to be 1-10
    const riskScores = analyzedRoutes.map(r => r.meta.risk);
    const maxRisk = Math.max(...riskScores);
    const minRisk = Math.min(...riskScores);

    // Avoid division by zero if all routes have the same risk
    const riskRange = maxRisk - minRisk;
    
    analyzedRoutes.forEach(route => {
      let normalizedRisk = 1; // Safest possible score is 1
      if (riskRange > 0) {
        // Scale risk from 0 to 1
        const scaledRisk = (route.meta.risk - minRisk) / riskRange;
        // Scale from 1 to 10
        normalizedRisk = 1 + scaledRisk * 9;
      } else if (maxRisk > 0) {
        // All routes have same risk, but it's not zero
        normalizedRisk = 5;
      }
      // Update the meta object with the new score
      route.meta.risk = normalizedRisk.toFixed(1); // e.g., "7.2"
    });

    // 3. Find the "fastest" and "safest"
    const fastest = analyzedRoutes[0];
    const safest = [...analyzedRoutes].sort((a, b) => a.meta.risk - b.meta.risk)[0];
    
// 4. Send the data back in the format the frontend expects
    // [MODIFIED] We now also send back the start/end coordinates and addresses
    
    // Get the main leg of the fastest route to find start/end points
    const leg = directionsResponse.data.routes[0].legs[0];

    return NextResponse.json({ 
      origin, 
      destination, 
      fastest: fastest, 
      safest: safest,
      // [NEW] Add the start and end data
      start_location: leg.start_location, // This is a {lat, lng} object
      end_location: leg.end_location,     // This is a {lat, lng} object
      start_address: leg.start_address,   // This is a string
      end_address: leg.end_address      // This is a string
    });

  } catch (e) {
    console.error("Route planning failed:", e);
    return NextResponse.json({ error: "Planning failed", details: e.message }, { status: 500 });
  }
}