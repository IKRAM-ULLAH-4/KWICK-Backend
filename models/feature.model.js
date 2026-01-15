import mongoose from "mongoose";

const featureSchema = new mongoose.Schema({
  img: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  link: { type: String, default: "" },
});

export default mongoose.model("Feature", featureSchema);
