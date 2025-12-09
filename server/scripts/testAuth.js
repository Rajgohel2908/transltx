
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const testAuth = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/transitix'); // Adjust DB URL if needed
        console.log('Connected to DB');

        const testEmail = 'testpartner@example.com';
        const testPass = 'password123';

        // 1. Cleanup
        await User.deleteOne({ email: testEmail });
        console.log('Cleaned up old test user');

        // 2. Signup
        console.log('Creating user...');
        const user = await User.create({
            name: 'Test Partner',
            email: testEmail,
            password: testPass,
            role: 'partner',
            partnerDetails: {
                companyName: 'Test Co',
                contactNumber: '+919876543210',
                serviceType: 'Bus'
            }
        });
        console.log('User created with ID:', user._id);
        console.log('Hashed password in DB:', user.password);

        // 3. Login verify
        console.log('Attempting login verification...');
        const foundUser = await User.findOne({ email: testEmail }).select('+password');

        if (!foundUser) {
            console.error('User not found!');
            return;
        }

        const isMatch = await foundUser.comparePassword(testPass);
        console.log('Password match result:', isMatch);

        if (isMatch) {
            console.log('SUCCESS: Signup and Login logic is working correctly.');
        } else {
            console.error('FAILURE: Password did not match.');
        }

    } catch (err) {
        console.error('Test Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

testAuth();
