import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../db/userSchema";
import { UserSigninSchema } from "../zod/UserSigninSchema";
import { UserSignUpSchema } from "../zod/UserSignupSchema";
import { TokenBlacklist } from "../db/tokenBlacklist";
import { userAuthMiddleware } from "../middleware/userMiddleware";

const router = express.Router();

// User Signup
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
        });
    }
});

// User Signin
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
        });
    }
});

// User Signout
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