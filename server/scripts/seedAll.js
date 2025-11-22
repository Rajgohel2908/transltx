// server/scripts/seedAll.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import Models
import Trip from '../models/trip.js';
import Route from '../models/route.js';
import Parking from '../models/parking.js';
import Location from '../models/location.js';

// Import Location Data
import { gujaratData } from './data/gujaratLocations.js';
import { maharashtraData } from './data/maharashtraLocations.js';
import { rajasthanData } from './data/rajasthanLocations.js';
import { madhyaPradeshData } from './data/madhyaPradeshLocations.js';
import { delhiData } from './data/delhiLocations.js';
import { punjabData } from './data/punjabLocations.js';
import { karnatakaData } from './data/karnatakaLocations.js';

// Import Other Data
import { tripsData } from './data/trips.js';
import { routesData } from './data/routes.js';
import { parkingData } from './data/parking.js';

// --- FIX: Path hata diya, ab ye current folder se .env uthayega ---
dotenv.config(); 

const DB = process.env.MONGODB_URL;

// --- Helper Functions ---
const pickRandom = (arr) => {
  if (!arr || arr.length === 0) return 'N/A';
  return arr[Math.floor(Math.random() * arr.length)];
};

const pickRandomPair = (arr) => {
  if (!arr || arr.length < 2) return ['A', 'B'];
  let a = pickRandom(arr);
  let b = pickRandom(arr);
  // Ensure start and end are different
  while (a === b) {
    b = pickRandom(arr);
  }
  return [a, b];
};
// -------------------------

const seedDB = async () => {
  if (!DB) {
    console.error('❌ MONGODB_URL not found in .env. Config missing.');
    console.error('👉 Tip: Make sure you are running this from the "server" directory where .env exists.');
    process.exit(1);
  }

  try {
    await mongoose.connect(DB, {});
    console.log('✅ DB Connection successful.');

    // 1. CLEAR OLD DATA
    console.log('\n🧹 Cleaning up old data...');
    await Location.deleteMany({});
    await Trip.deleteMany({});
    await Route.deleteMany({});
    await Parking.deleteMany({});
    console.log('✨ All collections cleared.');

    // 2. SEED LOCATIONS
    console.log('\n📍 Seeding Locations...');
    const statesToSeed = [gujaratData, maharashtraData, rajasthanData, madhyaPradeshData, delhiData, punjabData, karnatakaData];
    const locationDocs = [];
    
    for (const stateData of statesToSeed) {
      if (!stateData) continue;
      stateData.cities.forEach(name => locationDocs.push({ name, state: stateData.state, type: 'city' }));
      stateData.trainStations.forEach(name => locationDocs.push({ name, state: stateData.state, type: 'train_station' }));
      stateData.airports.forEach(name => locationDocs.push({ name, state: stateData.state, type: 'airport' }));
    }

    if (locationDocs.length > 0) {
      await Location.insertMany(locationDocs);
      console.log(`✅ ${locationDocs.length} Locations seeded.`);
    }

    // 3. SEED TRIPS
    console.log('\n🎒 Seeding Trips...');
    await Trip.insertMany(tripsData);
    console.log(`✅ ${tripsData.length} Trips seeded.`);

    // 4. SEED ROUTES
    console.log('\n🛣️  Seeding Routes...');
    await Route.insertMany(routesData);
    console.log(`✅ ${routesData.length} Routes seeded.`);

    // 5. SEED PARKING
    console.log('\n🅿️  Seeding Parking...');
    await Parking.insertMany(parkingData);
    console.log(`✅ ${parkingData.length} Parking lots seeded.`);

    console.log('\n🎉 --- REAL DATABASE SEEDING COMPLETE --- 🎉');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 DB Disconnected.');
  }
};

seedDB();