import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Admin } from "../db/adminSchema";
import { AdminSigninSchema } from "../zod/AdminSigninSchema";
import { TokenBlacklist } from "../db/tokenBlacklist";
import { adminMiddleware } from "../middleware/adminMiddleware";

interface DecodedToken {
    exp: number;
    [key: string]: any;
}

const router = express.Router();

// Admin Signin
router.post("/admin/signin", async (req: Request, res: Response): Promise<void> => {
    try {
        const parsedData = AdminSigninSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({
                error: "Invalid input",
                details: parsedData.error.errors
            });
            return;
        }

        const { email, password } = parsedData.data;

        // Find admin by email only (removed username requirement)
        const admin = await Admin.findOne({ email });
        if (!admin) {
            res.status(401).json({
                error: "Invalid credentials"
            });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            res.status(401).json({
                error: "Invalid credentials"
            });
            return;
        }

        const token = jwt.sign(
        {
            userId: admin._id,
            email: admin.email,
            role: admin.role
        }, process.env.JWT_SECRET!,
        { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Admin signin successful",
            token,
            role: admin.role
        });
    } catch (error) {
        res.status(500).json({
            error: "Admin signin failed",
            details: error
        });
    }
});

// Admin Signout
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