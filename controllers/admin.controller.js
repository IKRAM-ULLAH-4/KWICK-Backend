import jwt from "jsonwebtoken";

export const adminLogin = (req, res) => {
  const { username, password } = req.body;

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ role: "admin" }, process.env.ADMIN_SECRET_KEY, {
    expiresIn: "1h",
  });

  res.json({ token });
};
