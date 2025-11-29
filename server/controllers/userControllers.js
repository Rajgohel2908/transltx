import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

async function userSignup(req, res) {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ error: "Email already exists" });

  // The pre-save hook in userModel.js will automatically hash the password
  const user = await User.create({ name, email, password });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });

  res.status(201).json({ message: "User created", token });
}

async function userLogin(req, res) {
  const { email, password } = req.body;
  // console.log('Attempting login for email:', email);

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    // console.log('Login failed: User not found for email:', email);
    return res.status(401).json({ error: "Invalid email or password" });
  }
  // console.log('User found:', user.email);

  const match = await user.comparePassword(password);
  if (!match) {
    // console.log('Login failed: Password mismatch for user:', user.email);
    return res.status(401).json({ error: "Invalid email or password" });
  }
  // console.log('Password matched for user:', user.email);

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });
  // console.log('Token generated for user:', user.email);

  res.status(200).json({ token });
}

async function getAllUsers(req, res) {
  try {
    // Fetch all users and the total count in parallel for efficiency
    const [users, totalUsers] = await Promise.all([
      User.find({}).select('-password').sort({ createdAt: -1 }), // Fetch all users, sorted, excluding password
      User.countDocuments() // Get the total number of users
    ]);

    res.status(200).json({ users, totalUsers });
  } catch (error) {
    res.status(500).json({ error: "Server error while fetching users." });
  }
}

async function updateUserAdminStatus(req, res) {
  try {
    const { userId } = req.params;
    const { is_admin } = req.body;

    if (typeof is_admin !== 'boolean') {
      return res.status(400).json({ error: 'is_admin must be a boolean.' });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { is_admin }, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Server error while updating user.' });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ error: "User not found with this email" });
  }

  // Reset Token Generate kar (User Model mein method banana padega, niche dekh)
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Frontend ka URL (Reset page ka link)
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  const message = `You requested a password reset. Please go to this link to reset your password:\n\n${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ error: "Email could not be sent" });
  }
}

// 2. Reset Password Controller
async function resetPassword(req, res) {
  // Token ko hash karke compare kar
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }, // Check kar token expire toh nahi hua
  });

  if (!user) {
    return res.status(400).json({ error: "Invalid Token or Token Expired" });
  }

  // Password update kar
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
  res.status(200).json({ success: true, token });
}

// Exports update kar
export { userSignup, userLogin, getAllUsers, updateUserAdminStatus, forgotPassword, resetPassword };