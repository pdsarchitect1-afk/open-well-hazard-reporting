// Seed the database with realistic sample reports so the map + dashboard
// look alive immediately. Clears existing reports/counters first.
//
// Usage:  node scripts/seed.mjs        (reads MONGODB_URI from .env.local)
//         node scripts/seed.mjs "<mongodb-uri>"
//
// WARNING: this DELETES all existing reports. Don't run against production data.

import { MongoClient } from "mongodb";
import { readFileSync } from "node:fs";

function getUri() {
  if (process.argv[2]) return process.argv[2];
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  try {
    const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    const m = env.match(/MONGODB_URI\s*=\s*"?([^"\n]+)"?/);
    if (m) return m[1].trim();
  } catch {}
  throw new Error("MONGODB_URI not found (pass as arg or set in .env.local)");
}

const DISTRICT_CODES = {
  Pune: "PUN", Nashik: "NAS", Nagpur: "NAG", Kolhapur: "KOL",
  Solapur: "SOL", "Chhatrapati Sambhajinagar": "CSN", Mumbai: "MUM",
  Satara: "SAT",
};

const AUTH = {
  Pune: [
    { name: "Pune District Collector Office", role: "District Administration", contact: "020-26361148" },
    { name: "Zilla Parishad Pune", role: "Rural Local Body", contact: "" },
  ],
  _default: [
    { name: "District Collector Office", role: "District Administration", contact: "" },
    { name: "Tehsildar Office (Taluka)", role: "Revenue Department", contact: "" },
    { name: "Gram Panchayat / Municipal Office", role: "Local Body", contact: "" },
  ],
};

const PHOTO = (id) => ({
  url: `https://res.cloudinary.com/demo/image/upload/sample.jpg`,
  publicId: `open-well/${id}`,
});

const daysAgo = (n) => new Date(Date.now() - n * 86400000);

// [district, village, lat, lng, risk, status, daysAgo, resolvedDaysAgo|null]
const SAMPLES = [
  ["Pune", "Kasba Peth", 18.5204, 73.8567, "Critical", "Reported", 2, null],
  ["Pune", "Hadapsar", 18.5089, 73.926, "High", "In Progress", 18, null],
  ["Nashik", "Panchavati", 20.0176, 73.7898, "Critical", "Assigned", 9, null],
  ["Nagpur", "Sitabuldi", 21.1458, 79.0882, "Medium", "Resolved", 40, 12],
  ["Kolhapur", "Rajarampuri", 16.705, 74.2433, "High", "Reported", 5, null],
  ["Solapur", "Akkalkot Road", 17.6599, 75.9064, "Critical", "Work Scheduled", 22, null],
  ["Chhatrapati Sambhajinagar", "Cidco", 19.8762, 75.3433, "Medium", "Under Review", 14, null],
  ["Mumbai", "Borivali", 19.2307, 72.8567, "High", "Resolved", 55, 20],
  ["Satara", "Karad", 17.2896, 74.1817, "Low", "Reported", 1, null],
];

const uri = getUri();
const client = new MongoClient(uri);
const counters = {};

function nextId(district) {
  const code = DISTRICT_CODES[district] ?? "GEN";
  counters[code] = (counters[code] ?? 0) + 1;
  return `MH-${code}-2026-${String(counters[code]).padStart(6, "0")}`;
}

const docs = SAMPLES.map(([district, village, lat, lng, risk, status, ago, resolvedAgo], i) => {
  const createdAt = daysAgo(ago);
  const history = [{ status: "Reported", at: createdAt, by: "citizen" }];
  if (status !== "Reported") {
    history.push({ status, at: resolvedAgo != null ? daysAgo(resolvedAgo) : daysAgo(Math.max(0, ago - 3)), note: "", by: "admin" });
  }
  return {
    reportId: nextId(district),
    location: { type: "Point", coordinates: [lng, lat] },
    accuracyMeters: 10 + i,
    address: { district, village, taluka: village },
    photos: [PHOTO(i)],
    description: `Sample open well near ${village}`,
    condition: risk === "Critical" ? "Completely open" : "Partially covered",
    depth: risk === "Critical" ? ">50 ft" : "10-25 ft",
    waterPresent: i % 2 ? "Yes" : "Unknown",
    riskFactors: risk === "Critical" ? ["Near road", "Near residential area"] : ["Near farm"],
    riskLevel: risk,
    responsible: {},
    suggestedAuthorities: AUTH[district] ?? AUTH._default,
    reporter: {},
    status,
    statusHistory: history,
    supports: Math.floor(Math.random() * 12),
    createdAt,
    updatedAt: new Date(),
  };
});

try {
  await client.connect();
  const db = client.db(new URL(uri).pathname.slice(1) || "openwell");
  await db.collection("reports").deleteMany({});
  await db.collection("counters").deleteMany({});
  await db.collection("reports").insertMany(docs);
  await db.collection("reports").createIndex({ location: "2dsphere" });
  // seed counters so future real reports continue the sequence
  for (const [code, seq] of Object.entries(counters)) {
    await db.collection("counters").insertOne({ _id: `${code}-2026`, seq });
  }
  console.log(`Seeded ${docs.length} reports across ${Object.keys(counters).length} districts.`);
} finally {
  await client.close();
}
