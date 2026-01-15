import express from "express";
import jwt from "jsonwebtoken";
const router = express.Router();

// Hardcoded admin user (you can replace with DB later)
const ADMIN_USER = {
  username: "admin",
  password: "admin123",
};

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    const token = jwt.sign({ username }, process.env.ADMIN_SECRET_KEY, {
      expiresIn: "1h",
    });
    return res.json({ token });
  }
  res.status(401).json({ message: "Invalid credentials" });
});

export default router;
