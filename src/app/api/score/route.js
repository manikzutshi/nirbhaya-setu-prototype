// File: src/app/api/score/route.js

import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { getFirestore, GeoPoint } from "firebase-admin/firestore";
import { distanceBetween } from "geofire-common";

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

// --- The Main API Function ---
export async function POST(request) {
  try {
    const { lat, lng } = await request.json();
    if (!lat || !lng) {
      return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
    }

    const db = getFirestore();
    const collectionRef = db.collection("crime_incidents");
    const center = [lat, lng];
    const radiusInKm = 1.5; // Standard 1.5km radius for a spot check

    // 1. Calculate the query bounds (our "box")
    const latPerKm = 1 / 110.574;
    const lngPerKm = 1 / (111.320 * Math.cos(lat * (Math.PI / 180)));
    const latDelta = radiusInKm * latPerKm;
    const lngDelta = radiusInKm * lngPerKm;

    const lowerLat = lat - latDelta;
    const upperLat = lat + latDelta;
    const lowerLng = lng - lngDelta;
    const upperLng = lng + lngDelta;

    // 2. Create the Firestore query
    const query = collectionRef
      .where("location_coords", ">", new GeoPoint(lowerLat, lowerLng))
      .where("location_coords", "<", new GeoPoint(upperLat, upperLng));
    
    const snapshot = await query.get();

    // 3. Filter for exact circular distance
    let incidentCount = 0;
    let recentIncidentCount = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data.location_coords) return; 

      const docLat = data.location_coords.latitude;
      const docLng = data.location_coords.longitude;

      const distanceInKm = distanceBetween([docLat, docLng], center);
      if (distanceInKm <= radiusInKm) {
        incidentCount++;
        // Check for "fresher" data
        if (data.data_source === "Delhi Police Scraper" || data.data_source === "User Reported") {
          recentIncidentCount++;
        }
      }
    });

    // 4. Calculate the score
    let score = 10.0; // Start with a perfect score (out of 10)
    let level = "Very Low Risk";

    // This is a simple scoring model. We can make it smarter later.
    // Each incident in the last 5 years (your CSV) reduces the score a little.
    // Each *recent* incident (scraper/user) reduces it a lot.
    score -= (incidentCount * 0.1);
    score -= (recentIncidentCount * 1.0); 
    
    if (score < 1.0) score = 1.0; // Floor at 1

    if (score < 4) level = "High Risk";
    else if (score < 7) level = "Medium Risk";
    else level = "Low Risk";

    // 5. Return the result
    return NextResponse.json({
      score: score.toFixed(1), // e.g., "7.2"
      level: level,
      incidentCount: incidentCount,
      recentIncidentCount: recentIncidentCount,
    });

  } catch (e) {
    console.error("Score check failed:", e);
    return NextResponse.json({ error: "Score check failed" }, { status: 500 });
  }
}