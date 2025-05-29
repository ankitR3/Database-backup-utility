import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../db/userSchema";
import { UserSigninSchema } from "../zod/UserSigninSchema";

const router = express.Router();

router.post("/user/signin", async (req: Request, res: Response): Promise<void> => {
    try {
        const parsedData = UserSigninSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({
                error: "Invalid input",
                details: parsedData.error.errors
            });
            return;
        }

        const { login, password } = parsedData.data;

        const user = await User.findOne({ $or: [{ email: login}, { username: login }] });
        if (!user) {
            res.status(401).json({
                error: "Invalid credentials"
            });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                error: "Invalid credentials"
            });
            return;
        }

        const token = jwt.sign({
            userId: user._id,
            email: user.email,
            username: user.username
        }, process.env.JWT_SECRET!, {
            expiresIn: "1h"
        });

        res.status(200).json({
            message: "Signin successful",
            token
        });
    } catch (error) {
        res.status(500).json({
            error: "Signin failed",
            details: error
        })
    }
});

export default router;