import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },

  // Stripe Premium fields
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date, default: null },

}, { timestamps: true });

export default mongoose.models.User ||
  mongoose.model("User", UserSchema, "login credentials");
