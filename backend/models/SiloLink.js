// models/SiloLink.js
const mongoose = require("mongoose");

const SiloLinkSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  maxDownloads: { type: Number, default: 1 },
  downloadsUsed: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date },
});

module.exports = mongoose.model("SiloLink", SiloLinkSchema);
