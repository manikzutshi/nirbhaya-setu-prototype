#!/usr/bin/env node
/*
 * One-time CSV ingestion + transform into crime_incidents_mongo collection.
 * Usage: node scripts/ingest_crime_csv.js ./data/final_delhi_crime_dataset.csv
 */
const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('csv-parse/sync');
const { MongoClient } = require('mongodb');

// Lightweight .env loader to read .env.local / .env if present (no extra deps)
function loadEnvFile(p) {
  try {
    if (!fs.existsSync(p)) return;
    const text = fs.readFileSync(p, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue;
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let v = m[2];
      // strip surrounding quotes
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith('\'') && v.endsWith('\''))) {
        v = v.slice(1, -1);
      }
      if (!(m[1] in process.env)) process.env[m[1]] = v;
    }
  } catch {}
}
loadEnvFile(path.join(process.cwd(), '.env.local'));
loadEnvFile(path.join(process.cwd(), '.env'));

function toNum(v) { if (v === undefined || v === null || v === '') return 0; const n = Number(v); return isNaN(n) ? 0 : n; }

function computeSeverity(row) {
  return toNum(row.murder)*5 + toNum(row.rape)*4 + toNum(row.gangrape)*4 + toNum(row.robbery)*3 + toNum(row.theft)*1 + toNum(row['sexual harassement'])*2;
}

function extractCrimeTypes(row) {
  const map = [
    ['murder','murder'],
    ['rape','rape'],
    ['gangrape','gangrape'],
    ['robbery','robbery'],
    ['theft','theft'],
    ['sexual harassement','sexualHarassment']
  ];
  return map.filter(([col]) => toNum(row[col]) > 0).map(([,name]) => name);
}

async function run(csvPath) {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'nirbhaya';
  if (!uri) {
    console.error('MONGODB_URI is not set');
    process.exit(2);
  }
  const client = new MongoClient(uri, { maxPoolSize: 5 });
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection('crime_incidents_mongo');
  const raw = fs.readFileSync(csvPath, 'utf8');
  const records = parse(raw, { columns: true, skip_empty_lines: true });
  const now = new Date();
  const batch = [];
  for (const r of records) {
    const doc = {
      source: 'csv',
      originalCaseNumber: r['Case Number'] || null,
      crimeTypes: extractCrimeTypes(r),
      counts: {
        murder: toNum(r.murder),
        rape: toNum(r.rape),
        gangrape: toNum(r.gangrape),
        robbery: toNum(r.robbery),
        theft: toNum(r.theft),
        assaultMurders: toNum(r['assualt murders']),
        sexualHarassment: toNum(r['sexual harassement']),
      },
      totalCrime: toNum(r.totalcrime),
      areaName: r.Location || r.area || null,
      areaSqKm: toNum(r.area),
      crimePerArea: toNum(r['crime/area']),
      status: r['Investigation Status'] || null,
      date: r.Date ? new Date(r.Date) : null,
      comments: r.Comments || null,
      loc: { type: 'Point', coordinates: [toNum(r.Longitude), toNum(r.Latitude)] },
      severityScore: computeSeverity(r),
      createdAt: now,
      updatedAt: now,
    };
    batch.push(doc);
  }
  if (batch.length) {
    await col.insertMany(batch, { ordered: false });
    console.log(`Inserted ${batch.length} crime incident docs.`);
    // Ensure indexes
    await col.createIndex({ loc: '2dsphere' });
    await col.createIndex({ date: -1 });
    await col.createIndex({ severityScore: -1 });
    console.log('Indexes ensured.');
  } else {
    console.log('No rows parsed.');
  }
  await client.close();
  process.exit(0);
}

if (process.argv.length < 3) {
  console.error('CSV path required');
  process.exit(1);
}
run(path.resolve(process.argv[2]));
