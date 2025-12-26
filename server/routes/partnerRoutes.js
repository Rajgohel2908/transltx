

import express from 'express';
import {
    partnerSignup,
    partnerLogin,
    getPartnerProfile as getProfile,
    updatePartnerProfile,
    getPartnerStats,
    getPartnerBookings,
    getAllPartners,
    togglePartnerStatus
} from '../controllers/partnerController.js';
import { verifyToken as protect } from '../middlewares/userMiddleware.js';

const router = express.Router();

router.post('/signup', partnerSignup);
router.post('/login', partnerLogin);
router.get('/me', protect, getProfile);
router.patch('/me', protect, updatePartnerProfile);
router.get('/stats', protect, getPartnerStats);
router.get('/bookings', protect, getPartnerBookings);

// Admin Routes for Partner Management
// Ideally these should have an 'admin' middleware too
router.get('/admin/all', protect, getAllPartners);
router.patch('/admin/:id/status', protect, togglePartnerStatus);

// Password reset flow can reuse user flow or be duplicated if separate email templates needed
// For now, let's keep it simple

export default router;
