import express, { Application, Request, Response, NextFunction } from "express";
import { Server as HTTPServer } from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import xss from "xss";
import compression from "compression";
import route from "../routes";
import ErrorMiddleware from "../middlewares/error.middleware";
import connectDB from "../configs/db.config";
import mongoose from "mongoose";
import { redisConnection } from "../configs/redis.config";

class ExpressServer {
    private app: Application;
    private port: number;
    private server: HTTPServer | null = null;

    constructor(port: number = 3012) {
        this.app = express();
        this.port = port;
        this.initializeMiddlewares();
        this.initializeApiRoutes();
        this.initializeErrorHandling();
    }

    private sanitizeInput(
        req: Request,
        _res: Response,
        next: NextFunction,
    ): void {
        const sanitize = (data: any): any =>
            typeof data === "string" ? xss(data) : data;

        ["body", "query", "params"].forEach((key) => {
            const reqKey = key as "body" | "query" | "params";
            if (req[reqKey]) {
                for (const k in req[reqKey]) {
                    (req[reqKey] as any)[k] = sanitize((req[reqKey] as any)[k]);
                }
            }
        });

        next();
    }

    private initializeMiddlewares(): void {
        const limiter = rateLimit({
            windowMs: 60 * 1000,
            max: 60,
            standardHeaders: true,
            legacyHeaders: false,
            message: {
                success: false,
                message: "Too many requests, please try again later.",
            },
            handler: (_req: Request, res: Response): void => {
                res.status(429).json({
                    success: false,
                    message: "Too many requests, please try again later.",
                });
            },
        });
        this.app.set("trust proxy", 1);
        this.app.use(
            helmet({
                contentSecurityPolicy: false,
                crossOriginEmbedderPolicy: false,
            }),
        );
        this.app.use(
            compression({
                level: 9,
                threshold: 512,
                filter: (req: Request, res: Response): boolean => {
                    if (req.headers["x-no-compression"]) {
                        return false;
                    }
                    return compression.filter(req, res);
                },
            }),
        );
        this.app.use(cors());
        this.app.use(express.json({ limit: "20mb" }));
        this.app.use(express.urlencoded({ limit: "20mb", extended: true }));
        this.app.use(limiter);
        this.app.use(hpp());
        this.app.use(this.sanitizeInput.bind(this));
    }

    private initializeApiRoutes(): void {
        this.app.get("/", (_req: Request, res: Response): void => {
            res.status(200).json("OK");
        });
        this.app.use(route);
    }

    private initializeErrorHandling(): void {
        this.app.use(ErrorMiddleware.notFound);
        this.app.use(ErrorMiddleware.errorHandlerMiddleware);
    }

    public async start(): Promise<HTTPServer> {
        try {
            console.log("🔧 Starting server initialization...");

            // Check required environment variables
            const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
            const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

            if (missingVars.length > 0) {
                throw new Error(
                    `Missing required environment variables: ${missingVars.join(
                        ", ",
                    )}`,
                );
            }

            console.log("✅ Environment variables validated");

            // Connect to MongoDB with detailed error handling
            console.log("📦 Connecting to MongoDB...");
            try {
                await connectDB();
                console.log("✅ MongoDB connected successfully");
            } catch (dbError) {
                const dbErrorMsg =
                    dbError instanceof Error
                        ? dbError.message
                        : "Unknown database error";
                console.log(`❌ MongoDB connection failed: ${dbErrorMsg}`);
                throw new Error(`MongoDB connection failed: ${dbErrorMsg}`);
            }

            // Connect to Redis with detailed error handling
            console.log("🔌 Connecting to Redis...");
            try {
                await redisConnection.connect();
                console.log("✅ Redis connected successfully");
            } catch (redisError) {
                const redisErrorMsg =
                    redisError instanceof Error
                        ? redisError.message
                        : "Unknown Redis error";
                console.log(`❌ Redis connection failed: ${redisErrorMsg}`);
                throw new Error(`Redis connection failed: ${redisErrorMsg}`);
            }

            // Start the HTTP server - CRITICAL: Must bind to 0.0.0.0 for Railway
            console.log(`🌐 Starting HTTP server on port ${this.port}...`);
            this.server = this.app.listen(this.port, "0.0.0.0", (): void => {
                console.log(`🚀 Server is running on port ${this.port}`);
                console.log(
                    `📍 Environment: ${process.env.NODE_ENV || "development"}`,
                );
                console.log(`🔗 Listening on 0.0.0.0:${this.port}`);
            });

            // Handle server errors
            this.server.on("error", (error: any) => {
                console.log(`❌ Server error: ${error.message}`);
                if (error.code === "EADDRINUSE") {
                    console.log(`Port ${this.port} is already in use`);
                }
                throw error;
            });

            return this.server;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            const errorStack = error instanceof Error ? error.stack : "";
            console.log(`❌ Failed to start server: ${errorMessage}`);
            console.log(`Stack trace: ${errorStack}`);

            // Ensure we exit with proper error
            process.exit(1);
        }
    }

    public async stop(): Promise<void> {
        return new Promise((resolve, reject): void => {
            if (!this.server) {
                console.log("Server is not running");
                resolve();
                return;
            }

            console.log("📴 Starting graceful shutdown...");

            this.server.close(async (err?: Error): Promise<void> => {
                if (err) {
                    console.log(
                        `❌ Error during server shutdown: ${err.message}`,
                    );
                    reject(err);
                    return;
                }

                try {
                    // Close DB + Redis connections
                    await Promise.all([
                        mongoose.connection.close(),
                        redisConnection.disconnect(),
                    ]);
                    console.log("✅ MongoDB & Redis connections closed");
                    console.log("✅ Server closed successfully");
                    resolve();
                } catch (closeErr) {
                    const errorMessage =
                        closeErr instanceof Error
                            ? closeErr.message
                            : "Unknown error";
                    console.log(
                        `❌ Error while closing connections: ${errorMessage}`,
                    );
                    reject(closeErr);
                }
            });

            // Force close after 10 seconds
            setTimeout((): void => {
                console.log("⏰ Forced shutdown after timeout");
                reject(new Error("Shutdown timeout"));
            }, 10000);
        });
    }

    public getApp(): Application {
        return this.app;
    }
}

export default ExpressServer;
