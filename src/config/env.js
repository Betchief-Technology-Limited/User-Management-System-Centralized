import dotenv from "dotenv"

dotenv.config();

export const env = {
    PORT: process.env.PORT || 4008,
    FLEXIBLE_USER_MANAGEMENT: process.env.FLEXIBLE_USER_MANAGEMENT,
    NODE_ENV: process.env.NODE_ENV || "development",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3005",
    EMAIL_FROM: process.env.EMAIL_FROM,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_REQUIRED: process.env.REDIS_REQUIRED === "true"
}
