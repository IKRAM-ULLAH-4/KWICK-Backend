import mongoose from "mongoose";

const StepSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  color: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

export default mongoose.model("Step", StepSchema);
