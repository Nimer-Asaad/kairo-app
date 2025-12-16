// src/routes/taskRoutes.js
import express from "express";
import Task from "../models/Task.js";
import auth from "../middleware/auth.js";
import mongoose from "mongoose";

const router = express.Router();

// Create new task
router.post("/", auth, async (req, res) => {
  try {
    const {
      project_id,
      assigned_to,
      contributors,
      team_lead,
      title,
      description,
      due_date,
      status,
      priority,
    } = req.body;

    // Normalize assigned_to: if array provided take first as primary assigned_to
    let assignedToFinal = assigned_to;
    if (Array.isArray(assigned_to)) {
      assignedToFinal = assigned_to[0];
    } else if (
      !assignedToFinal &&
      Array.isArray(contributors) &&
      contributors.length
    ) {
      assignedToFinal = contributors[0];
    }

    // If provided, convert to ObjectId where appropriate (safe)
    const taskDoc = new Task({
      project_id: project_id ? project_id : undefined,
      assigned_to: assignedToFinal ? assignedToFinal : undefined,
      assigned_by: req.user.id, // from auth middleware
      title,
      description,
      due_date,
      status: status || "in_progress",
      priority,
      // If you want to store contributors/team_lead in schema, extend Task model accordingly
    });

    await taskDoc.save();

    res.status(201).json({
      message: "Task created successfully",
      task: taskDoc,
    });
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// GET /api/tasks  -> returns all tasks (manager/admin)
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({})
      .populate("assigned_to", "_id full_name email")
      .populate("assigned_by", "_id full_name email")
      // do NOT populate project_id (no Project model), return as-is
      .lean();

    res.json({ tasks });
  } catch (err) {
    console.error("List tasks error:", err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// GET /api/tasks/my -> returns tasks assigned to the authenticated user
router.get("/my", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find tasks where assigned_to equals userId OR assigned_to is an array that includes userId
    // (If your schema stores assigned_to as single ObjectId, the first condition is enough)
    const tasks = await Task.find({
      $or: [{ assigned_to: userId }, { assigned_to: { $in: [userId] } }],
    })
      .populate("assigned_to", "_id full_name email")
      .populate("assigned_by", "_id full_name email")
      .lean();

    res.json({ tasks });
  } catch (err) {
    console.error("Get my tasks error:", err);
    res.status(500).json({ message: "Failed to fetch your tasks" });
  }
});

export default router;
