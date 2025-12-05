import express from"express";
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

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 4000;
const BASE_DIR = process.env.BASE_DIR;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Routes
app.use("/api/files", fileRoutes);
app.use("/api/share", shareRoutes);
app.use("/silo", shareRoutes); // This handles the download links

// --- REAL-TIME FILE WATCHER ---
if (BASE_DIR) {
  console.log(`👀 Watching for file changes in: ${BASE_DIR}`);

  // FIX: typo 'watchQB' -> 'watch'
  const watcher = chokidar.watch(BASE_DIR, {
    persistent: true,
    ignoreInitial: true, // Don't spam events on startup
    depth: 0, // Only watch top-level files (optional)
  });

  // Emit events to frontend when files change
  watcher.on("add", (path) => {
    console.log(`File added: ${path}`);
    io.emit("file_update", { type: "add", path });
  });

  watcher.on("unlink", (path) => {
    console.log(`File removed: ${path}`);
    io.emit("file_update", { type: "remove", path });
  });
}

// Start Server
const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🚀 Silo backend running on port ${PORT}`);
  });
};

start();
