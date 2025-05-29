import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Admin, AdminType } from "../db/adminSchema";
import { TokenBlacklist } from "../db/tokenBlacklist";

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            res.status(401).json({
                error: "Access denied. No token provided."
            });
            return;
        }

        const blacklistedToken = await TokenBlacklist.findOne({ token });
        if (blacklistedToken) {
            res.status(401).json({
                error: "Token has been invalidated"
            });
            return;
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        const admin = await Admin.findById(decoded.userId) as AdminType;

        if (!admin || (admin.role !== "admin" && admin.role !== "superadmin")) {
            res.status(403).json({
                error: "Access denied. Admin only."
            });
            return;
        }

        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({
            error: "Invalid token."
        });
        return;
    }
};