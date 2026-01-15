// middleware/adminAuth.js
import jwt from "jsonwebtoken";

export const adminAuth = (req, res, next) => {
  try {
    const token = req.headers["x-admin-token"]; // frontend sends this

    if (!token) {
      return res
        .status(401)
        .json({ message: "Admin authentication required" });
    }

    const decoded = jwt.verify(token, process.env.ADMIN_SECRET_KEY);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired admin token" });
  }
};
