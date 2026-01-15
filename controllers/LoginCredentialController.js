// controllers/auth.controller.js

import LoginCredentials from "../models/LoginCredentials.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import dotenv from 'dotenv'
dotenv.config();

const COOKIE_NAME = process.env.JWT_COOKIE_NAME;
// console.log(COOKIE_NAME);

// Hardcoded: 1 hour cookie lifetime
const COOKIE_MAX_AGE = 60 * 60 * 1000; // 1 hour in ms

export const createCredentials = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password)
      return res.status(400).json({ message: "Missing required fields" });

    const existing = await LoginCredentials.findOne({ email });
    if (existing)
      return res.status(200).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new LoginCredentials({
      fullName,
      email,
      password: hashed,
      avatar: "/uploads/Default.jpg",
    });

    await newUser.save();

    // Generate token using external helper
    const token = generateToken({ id: newUser._id, email: newUser.email });
console.log(token);

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: COOKIE_MAX_AGE,
    });

    res.status(201).json({
      message: "User created",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Error saving user" });
  }
};

export const getLoginCredentials = async (req, res) => {
  try {
    console.log("Hit shO");
    
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing email or password" });

    const user = await LoginCredentials.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken({ id: user._id, email: user.email });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: COOKIE_MAX_AGE,
    });

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.json({ message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    const user = await LoginCredentials.findById(req.user.id).select(
      "-password"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("Get current user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const searchUsersByEmail = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") return res.json([]);

    const users = await LoginCredentials.find({
      email: { $regex: q, $options: "i" },
    }).select("-password");

    res.json(users);
  } catch (error) {
    console.error("Search email error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
