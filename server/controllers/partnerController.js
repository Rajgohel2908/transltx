
import Partner from "../models/partnerModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// ---------------------- PARTNER CONTROLLERS ----------------------

async function partnerSignup(req, res) {
    console.log("Partner Signup Request (Separate Collection):", JSON.stringify(req.body, null, 2));
    try {
        const { name, password, partnerDetails } = req.body;
        const email = req.body.email?.toLowerCase();

        // Check if email exists in either User or Partner collection to enforce unique emails across system
        const existingUser = await User.findOne({ email });
        const existingPartner = await Partner.findOne({ email });


        if (existingUser || existingPartner) {
            console.log("Signup Failed: Email already exists:", email);
            return res.status(400).json({ error: "Email already exists" });
        }

        // Check SINGLETON constraint for Train operators (IRCTC only)
        if (partnerDetails?.serviceType === 'Train') {
            const existingTrainOperator = await Partner.findOne({ "partnerDetails.serviceType": "Train" });
            if (existingTrainOperator) {
                return res.status(403).json({
                    error: "Registration Rejected: Only one Train Operator is allowed (IRCTC)."
                });
            }
        }

        // Create new Partner
        console.log("Creating Partner in 'partners' collection...");
        const partner = await Partner.create({
            name,
            email,
            password,
            partnerDetails
        });

        console.log("Partner Created Successfully:", partner._id);

        const token = jwt.sign({ id: partner._id, role: 'partner' }, JWT_SECRET, { expiresIn: "30d" });

        res.status(201).json({ message: "Partner account created", token });
    } catch (error) {
        console.error("Partner Signup Error TRACE:", error);
        res.status(500).json({ error: "Server error during partner signup.", details: error.message });
    }
}

async function partnerLogin(req, res) {
    const { password } = req.body;
    const email = req.body.email?.toLowerCase();

    console.log('Attempting PARTNER login for:', email);

    // Find partner in Partner collection
    const partner = await Partner.findOne({ email }).select("+password");

    if (!partner) {
        console.log('Partner login failed: User not found in Partner DB');
        return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await partner.comparePassword(password);
    if (!match) {
        console.log('Partner login failed: Password mismatch');
        return res.status(401).json({ error: "Invalid email or password" });
    }

    console.log('Partner login successful');
    const token = jwt.sign({ id: partner._id, role: 'partner' }, JWT_SECRET, { expiresIn: "30d" });

    res.status(200).json({ token });
}

async function getPartnerProfile(req, res) {
    try {
        const partner = await Partner.findById(req.userId);
        if (!partner) return res.status(404).json({ error: "Partner not found" });
        res.json(partner);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
}


// Import models needed for stats
import Route from "../models/route.js";
import Booking from "../models/Booking.js";


async function getPartnerStats(req, res) {
    try {
        const partnerId = req.userId;

        // 1. Get all routes for this partner
        const routes = await Route.find({ partner: partnerId });
        const routeIds = routes.map(r => r._id);

        // 2. Get all CONFIRMED bookings for these routes
        const bookings = await Booking.find({
            routeId: { $in: routeIds },
            bookingStatus: 'Confirmed' // Only confirmed bookings count towards revenue
        });

        // 3. Calculate Total Earnings
        const totalEarnings = bookings.reduce((sum, b) => sum + (b.fare || 0), 0);


        const { range = '7d' } = req.query;
        let startDate = new Date();
        let groupBy = 'day';

        if (range === '1m') {
            startDate.setDate(startDate.getDate() - 30);
        } else if (range === '3m') {
            startDate.setDate(startDate.getDate() - 90);
        } else if (range === 'lifetime') {
            startDate = new Date(0); // Beginning of time
            groupBy = 'month'; // Aggregate by month for lifetime to avoid clutter
        } else {
            // Default 7d
            startDate.setDate(startDate.getDate() - 7);
        }

        // 4. Generate Graph Data
        let revenueGraph = [];

        if (range === 'lifetime') {
            // Group by Month for Lifetime
            const monthlyData = {};
            bookings.forEach(b => {
                const d = new Date(b.createdAt);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
                if (!monthlyData[key]) monthlyData[key] = 0;
                monthlyData[key] += (b.fare || 0);
            });

            // Convert to array and key by readable date
            revenueGraph = Object.keys(monthlyData).sort().map(key => {
                const [year, month] = key.split('-');
                const dateObj = new Date(year, month - 1);
                return {
                    date: dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                    revenue: monthlyData[key]
                };
            });

        } else {
            // Group by Day for 7d, 1m, 3m
            // Generate all dates in range to ensure continuity (0 revenue for empty days)
            const dates = [];
            let current = new Date(startDate);
            const end = new Date();

            while (current <= end) {
                dates.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }

            revenueGraph = dates.map(dateStr => {
                const dailyRevenue = bookings
                    .filter(b => b.createdAt.toISOString().split('T')[0] === dateStr)
                    .reduce((sum, b) => sum + (b.fare || 0), 0);

                const dateObj = new Date(dateStr);
                return {
                    date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    revenue: dailyRevenue
                };
            });
        }

        // 5. Get Recent Activity (Last 5 bookings)
        const recentBookings = await Booking.find({
            routeId: { $in: routeIds },
            bookingStatus: { $in: ['Confirmed', 'Pending'] }
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('routeId', 'name type');

        res.json({
            totalEarnings,
            totalRoutes: routes.length,
            totalBookings: bookings.length,
            revenueGraph,
            recentBookings
        });

    } catch (error) {
        console.error("Partner Stats Error:", error);
        res.status(500).json({ error: "Server error fetching stats" });
    }
}

async function getPartnerBookings(req, res) {
    try {
        const partnerId = req.userId;

        // 1. Get all routes
        const routes = await Route.find({ partner: partnerId });
        const routeIds = routes.map(r => r._id);

        // 2. Get all bookings
        const bookings = await Booking.find({
            routeId: { $in: routeIds }
        })
            .sort({ createdAt: -1 })
            .populate('routeId', 'name type startPoint endPoint startTime')
            .populate('userId', 'name email');

        res.json({ bookings });

    } catch (error) {
        console.error("Partner Booking List Error:", error);
        res.status(500).json({ error: "Server error fetching bookings" });
    }
}


// --- Admin Functions for Partner Management ---
async function getAllPartners(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const partners = await Partner.find()
            .select('-password') // Exclude password
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalPartners = await Partner.countDocuments();

        res.json({
            partners,
            currentPage: page,
            totalPages: Math.ceil(totalPartners / limit),
            totalPartners
        });
    } catch (error) {
        console.error("Get All Partners Error:", error);
        res.status(500).json({ error: "Server error fetching partners" });
    }
}

async function togglePartnerStatus(req, res) {
    try {
        const { id } = req.params;
        const partner = await Partner.findById(id);

        if (!partner) {
            return res.status(404).json({ error: "Partner not found" });
        }

        partner.is_frozen = !partner.is_frozen;
        await partner.save();

        res.json({ message: `Partner ${partner.is_frozen ? 'frozen' : 'activated'} successfully`, partner });
    } catch (error) {
        console.error("Toggle Partner Status Error:", error);
        res.status(500).json({ error: "Server error updating partner status" });
    }
}

export { partnerSignup, partnerLogin, getPartnerProfile, getPartnerStats, getPartnerBookings, getAllPartners, togglePartnerStatus };

