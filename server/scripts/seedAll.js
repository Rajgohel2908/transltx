// server/scripts/seedAll.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

// Saare 'data models' import kar
import Trip from '../models/trip.js';
import Route from '../models/route.js';
import Parking from '../models/parking.js';
import Location from '../models/location.js'; // <-- Yeh hai 'game changer'

dotenv.config({ path: './server/.env' });
const DB = process.env.MONGODB_URL;

// --- Helper Functions ---
const pickRandom = (arr) => {
  if (!arr || arr.length === 0) return 'N/A';
  return arr[Math.floor(Math.random() * arr.length)];
};

const pickRandomPair = (arr) => {
  let a = pickRandom(arr);
  let b = pickRandom(arr);
  while (a === b) {
    b = pickRandom(arr);
  }
  return [a, b];
};
// -------------------------

const seedDB = async () => {
  if (!DB) {
    console.error('MONGODB_URL not found in .env. "Config" missing.');
    process.exit(1);
  }

  try {
    await mongoose.connect(DB, {});
    console.log('DB Connection successful. "Seeding dependencies" fetch kar raha hoon...');

    // --- YEH HAI NAYA STEP: Asli locations fetch kar ---
    const cities = await Location.find({ type: 'city' }).distinct('name');
    const trainStations = await Location.find({ type: 'train_station' }).distinct('name');
    const airports = await Location.find({ type: 'airport' }).distinct('name');
    
    console.log(`  > ${cities.length} cities loaded.`);
    console.log(`  > ${trainStations.length} train stations loaded.`);
    console.log(`  > ${airports.length} airports loaded.`);
    // -------------------------------------------------

    // 1. Sab kuch saaf kar
    await Trip.deleteMany({});
    await Route.deleteMany({});
    await Parking.deleteMany({});
    console.log('Purana data (Trips, Routes, Parking) "flush" ho gaya...');

    // 2. Naye FAKE Trips bana (Maan le 50)
    const tripsArray = [];
    for (let i = 0; i < 20; i++) {
      const [tripFrom, tripTo] = pickRandomPair(cities); // <-- Asli cities use kar
      // server/scripts/seedAll.js

      // ... (existing code)
      const newTrip = {
        name: `${tripFrom.split('(')[0]} Adventure`,
        description: faker.lorem.sentence(),
        longDescription: faker.lorem.paragraphs(3),
        // ... (existing properties)
        price: faker.number.int({ min: 5000, max: 50000 }),
        image: faker.image.urlLoremFlickr({ category: 'nature' }),
        features: faker.helpers.arrayElements(['Free WiFi', 'Meals', 'Guide', 'Sightseeing'], { min: 1, max: 3 }),
        
        // --- YEH DATA MISSING THA ---
        inclusions: faker.helpers.arrayElements(['Accommodation', 'Breakfast & Dinner', 'Local Transport', 'Guide Fees'], { min: 2, max: 4 }),
        exclusions: faker.helpers.arrayElements(['Flights', 'Lunch', 'Personal Expenses', 'Anything not mentioned'], { min: 1, max: 3 }),
        whatToCarry: faker.helpers.arrayElements(['Trekking Shoes', 'Warm Clothes', 'Water Bottle', 'First-aid Kit'], { min: 2, max: 4 }),
        // -----------------------------

        itinerary: [
          { day: "1", title: `Arrival in ${tripTo}`, description: faker.lorem.sentence() },
          { day: "2", title: "Exploring", description: faker.lorem.sentence() }
        ],
        logistics: {
            meetingPoint: `Main square in ${tripFrom}`,
            reportingTime: "08:00 AM"
        }
      };
      tripsArray.push(newTrip);
    }
    await Trip.insertMany(tripsArray);
    console.log(`${tripsArray.length} FAKE Trips database mein 'pushed'!`);

    // 3. Naye FAKE Routes bana (Maan le 1000)
    const routesArray = [];
    for (let i = 0; i < 200; i++) {
      const type = faker.helpers.arrayElement(['bus', 'train', 'air']);
      
      let locationList, priceData, seatsData, operator;

      if (type === 'bus' && cities.length >= 2) {
        locationList = cities;
        operator = faker.company.name() + " Travels";
        priceData = { default: faker.number.int({ min: 300, max: 1500 }) };
        seatsData = { default: faker.number.int({ min: 40, max: 80 }) };
      } else if (type === 'train' && trainStations.length >= 2) {
        locationList = trainStations;
        operator = "Indian Railways";
        priceData = {
          Sleeper: faker.number.int({ min: 400, max: 2000 }),
          AC: faker.number.int({ min: 1000, max: 4000 }),
          'First Class': faker.number.int({ min: 3000, max: 7000 })
        };
        seatsData = {
          Sleeper: faker.number.int({ min: 100, max: 300 }),
          AC: faker.number.int({ min: 50, max: 150 }),
          'First Class': faker.number.int({ min: 20, max: 50 })
        };
      } else if (type === 'air' && airports.length >= 2) {
        locationList = airports;
        operator = faker.company.name() + " Airlines";
        priceData = {
          Economy: faker.number.int({ min: 2500, max: 8000 }),
          Business: faker.number.int({ min: 9000, max: 20000 })
        };
        seatsData = {
          Economy: faker.number.int({ min: 100, max: 200 }),
          Business: faker.number.int({ min: 10, max: 40 })
        };
      } else {
        continue; // Agar uss type ke locations nahi hain toh 'iteration' skip kar
      }
      
      const [routeFrom, routeTo] = pickRandomPair(locationList);

      const newRoute = {
        id: `${type.toUpperCase()}-${faker.string.alphanumeric(5)}`,
        name: `${routeFrom.split('(')[0]} to ${routeTo.split('(')[0]} Express`,
        type: type,
        operator: operator,
        amenities: faker.helpers.arrayElements(['WiFi', 'AC', 'Charging Point', 'Food'], { min: 1, max: 3 }),
        estimatedArrivalTime: faker.date.future().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        startPoint: routeFrom,
        endPoint: routeTo,
        scheduleType: 'daily',
        startTime: faker.date.future().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        totalSeats: seatsData, //
        price: priceData, //
        airline: type === 'air' ? operator : undefined,
        flightNumber: type === 'air' ? faker.string.alphanumeric(6).toUpperCase() : undefined
      };
      routesArray.push(newRoute);
    }
    await Route.insertMany(routesArray);
    console.log(`${routesArray.length} FAKE Routes database mein 'pushed'!`);
    
    // 4. Naye FAKE Parking lots bana (Maan le 20)
    const parkingArray = [];
    for (let i = 0; i < 20; i++) {
        const total = faker.number.int({min: 50, max: 500});
        const available = faker.number.int({min: 0, max: total});
        parkingArray.push({
            name: `${pickRandom(cities)} Central Parking`,
            location: faker.location.streetAddress(),
            totalSlots: total,
            availableSlots: available,
            rates: { //
                car: faker.number.int({min: 20, max: 100}),
                bus: faker.number.int({min: 50, max: 200}),
                bike: faker.number.int({min: 10, max: 40})
            }
        });
    }
    await Parking.insertMany(parkingArray);
    console.log(`${parkingArray.length} FAKE Parking Lots database mein 'pushed'!`);

    console.log('--- FAKE Database Seeding Complete! "Data integrity" maintained. ---');

  } catch (error) {
    console.error('Error seeding database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('DB Disconnected. "Process terminated".');
  }
};

seedDB();