declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT?: string;
            NODE_ENV: "development" | "production" | "test";
            MONGODB_URI?: string;
            JWT_SECRET?: string;
            JWT_EXPIRE?: string;
            REFRESH_TOKEN_EXPIRES_IN?: string;
            REDIS_HOST?: string;
            REDIS_PORT?: string;
            REDIS_PASSWORD?: string;
            REDIS_DB?: string;
        }
    }
}

export {};
