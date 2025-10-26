import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

const DB = process.env.MONGODB_URL;

// --- Argument Parsing ---
const args = process.argv.slice(2);
const command = args[0]; // --create, --promote, --demote
const email = args[1];
const password = args[2];
const name = args[3];

function printUsage() {
  console.error('Usage:');
  console.error('  To create/update an admin: node scripts/manageUser.js --create <email> <password> [name]');
  console.error('  To promote a user:         node scripts/manageUser.js --promote <email>');
  console.error('  To demote a user:          node scripts/manageUser.js --demote <email>');
  process.exit(1);
}

async function run() {
  if (!DB) {
    console.error('MONGODB_URL not set in .env');
    process.exit(1);
  }

  if (!command || !email) {
    printUsage();
  }

  await mongoose.connect(DB, {});

  let user = await User.findOne({ email }).select('+password');

  switch (command) {
    case '--create':
      if (!password) {
        console.error('Error: Password is required for --create.');
        printUsage();
      }
      const newName = name || 'Admin User';
      if (user) {
        user.name = newName;
        user.password = password; // The model's pre-save hook will hash it
        user.is_admin = true;
        await user.save();
        console.log(`Successfully updated user "${email}" to be an admin.`);
      } else {
        user = await User.create({ name: newName, email, password, is_admin: true });
        console.log(`Successfully created new admin user "${email}".`);
      }
      console.log('Credentials:\n  email: %s\n  password: %s', email, password);
      break;

    case '--promote':
    case '--demote':
      if (!user) {
        console.error(`Error: User with email "${email}" not found.`);
        process.exit(1);
      }
      const makeAdmin = command === '--promote';
      user.is_admin = makeAdmin;
      await user.save();
      console.log(`Successfully ${makeAdmin ? 'promoted' : 'demoted'} user "${email}". New admin status: ${user.is_admin}`);
      break;

    default:
      console.error(`Error: Unknown command "${command}".`);
      printUsage();
  }

  process.exit(0);
}

run().catch(err => { console.error('Error:', err.message || err); process.exit(1); });