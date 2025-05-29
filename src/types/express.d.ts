import { JwtPayload } from "jsonwebtoken";
import { AdminType } from "../src/db/adminSchema";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload | string;
            admin?: AdminType;
        }
    }
}