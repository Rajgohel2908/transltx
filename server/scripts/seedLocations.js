// server/scripts/seedLocations.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Location from '../models/location.js';

// --- Saare naye "data modules" import kar ---
import { gujaratData } from './data/gujaratLocations.js';
import { maharashtraData } from './data/maharashtraLocations.js';
import { rajasthanData } from './data/rajasthanLocations.js';
import { madhyaPradeshData } from './data/madhyaPradeshLocations.js';
import { delhiData } from './data/delhiLocations.js';
import { punjabData } from './data/punjabLocations.js';
import { karnatakaData } from './data/karnatakaLocations.js';

dotenv.config({ path: './server/.env' });
const DB = process.env.MONGODB_URL;

// --- Saare modules ko yahan 'queue' kar de ---
const statesToSeed = [
  gujaratData,
  maharashtraData,
  rajasthanData,
  madhyaPradeshData,
  delhiData,
  punjabData,
  karnatakaData
];

async function seedDB() {
  if (!DB) {
    console.error('MONGODB_URL not set in .env. "Config" missing.');
    process.exit(1);
  }

  try {
    await mongoose.connect(DB, {});
    console.log('DB Connection successful. Seeding process "initiated"...');

    // --- State-wise loop chala ---
    for (const stateData of statesToSeed) {
      if (!stateData) continue; // Safety check

      const { state, cities, trainStations, airports } = stateData;
      
      console.log(`\nProcessing state: ${state}...`);

      // Pehle uss state ka purana data 'flush' kar
      await Location.deleteMany({ state: state });
      console.log(`  > Purana data flush kiya [State: ${state}]`);

      const locationObjects = [];

      cities.forEach(name => locationObjects.push({
        name: name, state: state, type: 'city'
      }));
      trainStations.forEach(name => locationObjects.push({
        name: name, state: state, type: 'train_station'
      }));
      airports.forEach(name => locationObjects.push({
        name: name, state: state, type: 'airport'
      }));

      // 'Bulk insert' kar (per state)
      if (locationObjects.length > 0) {
        await Location.insertMany(locationObjects);
        console.log(`  > Naya data commit kiya. Total ${locationObjects.length} entries [State: ${state}]`);
      } else {
        console.log(`  > Koi data nahi mila [State: ${state}]`);
      }
    }
    // --- Loop khatam ---

    console.log('\n--- Sab states ka "data seeding" complete! ---');

  } catch (error) {
    console.error('Error seeding database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('DB Disconnected. "Process terminated".');
  }
}

seedDB();