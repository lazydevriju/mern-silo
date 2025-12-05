// routes/shareRoutes.js
import express from "express";
import { createShareLink, downloadFile } from "../controllers/shareController.js";

const router = express.Router();

// POST /api/share/
router.post("/", createShareLink);

// GET /silo/download/:token   (will be mounted under /silo)
router.get("/download/:token", downloadFile);

export default router;
