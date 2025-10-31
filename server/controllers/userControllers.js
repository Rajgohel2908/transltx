import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
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
  console.log('Attempting login for email:', email);

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    console.log('Login failed: User not found for email:', email);
    return res.status(401).json({ error: "Invalid email or password" });
  }
  console.log('User found:', user.email);

  const match = await user.comparePassword(password);
  if (!match) {
    console.log('Login failed: Password mismatch for user:', user.email);
    return res.status(401).json({ error: "Invalid email or password" });
  }
  console.log('Password matched for user:', user.email);

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });
  console.log('Token generated for user:', user.email);

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

export { userSignup, userLogin, getAllUsers, updateUserAdminStatus };
