import dotenv from "dotenv";
dotenv.config();

export function validateEnv() {
    if (!process.env.DB_URI) {
        throw new Error("❌ Missing DB_URI in environment variables");
    }

    if (!process.env.DB_NAME) {
        throw new Error("❌ Missing DB_NAME in environment variables");
    }

    if (!process.env.PORT) {
        throw new Error("❌ Missing PORT in environment variables");
    }
}