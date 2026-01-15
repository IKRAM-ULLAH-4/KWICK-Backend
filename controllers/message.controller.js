// controllers/message.controller.js
import Message from "../models/message.model.js";
import LoginCredentials from "../models/LoginCredentials.js";

/**
 * GET /api/messages/:userId
 * Get conversation messages between the authenticated user and another user
 */
export const getConversation = async (req, res) => {
  try {
    const me = req.user?.id;
    const other = req.params.userId;
    if (!me) return res.status(401).json({ message: "Not authenticated" });
    if (!other) return res.status(400).json({ message: "Missing other user id" });

    const messages = await Message.find({
      $or: [
        { sender: me, receiver: other },
        { sender: other, receiver: me },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "fullName email avatar")
      .populate("receiver", "fullName email avatar");

    res.json(messages);
  } catch (err) {
    console.error("getConversation error:", err);
    res.status(500).json({
      message: "Server error retrieving conversation",
      error: err.message,
    });
  }
};

/**
 * POST /api/messages
 * Create a new message in DB
 * For real-time, server.js will handle Socket.IO emits
 */
export const createMessage = async (req, res) => {
  try {
    const senderId = req.user?.id;
    const { to, text } = req.body;
    if (!senderId) return res.status(401).json({ message: "Not authenticated" });
    if (!to || !text) return res.status(400).json({ message: "Missing fields" });

    const recipient = await LoginCredentials.findById(to);
    if (!recipient) return res.status(404).json({ message: "Recipient not found" });

    const message = new Message({
      sender: senderId,
      receiver: to,
      text,
    });
    await message.save();

    // populate both sender and receiver fields
    await message.populate([
      { path: "sender", select: "fullName email avatar" },
      { path: "receiver", select: "fullName email avatar" },
    ]);

    // Return the saved message (frontend can handle emitting via socket)
    res.status(201).json(message);
  } catch (err) {
    console.error("createMessage error:", err);
    res.status(500).json({ message: "Server error creating message", error: err.message });
  }
};

/**
 * PUT /api/messages/:id
 * Update a message
 */
export const updateMessage = async (req, res) => {
  try {
    const me = req.user?.id;
    const { id } = req.params;
    const { text } = req.body;
    if (!me) return res.status(401).json({ message: "Not authenticated" });

    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ message: "Message not found" });
    if (msg.sender.toString() !== me)
      return res.status(403).json({ message: "Not allowed to edit this message" });

    msg.text = text;
    msg.edited = true;
    await msg.save();

    await msg.populate([
      { path: "sender", select: "fullName email avatar" },
      { path: "receiver", select: "fullName email avatar" },
    ]);

    res.json(msg);
  } catch (err) {
    console.error("updateMessage error:", err);
    res.status(500).json({ message: "Server error updating message", error: err.message });
  }
};

/**
 * DELETE /api/messages/:id
 * Delete a message
 */
export const deleteMessage = async (req, res) => {
  try {
    const me = req.user?.id;
    const { id } = req.params;
    if (!me) return res.status(401).json({ message: "Not authenticated" });

    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ message: "Message not found" });
    if (msg.sender.toString() !== me)
      return res.status(403).json({ message: "Not allowed to delete this message" });

    await Message.deleteOne({ _id: id });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteMessage error:", err);
    res.status(500).json({ message: "Server error deleting message", error: err.message });
  }
};
