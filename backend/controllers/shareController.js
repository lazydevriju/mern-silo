const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const SiloLink = require("../models/SiloLink");

// Helper: Ensure the target path is actually inside the base directory
const isSafePath = (base, target) => {
  const resolvedBase = path.resolve(base);
  const resolvedTarget = path.resolve(base, target);
  return resolvedTarget.startsWith(resolvedBase);
};

// Create a share link
const createShareLink = async (req, res) => {
  try {
    const baseDir = process.env.BASE_DIR;
    const jwtSecret = process.env.JWT_SECRET;
    const PORT = process.env.PORT || 4000;

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

    // FIX: Security check moved INSIDE the function
    if (!isSafePath(baseDir, filename)) {
      return res.status(403).json({ error: "Access Denied: Invalid path" });
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

    const baseUrl = `http://localhost:${PORT}`;
    const url = `${baseUrl}/silo/download/${token}`;

    return res.json({ url, expiresAt, maxDownloads: link.maxDownloads });
  } catch (err) {
    console.error("Error in createShareLink:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Download using secure token
const downloadFile = async (req, res) => {
  const { token } = req.params;
  const jwtSecret = process.env.JWT_SECRET;
  const baseDir = process.env.BASE_DIR;

  if (!jwtSecret || !baseDir) {
    return res.status(500).send("Server not configured properly");
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const { linkId } = payload;

    const link = await SiloLink.findById(linkId);
    if (!link) {
      return res.status(404).send("Link not found");
    }

    const now = new Date();

    if (link.expiresAt <= now) {
      return res.status(410).send("Link has expired");
    }

    if (link.downloadsUsed >= link.maxDownloads) {
      return res.status(410).send("Download limit exceeded");
    }

    // FIX: Add security check here too (Defense in Depth)
    if (!isSafePath(baseDir, link.fileName)) {
        return res.status(403).send("Access Denied: Invalid file path");
    }

    const filePath = path.join(baseDir, link.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File no longer exists on server");
    }

    link.downloadsUsed += 1;
    link.lastAccessedAt = now;
    await link.save();

    return res.download(filePath, link.fileName);
  } catch (err) {
    console.error("Error in downloadFile:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(410).send("Link has expired");
    }
    return res.status(400).send("Invalid link");
  }
};

module.exports = { createShareLink, downloadFile };