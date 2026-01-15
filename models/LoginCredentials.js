import mongoose from "mongoose";

const LoginCredentialsSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    avatar: { type: String },
  },
  { timestamps: true }
);

const LoginCredentials = mongoose.model(
  "LoginCredentials",
  LoginCredentialsSchema
);
export default LoginCredentials;
