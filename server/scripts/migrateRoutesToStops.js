/**
 * Migration script to convert existing Route documents to the new schema
 * - Convert stops: [String] -> stops: [{ stopName, priceFromStart, estimatedTimeAtStop }]
 * - Ensure operator, amenities, estimatedArrivalTime exist with reasonable defaults
 *
 * Usage:
 *   NODE_ENV=production node server/scripts/migrateRoutesToStops.js
 *
 * Make sure MONGO_URI is set in the environment or update the script below.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Route from '../models/route.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/transltx';

async function migrate() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB:', MONGO_URI);

  const routes = await Route.find({});
  console.log(`Found ${routes.length} routes.`);

  let updated = 0;

  for (const route of routes) {
    let changed = false;
    const doc = route.toObject();

    // Normalize stops
    if (Array.isArray(doc.stops) && doc.stops.length > 0) {
      const firstIsString = typeof doc.stops[0] === 'string';
      if (firstIsString) {
        const newStops = doc.stops.map(s => ({
          stopName: String(s),
          priceFromStart: 0,
          estimatedTimeAtStop: ''
        }));
        route.stops = newStops;
        changed = true;
      } else {
        // Ensure each stop has required fields
        const normalized = doc.stops.map(s => ({
          stopName: s.stopName || s.name || '',
          priceFromStart: (typeof s.priceFromStart === 'number') ? s.priceFromStart : (s.price || 0),
          estimatedTimeAtStop: s.estimatedTimeAtStop || s.time || ''
        }));
        route.stops = normalized;
        changed = true;
      }
    } else if (!Array.isArray(doc.stops) || doc.stops.length === 0) {
      // if no stops but startPoint/endPoint exist, inject start/end
      if (doc.startPoint || doc.endPoint) {
        route.stops = [];
        changed = true;
      }
    }

    // Ensure operator
    if (!route.operator) {
      route.operator = route.name || 'Unknown Operator';
      changed = true;
    }

    // Ensure amenities array
    if (!Array.isArray(route.amenities)) {
      route.amenities = [];
      changed = true;
    }

    // Ensure estimatedArrivalTime
    if (!route.estimatedArrivalTime) {
      route.estimatedArrivalTime = route.endTime || '';
      changed = true;
    }

    if (changed) {
      try {
        await route.save();
        updated++;
        console.log(`Updated route ${route._id}`);
      } catch (err) {
        console.error(`Failed to update route ${route._id}:`, err.message);
      }
    }
  }

  console.log(`Migration complete. Updated ${updated} routes.`);
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
