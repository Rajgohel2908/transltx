import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Route from '../models/route.js'; // Tera model path check kar lena
import generateRoutes from './data/routes.js'; // Maine pichli baar function diya tha, usko import kar rahe hain

// --- Config Load ---
dotenv.config(); 
const DB = process.env.MONGODB_URL;

const seedRoutesOnly = async () => {
  if (!DB) {
    console.error('❌ Syntax Error: .env file missing ya MONGODB_URL set nahi hai!');
    process.exit(1);
  }

  try {
    // 1. Connection
    await mongoose.connect(DB);
    console.log('✅ DB Connection Successful (Hackerman mode on).');

    // 2. Data Preparation
    // Note: Agar tune meri pichli script use ki hai toh wo function export kar rahi thi.
    // Hum usse call karke fresh data generate kar rahe hain.
    console.log('🔄 Generating Route Data...');
    const routesData = generateRoutes(); 

    // 3. Seeding (NO DELETE)
    // Yahan maine deleteMany() hata diya hai as per your request.
    console.log(`\n🛣️  Appending ${routesData.length} Routes to existing data...`);
    
    // Ordered: false ka matlab agar ek data fail ho (duplicate ID), toh baaki rukenge nahi, insert hote rahenge.
    await Route.insertMany(routesData, { ordered: false });
    
    console.log(`✅ Routes Added Successfully!`);

  } catch (error) {
    if (error.code === 11000) {
      console.warn('⚠️  Warning: Kuch routes skip ho gaye kyunki wo IDs already exist karti thi (Duplicate Key).');
      console.log('✅ Baaki unique routes add ho gaye hain.');
    } else {
      console.error('❌ Error seeding routes:', error.message);
    }
  } finally {
    await mongoose.disconnect();
    console.log('👋 DB Disconnected. Kaam khatam.');
  }
};

seedRoutesOnly();