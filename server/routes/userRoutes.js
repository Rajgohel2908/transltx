import express from 'express';
import { userSignup, userLogin, getAllUsers, updateUserAdminStatus } from '../controllers/userControllers.js';
import { body, validationResult } from 'express-validator';
import { formValidation, verifyToken, isAdmin } from '../middlewares/userMiddleware.js';

const router = express.Router();


router.post('/signup', [
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], formValidation, userSignup);


router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], formValidation, userLogin);


// Auth check
import User from '../models/userModel.js';
router.get('/me', verifyToken, async (req, res) => {
  // userMiddleware will set req.userId
  const user = await User.findById(req.userId);
  res.json(user);
});

// Admin route to get all users
router.get('/admin/users', verifyToken, isAdmin, getAllUsers);
// Admin route to update a user's admin status
router.patch('/admin/users/:userId', verifyToken, isAdmin, updateUserAdminStatus);


export default router;