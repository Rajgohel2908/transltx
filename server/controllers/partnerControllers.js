import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Partner Signup (Operator, Driver, Parking Owner)
const partnerSignup = async (req, res) => {
    try {
        const { name, email, password, phone, role, operatorDetails, driverDetails, parkingDetails } = req.body;

        // Validate role
        if (!['operator', 'driver', 'parking_owner'].includes(role)) {
            return res.status(400).json({ error: 'Invalid partner role' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Validate role-specific requirements
        if (role === 'operator') {
            if (!operatorDetails || !operatorDetails.companyName || !operatorDetails.serviceType) {
                return res.status(400).json({ error: 'Company name and service type are required for operators' });
            }
        } else if (role === 'driver') {
            if (!driverDetails || !driverDetails.vehicle_type) {
                return res.status(400).json({ error: 'Vehicle type is required for drivers' });
            }
        } else if (role === 'parking_owner') {
            if (!parkingDetails || !parkingDetails.parkingName) {
                return res.status(400).json({ error: 'Parking name is required for parking owners' });
            }
        }

        // Prepare user data
        const userData = {
            name,
            email,
            password, // Will be hashed by pre-save middleware
            phone,
            role
        };

        // Add role-specific data
        if (role === 'operator') {
            userData.operatorDetails = operatorDetails;
        } else if (role === 'driver') {
            userData.driverDetails = {
                ...driverDetails,
                isOnline: false
            };
        } else if (role === 'parking_owner') {
            userData.parkingDetails = parkingDetails;
        }

        // Create user
        const user = await User.create(userData);

        console.log('Partner created successfully:', user._id);

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'Partner registration successful',
            token,
            role: user.role,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Partner signup error:', error);
        // Better error message for validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        res.status(500).json({ error: error.message || 'Registration failed. Please try again.' });
    }
};

// Partner Login
const partnerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        // Find user and include password for verification
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if user is a partner (not regular user or admin)
        if (!['operator', 'driver', 'parking_owner'].includes(user.role)) {
            return res.status(403).json({ error: 'This login is for partners only. Please use the user login page.' });
        }

        // Verify password
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            role: user.role,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Partner login error:', error);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
};

// Get Partner Profile
const getPartnerProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        if (!['operator', 'driver', 'parking_owner'].includes(user.role)) {
            return res.status(403).json({ error: 'Access denied. Partners only.' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Get partner profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// Update Partner Profile
const updatePartnerProfile = async (req, res) => {
    try {
        const { name, phone, operatorDetails, driverDetails, parkingDetails } = req.body;

        console.log('Update request body:', JSON.stringify(req.body, null, 2));

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        console.log('Current user role:', user.role);
        console.log('Current parkingDetails:', user.parkingDetails);

        // Update common fields
        if (name) user.name = name;
        if (phone) user.phone = phone;

        // Update role-specific fields
        if (user.role === 'operator' && operatorDetails) {
            user.operatorDetails = { ...user.operatorDetails?.toObject(), ...operatorDetails };
        } else if (user.role === 'driver' && driverDetails) {
            user.driverDetails = { ...user.driverDetails?.toObject(), ...driverDetails };
        } else if (user.role === 'parking_owner' && parkingDetails) {
            // Handle nested pricing object properly
            const currentDetails = user.parkingDetails?.toObject() || {};
            console.log('Current details:', currentDetails);
            console.log('New parking details:', parkingDetails);

            // Build updated parking details preserving all fields especially location
            user.parkingDetails = {
                parkingName: parkingDetails.parkingName || currentDetails.parkingName,
                address: parkingDetails.address || currentDetails.address,
                location: currentDetails.location, // Always preserve existing location
                totalSlots: parkingDetails.totalSlots !== undefined ? parkingDetails.totalSlots : currentDetails.totalSlots,
                availableSlots: parkingDetails.availableSlots !== undefined ? parkingDetails.availableSlots : currentDetails.availableSlots,
                isOpen: parkingDetails.isOpen !== undefined ? parkingDetails.isOpen : (currentDetails.isOpen !== undefined ? currentDetails.isOpen : true),
                pricing: {
                    twoWheeler: parkingDetails.pricing?.twoWheeler !== undefined ? parkingDetails.pricing.twoWheeler : currentDetails.pricing?.twoWheeler,
                    fourWheeler: parkingDetails.pricing?.fourWheeler !== undefined ? parkingDetails.pricing.fourWheeler : currentDetails.pricing?.fourWheeler,
                    bus: parkingDetails.pricing?.bus !== undefined ? parkingDetails.pricing.bus : currentDetails.pricing?.bus
                }
            };

            console.log('Merged parkingDetails:', user.parkingDetails);
        }

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                parkingDetails: user.parkingDetails
            }
        });
    } catch (error) {
        console.error('Update partner profile error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Failed to update profile',
            details: error.message
        });
    }
};

export {
    partnerSignup,
    partnerLogin,
    getPartnerProfile,
    updatePartnerProfile
};
