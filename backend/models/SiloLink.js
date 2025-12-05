// models/SiloLink.js
import mongoose from"mongoose";

const SiloLinkSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  maxDownloads: { type: Number, default: 1 },
  downloadsUsed: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date },
});

export default mongoose.model("SiloLink", SiloLinkSchema);
