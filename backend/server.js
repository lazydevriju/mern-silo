const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const fileRoutes = require("./routes/fileRoutes");
const shareRoutes = require("./routes/shareRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

// health route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Silo backend running" });
});

// routes
app.use("/api/files", fileRoutes);    // GET /api/files
app.use("/api/share", shareRoutes);   // POST /api/share
app.use("/silo", shareRoutes);        // GET /silo/download/:token

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Silo backend listening on port ${PORT}`);
  });
}

start();
