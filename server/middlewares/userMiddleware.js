import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
import User from '../models/userModel.js';

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

import { validationResult } from 'express-validator';
function formValidation(req, res, next) {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  } else next();
}

async function isAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (user && user.is_admin) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden. Requires admin role.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error while verifying admin role.' });
  }
}

export { verifyToken, formValidation, isAdmin };
