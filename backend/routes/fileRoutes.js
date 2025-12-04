// routes/fileRoutes.js
const express = require("express");
const { listFiles } = require("../controllers/fileController");

const router = express.Router();

router.get("/", listFiles);

module.exports = router;
