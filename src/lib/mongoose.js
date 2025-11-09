import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'nirbhaya';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not set');
}

let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectMongoose() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB,
      maxPoolSize: 10,
    }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Schemas (minimal)
const ReportSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  summary: String,
  location: mongoose.Schema.Types.Mixed,
  meta: mongoose.Schema.Types.Mixed,
  hash: String,
  createdAt: { type: Date, index: true },
});

const PassSchema = new mongoose.Schema({
  passId: { type: String, unique: true, index: true },
  student: String,
  until: String,
  reason: String,
  status: { type: String, index: true },
  createdAt: { type: Date, index: true },
  decidedAt: Date,
});

const FeedbackSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  comment: String,
  location: { type: [Number], index: '2d' }, // [lat, lng]
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  createdAt: { type: Date, index: true },
});

const CrimeIncidentSchema = new mongoose.Schema({
  source: { type: String, index: true }, // 'csv' | 'user_report'
  originalCaseNumber: String,
  crimeTypes: [String],
  counts: {
    murder: Number,
    rape: Number,
    gangrape: Number,
    robbery: Number,
    theft: Number,
    assaultMurders: Number,
    sexualHarassment: Number,
  },
  totalCrime: Number,
  areaName: String,
  areaSqKm: Number,
  crimePerArea: Number,
  status: String,
  date: { type: Date, index: true },
  comments: String,
  loc: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], index: '2dsphere' } }, // [lng, lat]
  severityScore: { type: Number, index: true },
  createdAt: { type: Date, index: true },
  updatedAt: Date,
});

const CrimeCsvIncidentSchema = new mongoose.Schema({
  locationName: String,
  stats: mongoose.Schema.Types.Mixed, // { murder, rape, ... }
  totalCrime: Number,
  area: Number,
  crimePerArea: Number,
  crimeType: String,
  time: String,
  date: Date,
  investigationStatus: String,
  caseNumber: { type: String, index: true },
  comments: String,
  source: { type: String, default: 'delhi_csv' },
  loc: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], index: '2dsphere' } }, // [lng, lat]
  createdAt: { type: Date, default: Date.now }
});

export const ReportModel = mongoose.models.Report || mongoose.model('Report', ReportSchema, 'reports');
export const PassModel = mongoose.models.Pass || mongoose.model('Pass', PassSchema, 'passes');
export const FeedbackModel = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema, 'feedback');
export const CrimeIncidentModel = mongoose.models.CrimeIncident || mongoose.model('CrimeIncident', CrimeIncidentSchema, 'crime_incidents_mongo');
export const CrimeCsvIncidentModel = mongoose.models.CrimeCsvIncident || mongoose.model('CrimeCsvIncident', CrimeCsvIncidentSchema, 'crime_incidents_mongo');
