// src/server.js
import express from "express";
import dotenv from "dotenv";

import { initDB } from "./db/dbManager.js";
import authRoutes from "./routes/authRoutes.js";
import gmailRoutes from "./routes/gmailRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

// middlewares
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") res.sendStatus(200);
  else next();
});

// test route
app.get("/", (req, res) => {
  res.json({ message: "Kairo API is running 🚀" });
});

// auth routes
app.use("/auth", authRoutes);

// Gmail + AI routes
app.use("/gmail", gmailRoutes);
app.use("/ai", aiRoutes);

// start server with auto-fallback DB
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`✅ Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Server startup error:", err);
    process.exit(1);
  }
};

startServer();
