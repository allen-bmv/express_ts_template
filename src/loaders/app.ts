import ExpressServer from "./express";
import { config } from "dotenv";
config({ quiet: true });

let serverInstance: ExpressServer | null = null;

process.on("uncaughtException", (err: Error): void => {
    console.error(`[UncaughtException] ${err.message}`);
    console.error(`Stack: ${err.stack}`);
    process.exit(1);
});

process.on("unhandledRejection", (reason: any): void => {
    console.error(`[UnhandledRejection] ${reason}`);
    process.exit(1);
});

const gracefulShutdown = async (signal: string): Promise<void> => {
    console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);

    if (serverInstance) {
        try {
            await serverInstance.stop();
            process.exit(0);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            console.error(`❌ Error during shutdown: ${errorMessage}`);
            process.exit(1);
        }
    } else {
        console.log("No server instance to shutdown");
        process.exit(0);
    }
};

// Listen for shutdown signals
process.on("SIGTERM", (): void => {
    gracefulShutdown("SIGTERM");
});

process.on("SIGINT", (): void => {
    gracefulShutdown("SIGINT");
});

const PORT: number = parseInt(process.env.PORT || "3012", 10);

(async (): Promise<void> => {
    try {
        serverInstance = new ExpressServer(PORT);
        await serverInstance.start();
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : "Unknown error";
        console.error(`[Startup Error] ${errorMessage}`);
        process.exit(1);
    }
})();
