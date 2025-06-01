import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { TokenBlacklist } from "../db/tokenBlacklist";
import { adminMiddleware } from "../middleware/adminMiddleware";

interface DecodedToken {
    exp: number;
    [key: string]: any;
}

const router = express.Router();

router.post("/admin/signout", adminMiddleware, async(req:Request, res: Response): Promise<void> => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");

        if (!token) {
            res.status(400).json({
                error: "No token provided"
            });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

        if (!decoded || !decoded.exp) {
            res.status(400).json({
                error: "Invalid token"
            });
            return;
        }

        // Check if already blacklisted
        const existingBlacklist = await TokenBlacklist.findOne({ token });
        if (existingBlacklist) {
            res.status(200).json({
                message: "Already signed out"
            });
            return;
        }

        await TokenBlacklist.create({
            token: token,
            expiresAt: new Date(decoded.exp * 1000)
        });

        res.status(200).json({
            message: "Admin signed out successfully"
        });
    } catch (error) {
        res.status(500).json({
            error: "Admin signout failed",
            details: error
        });
    }
});

export default router;