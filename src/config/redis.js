import { createClient } from "redis";
import { env } from "./env.js";

let redisClient = null;

export async function connectRedis() {
    if (!env.REDIS_URL) {
        throw new Error("REDIS_URL is not set")
    }

    const client = createClient({
        url: env.REDIS_URL
    });

    client.on("error", (error) => {
        console.error("Redis Client Error:", error);
    });

    client.on("connect", () => {
        console.log("🔄 Connecting to Redis...")
    });

    client.on("ready", () => {
        console.log("✅ Redis connected")
    });

    client.on("end", () => {
        console.warn("⚠️ Redis connection closed")
    })

    await client.connect();

    redisClient = client;

    return redisClient;
}

export function getRedisClient() {
    if (!redisClient) {
        throw new Error("Redis client has not been initialized")
    }

    return redisClient;
}