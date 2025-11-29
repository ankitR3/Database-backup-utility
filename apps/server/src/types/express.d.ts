import { JwtPayload } from "jsonwebtoken";
import { AdminType } from "../src/db/adminSchema";

// Define your user payload structure
interface UserPayload extends JwtPayload {
    userId?: string;
    email?: string;
    // Add other properties that your JWT contains
}

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;  // More specific typing
            admin?: AdminType;
        }
    }
}

export {};