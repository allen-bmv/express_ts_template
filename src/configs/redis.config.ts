import Redis from "ioredis";

class RedisConnection {
    private client: Redis;
    private connected = false;

    constructor() {
        this.client = new Redis({
            host: process.env.REDIS_HOST || "127.0.0.1",
            port: parseInt(process.env.REDIS_PORT || "6379", 10),
            password: process.env.REDIS_PASSWORD || undefined,
            db: parseInt(process.env.REDIS_DB || "10", 10),
            lazyConnect: true,
            maxRetriesPerRequest: null,
        });

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.client.on("connect", (): void => {
            console.log("[REDIS] Redis connected");
        });

        this.client.on("error", (err: Error): void => {
            console.error(`[REDIS] Redis error: ${err.message}`);
        });

        this.client.on("reconnecting", (): void => {
            console.log("[REDIS] Reconnecting to Redis...");
        });

        this.client.on("close", (): void => {
            console.log("[REDIS] Redis connection closed");
        });

        this.client.on("ready", (): void => {
            console.log("[REDIS] Redis is ready");
        });
    }

    public async connect(): Promise<void> {
        const status = this.client.status;
        // Already connected or connecting - skip
        if (
            status === "ready" ||
            status === "connect" ||
            status === "connecting"
        ) {
            console.log(`[REDIS] Already ${status}, skipping connect`);
            this.connected = true;
            return;
        }
        try {
            await this.client.connect();
            this.connected = true;
            console.log("[REDIS] Redis connected successfully");
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            console.error(`[REDIS] Failed to connect: ${errorMessage}`);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.connected) {
            return;
        }
        try {
            await this.client.quit();
            this.connected = false;
            console.log("[REDIS] Redis disconnected successfully");
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            console.error(`[REDIS] Error during disconnect: ${errorMessage}`);
            throw error;
        }
    }

    public getClient(): Redis {
        return this.client;
    }

    public getStatus(): string {
        return this.client.status;
    }
}

const redisConnection = new RedisConnection();
const redis = redisConnection.getClient();

export default redis;
export { RedisConnection, redisConnection };
