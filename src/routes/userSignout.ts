import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { TokenBlacklist } from "../db/tokenBlacklist";
import { userAuthMiddleware } from "../middleware/userMiddleware";

const router = express.Router();

router.post("/user/signout", userAuthMiddleware, async(req: Request, res: Response): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            res.status(400).json({
                error: "No token provided"
            });
            return;
        }

        const decoded: any = jwt.decode(token);

        if(!decoded || !decoded.exp) {
            res.status(400).json({
                error: "Invalid token"
            });
            return;
        }

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
            message: "Signed out successfully"
        });
    } catch (error) {
        res.status(500).json({
            error: "Signout failed",
            details: error
        });
    }
});

export default router;