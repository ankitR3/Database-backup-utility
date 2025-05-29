import express, { Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../db/userSchema";
import { UserSignUpSchema } from "../zod/UserSignupSchema";

const router = express.Router();

router.post("/user/signup", async (req: Request, res: Response): Promise<void> => {
    try {
        const parsedData = UserSignUpSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({
                error: "Invalid input",
                details: parsedData.error.errors
            });
            return;
        }

        const { email, password } = parsedData.data;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(409).json({
                error: "User already exists"
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword});
        await newUser.save();

        res.status(201).json({
            message: "User created successfully"
        });
    } catch (error) {
        res.status(500).json({
            error: "Signup failed",
            details: error
        })
    }
});

export default router;