// routes/shareRoutes.js
const express = require("express");
const { createShareLink, downloadFile } = require("../controllers/shareController");

const router = express.Router();

// POST /api/share/
router.post("/", createShareLink);

// GET /silo/download/:token   (will be mounted under /silo)
router.get("/download/:token", downloadFile);

module.exports = router;
