import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoginCredentials",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoginCredentials",
      required: true,
    },
    text: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);
export default Message;
