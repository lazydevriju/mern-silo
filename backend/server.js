import express from "express";
import http from "http";
import { Server } from "socket.io";
import chokidar from "chokidar";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import fileRoutes from "./routes/fileRoutes.js"; 
import shareRoutes from "./routes/shareRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const BASE_DIR = process.env.BASE_DIR;

// Build origins
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const clean = (str) => str?.replace(/\/+$/, "");

const allowedOrigins = [
  clean(FRONTEND_URL),
  clean(PUBLIC_BASE_URL),
].filter(Boolean);

console.log("Allowed CORS Origins:", allowedOrigins);

// Global CORS
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(clean(origin))) return cb(null, true);

      console.log("❌ Blocked by CORS:", origin);
      return cb(new Error("CORS Not Allowed: " + origin));
    },
  })
);

app.use(express.json());

// Socket.io with same CORS policy
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Routes
app.use("/api/files", fileRoutes);
app.use("/api/share", shareRoutes);
app.use("/silo", shareRoutes);

// --- REAL-TIME FILE WATCHER ---
if (BASE_DIR) {
  console.log(`👀 Watching folder: ${BASE_DIR}`);

  const watcher = chokidar.watch(BASE_DIR, {
    persistent: true,
    ignoreInitial: true,
    depth: 0,
  });

  watcher.on("add", (path) => {
    console.log(`File added: ${path}`);
    io.emit("file_update", { type: "add", path });
  });

  watcher.on("unlink", (path) => {
    console.log(`File removed: ${path}`);
    io.emit("file_update", { type: "remove", path });
  });
}

// Start
const start = async () => {
  await connectDB();
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Silo backend running on port ${PORT}`);
  });
};

start();
