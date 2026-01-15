import jwt from "jsonwebtoken";

const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "token";

export default function auth(req, res, next) {
  try {
    let token;
    if (req.cookies && req.cookies[COOKIE_NAME])
      token = req.cookies[COOKIE_NAME];
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") token = parts[1];
    }
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
