import LoginCredentials from "../models/LoginCredentials.js";
import User from "../models/user.model.js";

export const deleteUser = async (req, res) => {
  try {
    console.log("Delete route hits");

    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const deletedUser = await LoginCredentials.findOneAndDelete({
      email: { $regex: `^${email.trim()}$`, $options: "i" },
    });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found from backend" });
    }

    res.json({ message: `User ${deletedUser.fullName} deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting user" });
  }
};

function makeAvatarAbsolute(req, avatarPath) {
  if (!avatarPath) return avatarPath;
  if (/^https?:\/\//i.test(avatarPath)) return avatarPath;
  const host = req.get("host");
  const protocol = req.protocol;
  return `${protocol}://${host}${avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`}`;
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await LoginCredentials.find()
      .select("_id fullName email avatar createdAt")
      .sort({ fullName: 1 });

    const mapped = users.map((u) => ({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      avatar: u.avatar ? makeAvatarAbsolute(req, u.avatar) : null,
      createdAt: u.createdAt,
    }));

    res.json(mapped);
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({
      message: "Server error while fetching users",
      error: err.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // console.log("File received:", req.file);

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const updates = {};
    if (req.body.fullName) updates.fullName = req.body.fullName;
    if (req.file) {
      // ✅ Save relative path (unique filename)
      const relativePath = `/uploads/${req.file.filename}`;
      updates.avatar = relativePath;
    }

    const user = await LoginCredentials.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const returnedUser = {
      ...user.toObject(),
      avatar: user.avatar ? makeAvatarAbsolute(req, user.avatar) : null,
    };

    res.json({ user: returnedUser, message: "Profile updated" });
  } catch (err) {
    console.error("updateProfile error:", err);
    res
      .status(500)
      .json({ message: "Server error updating profile", error: err.message });
  }
};
