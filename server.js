import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";
import { env } from "./src/config/env.js";

async function startServer() {
    try {
        await connectDB();
        try {
            await connectRedis();
        } catch (error) {
            console.error("Redis startup error:", error.message);

            if(env.REDIS_REQUIRED){
                throw new Error("Redis is required but could not connect");
            }

            console.warn("⚠️ Redis connection closed")
        }
        app.listen(env.PORT, () => {
            console.log(`🚀 Server running on port ${env.PORT}`)
        });
        
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }

}

startServer();