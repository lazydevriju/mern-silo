// controllers/fileController.js
// list files in BASE_DIR
import fs from"fs";
import path from "path";

export const listFiles = (req, res) => {
  const baseDir = process.env.BASE_DIR;

  if (!baseDir) {
    return res.status(500).json({ error: "BASE_DIR not configured" });
  }

  fs.readdir(baseDir, (err, files) => {
    if (err) {
      console.error("Error reading BASE_DIR:", err.message);
      return res.status(500).json({ error: "Failed to read directory" });
    }

    const filtered = files.filter((file) => {
      const fullPath = path.join(baseDir, file);
      return fs.statSync(fullPath).isFile();
    });

    res.json({ files: filtered });
  });
};
