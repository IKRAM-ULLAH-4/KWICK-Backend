import express from "express";
import {
  getSteps,
  createStep,
  updateStep,
  deleteStep,
} from "../controllers/step.contoller.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// Public route
router.get("/", getSteps);

// Admin routes
router.post("/", adminAuth, createStep);
router.put("/:id", adminAuth, updateStep);
router.delete("/:id", adminAuth, deleteStep);

export default router;
