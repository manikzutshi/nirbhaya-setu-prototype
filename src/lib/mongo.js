import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "nirbhaya";

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment");
}

// Reuse connection across hot reloads (Next.js dev)
let client;
let clientPromise;

if (!globalThis._mongoClientPromise) {
  client = new MongoClient(uri, { maxPoolSize: 10 });
  globalThis._mongoClientPromise = client.connect();
}
clientPromise = globalThis._mongoClientPromise;

// ensure indexes once per process
let indexesEnsured = false;
async function ensureIndexes(db) {
  if (indexesEnsured) return;
  indexesEnsured = true;
  try {
    // Optional but recommended
    const reports = db.collection("reports");
    await reports.createIndex({ userId: 1, createdAt: -1 });

    const sos = db.collection("sos_events");
    await sos.createIndex({ userId: 1, createdAt: -1 });

    const passes = db.collection("passes");
    await passes.createIndex({ passId: 1 }, { unique: true });

    const breaches = db.collection("breaches");
    await breaches.createIndex({ createdAt: -1 });

    // If you migrate incidents later:
    // const incidents = db.collection("crime_incidents");
    // await incidents.createIndex({ loc: "2dsphere" });
  } catch (e) {
    console.warn("Mongo index ensure skipped:", e?.message || e);
  }
}

export async function getDb() {
  const client = await clientPromise;
  const db = client.db(dbName);
  await ensureIndexes(db);
  return db;
}

export async function getCollection(name) {
  const db = await getDb();
  return db.collection(name);
}
