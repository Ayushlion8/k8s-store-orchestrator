require("dotenv").config();

const express = require("express");
const cors = require("cors");
const storesRouter = require("./api/stores");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check (for demo + k8s readiness later)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API Routes
app.use("/api", storesRouter);

// Global Error Handler (clean production touch)
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Orchestrator running on port ${PORT}`);
});
