import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';
import { connectMongoose, CrimeIncidentModel } from '@/lib/mongoose';

const googleMapsClient = new Client({});

function decodePolyline(encoded) {
  let points = []; let index = 0, len = encoded.length; let lat = 0, lng = 0;
  while (index < len) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    let dlat = (result & 1) ? ~(result >> 1) : (result >> 1); lat += dlat; shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    let dlng = (result & 1) ? ~(result >> 1) : (result >> 1); lng += dlng;
    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

async function pointRisk(lat, lng) {
  await connectMongoose();
  const docs = await CrimeIncidentModel.aggregate([
    { $geoNear: { near: { type: 'Point', coordinates: [lng, lat] }, distanceField: 'distance', spherical: true, maxDistance: 750 } },
    { $limit: 500 },
    { $project: { severityScore: 1, source: 1 } }
  ]).exec();
  let severity = 0;
  for (const d of docs) severity += (d.severityScore || 0);
  return severity; // raw severity sum around point
}

export async function POST(request) {
  try {
    const { origin, destination } = await request.json();
    const directionsResponse = await googleMapsClient.directions({
      params: { origin: origin + ', Delhi', destination: destination + ', Delhi', mode: 'driving', alternatives: true, key: process.env.GOOGLE_MAPS_API_KEY }
    });
    if (!directionsResponse.data.routes.length) return NextResponse.json({ error: 'No routes' }, { status: 404 });
    const analyzed = [];
    for (const route of directionsResponse.data.routes) {
      const path = decodePolyline(route.overview_polyline.points);
      let totalSeverity = 0;
      for (let i = 0; i < path.length; i += 10) {
        const p = path[i];
        totalSeverity += await pointRisk(p.lat, p.lng);
      }
      analyzed.push({
        path,
        meta: {
          eta: route.legs[0].duration.text,
            distance: route.legs[0].distance.text,
            severity: totalSeverity,
        }
      });
    }
    // Normalize severity to risk score 1-10 (higher severity -> higher risk score)
    const vals = analyzed.map(r => r.meta.severity);
    const max = Math.max(...vals); const min = Math.min(...vals); const range = max - min || 1;
    analyzed.forEach(r => { const scaled = (r.meta.severity - min)/range; r.meta.risk = (1 + scaled * 9).toFixed(1); });
    const leg0 = directionsResponse.data.routes[0].legs[0];
    return NextResponse.json({ origin, destination, fastest: analyzed[0], safest: [...analyzed].sort((a,b)=>a.meta.risk-b.meta.risk)[0], start_location: leg0.start_location, end_location: leg0.end_location, start_address: leg0.start_address, end_address: leg0.end_address, source: 'mongo' });
  } catch (e) {
    console.error('Mongo route plan failed:', e);
    return NextResponse.json({ error: 'Planning failed' }, { status: 500 });
  }
}
