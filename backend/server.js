const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const connectDB = require("./config/db");
const SiloLink = require("./models/SiloLink");


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// health route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Silo backend running" });
});

// list files in BASE_DIR
app.get("/api/files", (req, res) => {
  const baseDir = process.env.BASE_DIR;

  if (!baseDir) {
    return res.status(500).json({ error: "BASE_DIR not configured" });
  }

  // reading
  fs.readdir(baseDir, (err, files) => {
    if (err) {
      console.error("Error reading BASE_DIR:", err.message);
      return res.status(500).json({ error: "Failed to read directory" });
    }

    // filtering folders
    const filtered = files.filter((file) => {
      const fullPath = path.join(baseDir, file);
      return fs.statSync(fullPath).isFile();
    });

    res.json({ files: filtered });
  });
});

// create a share link
app.post("/api/share", async (req, res) => {
  try {
    const baseDir = process.env.BASE_DIR;
    const jwtSecret = process.env.JWT_SECRET;

    if (!baseDir) {
      return res.status(500).json({ error: "BASE_DIR not configured" });
    }
    if (!jwtSecret) {
      return res.status(500).json({ error: "JWT_SECRET not configured" });
    }

    const { filename, expiresInMinutes = 15, maxDownloads = 1 } = req.body;

    if (!filename) {
      return res.status(400).json({ error: "filename is required" });
    }

    const filePath = path.join(baseDir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found in Silo directory" });
    }

    const expiresMs = Number(expiresInMinutes) * 60 * 1000;
    if (isNaN(expiresMs) || expiresMs <= 0) {
      return res.status(400).json({ error: "Invalid expiresInMinutes" });
    }

    const expiresAt = new Date(Date.now() + expiresMs);

    const link = await SiloLink.create({
      fileName: filename,
      maxDownloads: Number(maxDownloads) || 1,
      expiresAt,
    });

    const tokenPayload = { linkId: link._id.toString() };

    const token = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: `${expiresInMinutes}m`,
    });

    const baseUrl = `http://localhost:${PORT}`; // later it can change to domain
    const url = `${baseUrl}/silo/download/${token}`;

    return res.json({ url, expiresAt, maxDownloads: link.maxDownloads });
  } catch (err) {
    console.error("Error in /api/share:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// download file
// download using secure token
app.get("/silo/download/:token", async (req, res) => {
  const { token } = req.params;
  const jwtSecret = process.env.JWT_SECRET;
  const baseDir = process.env.BASE_DIR;

  if (!jwtSecret || !baseDir) {
    return res.status(500).send("Server not configured properly");
  }

  try {
    // verify token
    const payload = jwt.verify(token, jwtSecret);
    const { linkId } = payload;

    // find link in DB
    const link = await SiloLink.findById(linkId);
    if (!link) {
      return res.status(404).send("Link not found");
    }

    const now = new Date();

    // check expiry
    if (link.expiresAt <= now) {
      return res.status(410).send("Link has expired");
    }

    // check download limit
    if (link.downloadsUsed >= link.maxDownloads) {
      return res.status(410).send("Download limit exceeded");
    }

    // build file path
    const filePath = path.join(baseDir, link.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File no longer exists on server");
    }

    // update download count
    link.downloadsUsed += 1;
    link.lastAccessedAt = now;
    await link.save();

    // send file
    return res.download(filePath, link.fileName);
  } catch (err) {
    console.error("Error in /silo/download:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(410).send("Link has expired");
    }
    return res.status(400).send("Invalid link");
  }
});


// start server
async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Silo backend listening on port ${PORT}`);
  });
}

start();
