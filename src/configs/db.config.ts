import mongoose from "mongoose";

class DatabaseConnection {
    private url: string;

    constructor() {
        this.url =
            process.env.MONGODB_URI || "mongodb://localhost:27017/example";
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        mongoose.connection.on("error", (err: Error): void => {
            console.error(`Mongoose connection error: ${err.message}`);
        });

        mongoose.connection.on("disconnected", (): void => {
            console.log("Mongoose disconnected. Trying to reconnect...");
        });

        mongoose.connection.on("connected", (): void => {
            console.log("Mongoose connected successfully");
        });

        mongoose.connection.on("reconnected", (): void => {
            console.log("Mongoose reconnected successfully");
        });
    }

    public async connect(): Promise<void> {
        try {
            const conn = await mongoose.connect(this.url, {
                compressors: ["zlib"],
            });

            console.log(`MongoDB Connected: ${conn.connection.host}`);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            console.error(`Initial MongoDB connection error: ${errorMessage}`);
            process.exit(1);
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
            console.log("MongoDB Disconnected");
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            console.error(`MongoDB disconnect error: ${errorMessage}`);
        }
    }

    public getConnectionStatus(): number {
        return mongoose.connection.readyState;
    }
}

const connectDB = async (): Promise<void> => {
    const db = new DatabaseConnection();
    await db.connect();
};

export default connectDB;
export { DatabaseConnection };
