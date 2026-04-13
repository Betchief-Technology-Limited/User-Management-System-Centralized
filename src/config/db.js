import mongoose from "mongoose";
import { env } from "./env.js";

export default async function connectDB() {
    try {
        await mongoose.connect(env.FLEXIBLE_USER_MANAGEMENT);
        console.log("✅ MongoDB connected");
    } catch (error) {
        console.error("❌ DB connection failed:", error.message);
    }
}