// server/scripts/seedAll.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker'; // <-- Yeh hai tera 'जादू'

// Apne Models import kar
import Trip from '../models/trip.js';
import Route from '../models/route.js';
import Parking from '../models/parking.js';

dotenv.config({ path: './server/.env' });
const DB = process.env.MONGODB_URL;

const seedDB = async () => {
  if (!DB) {
    console.error('MONGODB_URL not found in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(DB, {});
    console.log('DB Connection successful. FAKE data generation chalu...');

    // 1. Sab kuch saaf kar
    await Trip.deleteMany({});
    await Route.deleteMany({});
    await Parking.deleteMany({});
    console.log('Purana data delete ho gaya...');

    // 2. Naye FAKE Trips bana (Maan le 50)
    const tripsArray = [];
    for (let i = 0; i < 50; i++) {
      const newTrip = {
        name: `${faker.location.city()} Adventure`,
        description: faker.lorem.sentence(),
        longDescription: faker.lorem.paragraphs(3),
        type: faker.helpers.arrayElement(['Bus', 'Train', 'Air']),
        from: faker.location.city(),
        to: faker.location.city(),
        departureTime: faker.date.future().toLocaleTimeString(),
        arrivalTime: faker.date.future().toLocaleTimeString(),
        duration: `${faker.number.int({ min: 2, max: 10 })} Days`,
        price: faker.number.int({ min: 5000, max: 50000 }),
        image: faker.image.urlLoremFlickr({ category: 'nature' }),
        features: faker.helpers.arrayElements(['Free WiFi', 'Meals', 'Guide', 'Sightseeing'], { min: 1, max: 3 }),
        itinerary: [
          { day: "1", title: "Arrival", description: faker.lorem.sentence() },
          { day: "2", title: "Exploring", description: faker.lorem.sentence() }
        ],
        logistics: {
            meetingPoint: faker.location.streetAddress(),
            reportingTime: "08:00 AM"
        }
      };
      tripsArray.push(newTrip);
    }
    await Trip.insertMany(tripsArray);
    console.log('50 FAKE Trips database mein daal diye!');

    // 3. Naye FAKE Routes bana (Maan le 1000)
    const routesArray = [];
    for (let i = 0; i < 1000; i++) {
      const type = faker.helpers.arrayElement(['bus', 'train', 'air']);
      const newRoute = {
        id: `${type.toUpperCase()}-${faker.string.alphanumeric(5)}`,
        name: `${faker.location.city()} to ${faker.location.city()} Express`,
        type: type,
        operator: faker.company.name(),
        amenities: faker.helpers.arrayElements(['WiFi', 'AC', 'Charging Point'], { min: 1, max: 2 }),
        estimatedArrivalTime: faker.date.future().toLocaleTimeString(),
        startPoint: faker.location.city(),
        endPoint: faker.location.city(),
        scheduleType: 'daily',
        startTime: '09:00',
        totalSeats: { default: faker.number.int({ min: 40, max: 100 }) },
        price: { default: faker.number.int({ min: 500, max: 3000 }) }
      };
      routesArray.push(newRoute);
    }
    await Route.insertMany(routesArray);
    console.log('1000 FAKE Routes database mein daal diye!');
    
    // ... Aise hi Parking ke liye bhi kar sakta hai ...

    console.log('--- FAKE Database Seeding Complete! ---');

  } catch (error) {
    console.error('Error seeding database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('DB Disconnected.');
  }
};

seedDB();