const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const chokidar = require("chokidar");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const fileRoutes = require("./routes/fileRoutes");
const shareRoutes = require("./routes/shareRoutes");

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
async function start() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(` Silo backend running on port ${PORT}`);
  });
}

start();