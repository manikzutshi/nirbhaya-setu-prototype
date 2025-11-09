#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse';
import { connectMongoose, CrimeCsvIncidentModel } from '../src/lib/mongoose.js';

const file = process.argv[2] || path.join(process.cwd(), 'final_delhi_crime_dataset.csv');

async function run() {
  if (!fs.existsSync(file)) {
    console.error('CSV file not found:', file);
    process.exit(1);
  }
  await connectMongoose();
  console.log('Connected to MongoDB. Importing:', file);
  const parser = fs.createReadStream(file).pipe(parse({ columns: true, skip_empty_lines: true }));
  let count = 0;
  for await (const record of parser) {
    try {
      const doc = transform(record);
      await CrimeCsvIncidentModel.create(doc);
      count++;
    } catch (e) {
      console.error('Failed row:', e.message);
    }
  }
  console.log('Imported rows:', count);
  process.exit(0);
}

function num(v) {
  if (v === undefined || v === null || v === '') return undefined;
  const n = parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

function transform(r) {
  return {
    locationName: r.Location?.trim(),
    stats: {
      murder: num(r.murder),
      rape: num(r.rape),
      gangrape: num(r.gangrape),
      robbery: num(r.robbery),
      theft: num(r.theft),
      assaultMurders: num(r['assualt murders']),
      sexualHarassment: num(r['sexual harassement']),
    },
    totalCrime: num(r.totalcrime) ?? num(r['totalcrime']) ?? num(r['totalCrime']),
    area: num(r.area) ?? num(r.totarea),
    crimePerArea: num(r['crime/area']),
    crimeType: r['Crime Type']?.trim(),
    time: r.Time?.trim(),
    date: r.Date ? new Date(r.Date) : undefined,
    investigationStatus: r['Investigation Status']?.trim(),
    caseNumber: r['Case Number']?.trim(),
    comments: r.Comments?.trim(),
    loc: { type: 'Point', coordinates: [num(r.Longitude), num(r.Latitude)] },
  };
}

run().catch(e => { console.error(e); process.exit(1); });
