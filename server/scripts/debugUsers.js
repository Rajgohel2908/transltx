
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkRecentUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/transitix');
        const users = await User.find({}).sort({ createdAt: -1 }).limit(5).select('+password');

        console.log(JSON.stringify(users.map(u => ({
            email: u.email,
            role: u.role,
            hasPassword: !!u.password,
            passHashPreview: u.password ? u.password.substring(0, 10) : 'N/A'
        })), null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkRecentUsers();
