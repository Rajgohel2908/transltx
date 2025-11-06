import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Location from '../models/location.js';

dotenv.config({ path: './server/.env' }); // Make sure .env path is correct

const DB = process.env.MONGODB_URL;

const gujaratLocations = {
  state: "Gujarat",
  cities: [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar',
    'Junagadh', 'Gandhinagar', 'Nadiad', 'Anand', 'Mehsana', 'Bharuch',
    'Porbandar', 'Navsari', 'Veraval', 'Palanpur', 'Valsad', 'Vapi',
    'Gondal', 'Amreli', 'Godhra',
    'Ahmedabad Airport (AMD)', 'Surat Airport (STV)', 'Vadodara Airport (BDQ)',
    'Rajkot Airport (RAJ)', 'Ahmedabad Station (ADI)', 'Surat Station (ST)',
    'Vadodara Station (BRC)'
  ]
};

// Add more states here
// const maharashtraLocations = { ... };

async function seedDB() {
  if (!DB) {
    console.error('MONGODB_URL not set in .env');
    process.exit(1);
  }

  await mongoose.connect(DB, {});
  console.log('DB Connection successful');

  try {
    // Gujarat
    await Location.findOneAndUpdate(
      { state: gujaratLocations.state },
      gujaratLocations,
      { upsert: true, new: true } // 'upsert: true' se ya update karega ya naya bana dega
    );
    console.log('Gujarat locations seeded successfully.');

  } catch (error) {
    console.error('Error seeding locations:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('DB Disconnected');
  }
}

seedDB();