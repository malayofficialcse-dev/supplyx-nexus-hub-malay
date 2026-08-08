import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redis: Redis | null = null;

try {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true, // Don't block startup if Redis is down
  });

  redis.on("error", (error) => {
    console.warn("⚠️ Redis Connection Failure:", error.message);
  });

  redis.on("connect", () => {
    console.log("🚀 Redis connected successfully!");
  });
} catch (error) {
  console.warn("⚠️ Failed to initialize Redis Client:", error);
}

// Caching helper functions
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch (error) {
    console.error("Cache Read Error:", error);
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  if (!redis) return;
  try {
    const serialized = JSON.stringify(value);
    await redis.set(key, serialized, "EX", ttlSeconds);
  } catch (error) {
    console.error("Cache Write Error:", error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Cache Deletion Error:", error);
  }
}

export { redis };
