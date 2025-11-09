// File: src/app/api/score/route.js

import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongo";
import { distanceBetween } from "geofire-common";

// --- The Main API Function ---
export async function POST(request) {
  try {
    const { lat, lng } = await request.json();
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'Missing lat/lng' }, { status: 400 });
    }

    const col = await getCollection('crime_incidents');
    const center = [lat, lng];
    const radiusInKm = 1.5;

    // GeoJSON $near query (meters)
    let docs = [];
    try {
      docs = await col.find({
        loc: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: radiusInKm * 1000
          }
        }
      }, { projection: { _id: 0, loc: 1, data_source: 1 } }).limit(2000).toArray();
    } catch (geoErr) {
      // Fallback if index/field not present: scan within rough bbox
      const latPerKm = 1 / 110.574;
      const lngPerKm = 1 / (111.320 * Math.cos(lat * (Math.PI / 180)));
      const latDelta = radiusInKm * latPerKm;
      const lngDelta = radiusInKm * lngPerKm;
      docs = await col.find({
        'location_coords.latitude': { $gte: lat - latDelta, $lte: lat + latDelta },
        'location_coords.longitude': { $gte: lng - lngDelta, $lte: lng + lngDelta }
      }, { projection: { _id: 0, location_coords: 1, data_source: 1 } }).limit(5000).toArray();
    }

    let incidentCount = 0;
    let recentIncidentCount = 0;
    for (const d of docs) {
      let docLat, docLng;
      if (d.loc) {
        [docLng, docLat] = d.loc.coordinates;
      } else if (d.location_coords) {
        docLat = d.location_coords.lat || d.location_coords.latitude;
        docLng = d.location_coords.lng || d.location_coords.longitude;
      }
      if (typeof docLat !== 'number' || typeof docLng !== 'number') continue;
      const distanceInKm = distanceBetween([docLat, docLng], center);
      if (distanceInKm <= radiusInKm) {
        incidentCount++;
        if (d.data_source === 'Delhi Police Scraper' || d.data_source === 'User Reported') {
          recentIncidentCount++;
        }
      }
    }

    let score = 10.0;
    let level = 'Very Low Risk';
    score -= incidentCount * 0.1;
    score -= recentIncidentCount * 1.0;
    if (score < 1.0) score = 1.0;
    if (score < 4) level = 'High Risk';
    else if (score < 7) level = 'Medium Risk';
    else level = 'Low Risk';

    return NextResponse.json({
      score: score.toFixed(1),
      level,
      incidentCount,
      recentIncidentCount,
      method: docs.length && docs[0].loc ? 'geo' : 'bbox'
    });
  } catch (e) {
    console.error('Score check failed:', e);
    return NextResponse.json({ error: 'Score check failed' }, { status: 500 });
  }
}