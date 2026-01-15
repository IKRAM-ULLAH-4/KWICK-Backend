import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import http from "http"; // new
import { Server } from "socket.io"; // new

import apiRoutes from "./routes/index.js";
import { handleWebhook } from "./controllers/Stripe.controller.js";
import path from "path";
import { fileURLToPath } from "url";
import userRoute from './routes/UserRoute.js'

dotenv.config();

const app = express();

// --- __dirname setup for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploads folder (for avatars, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Stripe Webhook MUST come BEFORE express.json() ---
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

// Normal middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// Mount all API routes under /api
app.use("/api", apiRoutes);
app.use("/api" , userRoute);

// Error handler (catch all)
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    const server = http.createServer(app);

    // --- SOCKET.IO ---
    const io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_ORIGIN,
        credentials: true,
      },
    });

    // Track online users
    const onlineUsers = new Map();

    io.on("connection", (socket) => {
      console.log("New socket connected:", socket.id);

      socket.on("join", (userId) => {
        onlineUsers.set(userId, socket.id);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      });

      socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        // Emit to receiver if online
        const receiverSocket = onlineUsers.get(receiverId);
        const messageData = { sender: { _id: senderId }, receiver: { _id: receiverId }, text, createdAt: new Date(), edited: false };

        if (receiverSocket) {
          io.to(receiverSocket).emit("receiveMessage", messageData);
        }

        // Emit back to sender for confirmation
        socket.emit("receiveMessage", messageData);
      });

      socket.on("editMessage", (message) => {
        const { receiverId } = message;
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) io.to(receiverSocket).emit("messageEdited", message);
        socket.emit("messageEdited", message);
      });

      socket.on("deleteMessage", ({ messageId, receiverId }) => {
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) io.to(receiverSocket).emit("messageDeleted", messageId);
        socket.emit("messageDeleted", messageId);
      });

      socket.on("disconnect", () => {
        for (let [userId, id] of onlineUsers) {
          if (id === socket.id) onlineUsers.delete(userId);
        }
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        console.log("Socket disconnected:", socket.id);
      });
    });

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
