import express, { Request, response, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Admin } from "../db/adminSchema";
import { AdminSigninSchema } from "../zod/AdminSigninSchema";

const router = express.Router();
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

        const { username, email, password} = parsedData.data;

        const admin = await Admin.findOne({ email, username });
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

export default router;