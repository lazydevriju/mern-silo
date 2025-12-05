// routes/fileRoutes.js
import express from "express";
import { listFiles } from "../controllers/fileController.js";

const router = express.Router();

router.get("/", listFiles);

export default router;
