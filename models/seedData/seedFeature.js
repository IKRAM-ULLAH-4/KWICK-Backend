import Feature from "../feature.model.js";
import mongoose from "mongoose";

mongoose.connect(
  "mongodb+srv://Ikram:123@cluster0.amulycl.mongodb.net/?appName=Cluster0"
);

const featuresData = [
  {
    img: "/images/photo1.jpg",
    title: "Instant Messaging",
    text: "Stay connected...",
  },
  {
    img: "/images/photo2.jpg",
    title: "Crystal-Clear Calls",
    text: "Enjoy seamless calls...",
  },
  {
    img: "/images/photo3.jpg",
    title: "Smart Storage & Sharing",
    text: "Share files easily...",
  },
];

Feature.insertMany(featuresData)
  .then(() => console.log("Features inserted"))
  .catch((err) => console.error(err));
