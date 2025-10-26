import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Route from '../models/route.js';
import Trip from '../models/trip.js';
import Ride from '../models/ride.js';
import User from '../models/userModel.js';

dotenv.config();
const DB = process.env.MONGODB_URL;

const hardcodedRoutes = [];

async function loadRoutesFromFiles() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const routeDataPromises = files
    .filter(file =>
      (file.startsWith('seed') && (file.endsWith('Cities.js') || file.endsWith('Islands.js'))) &&
      file !== 'seedAll.js'
    )
    .map(async (file) => {
      const modulePath = path.join(__dirname, file);
      const module = await import(pathToFileURL(modulePath).href);
      return module.routeData;
    });

  const routesFromFiles = await Promise.all(routeDataPromises);
  return routesFromFiles;
}


const trips = [];

async function run() {
  if (!DB) {
    console.error('MONGODB_URL not set in .env');
    process.exit(1);
  }

  await mongoose.connect(DB, {});

  console.log('Seeding script is clean. No data was seeded.');
  await mongoose.disconnect();
}

run().catch(async err => {
  console.error('Seed error:', err);
  await mongoose.disconnect();
  process.exit(1);
});
