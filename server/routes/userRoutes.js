import express from 'express';
import { 
  userSignup, 
  userLogin, 
  getAllUsers, 
  updateUserAdminStatus,
  forgotPassword, // New Controller
  resetPassword   // New Controller
} from '../controllers/userControllers.js';
import { body } from 'express-validator';
import { formValidation, verifyToken, isAdmin } from '../middlewares/userMiddleware.js';
import User from '../models/userModel.js'; // Import User model for /me route

const router = express.Router();

// 1. Signup Route
router.post('/signup', [
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], formValidation, userSignup);

// 2. Login Route
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], formValidation, userLogin);

// 3. Forgot Password Route
router.post('/forgot-password', forgotPassword);

// 4. Reset Password Route
router.put('/reset-password/:resetToken', resetPassword);

// 5. Auth Check (Get Current User)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 6. Admin: Get all users
router.get('/admin/users', verifyToken, isAdmin, getAllUsers);

// 7. Admin: Update user status
router.patch('/admin/users/:userId', verifyToken, isAdmin, updateUserAdminStatus);

export default router;