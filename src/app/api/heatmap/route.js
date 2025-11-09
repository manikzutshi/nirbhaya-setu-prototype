// File: src/app/api/heatmap/route.js

import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

// --- Initialize Firebase Admin (only once) ---
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (e) {
    console.error('Firebase init failed (heatmap):', e.message);
  }
}

// --- The Main API Function ---
export async function GET() {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('crime_incidents').get();
    const heatmapData = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.location_coords) {
        heatmapData.push({
          lat: data.location_coords.latitude,
          lng: data.location_coords.longitude,
        });
      }
    });
    return NextResponse.json(heatmapData);
  } catch (e) {
    console.error('Heatmap data fetch failed:', e);
    return NextResponse.json({ error: 'Failed to fetch heatmap data' }, { status: 500 });
  }
}