// File: src/app/api/heatmap/route.js

import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

// --- Initialize Firebase Admin ---
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error.message);
  }
}

const db = getFirestore();
const collectionRef = db.collection("crime_incidents");

// --- The Main API Function ---
export async function GET(request) {
  // Lazily get DB to avoid init errors
  const db = getFirestore();
  const collectionRef = db.collection("crime_incidents");

  try {
    const snapshot = await collectionRef.get();
    
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
    console.error("Heatmap data fetch failed:", e);
    return NextResponse.json({ error: "Failed to fetch heatmap data" }, { status: 500 });
  }
}