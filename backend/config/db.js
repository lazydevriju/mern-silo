// config/db.js
import mongoose from "mongoose";

const connectDB = async () =>{
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;