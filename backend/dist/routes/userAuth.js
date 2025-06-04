"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema_1 = require("../db/userSchema");
const UserSigninSchema_1 = require("../zod/UserSigninSchema");
const UserSignupSchema_1 = require("../zod/UserSignupSchema");
const tokenBlacklist_1 = require("../db/tokenBlacklist");
const userMiddleware_1 = require("../middleware/userMiddleware");
const router = express_1.default.Router();
router.post("/user/signup", async (req, res) => {
    try {
        const parsedData = UserSignupSchema_1.UserSignUpSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({
                error: "Invalid input",
                details: parsedData.error.errors
            });
            return;
        }
        const { email, password } = parsedData.data;
        const existingUser = await userSchema_1.User.findOne({ email });
        if (existingUser) {
            res.status(409).json({
                error: "User already exists"
            });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = new userSchema_1.User({ email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({
            message: "User created successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            error: "Signup failed",
            details: error
        });
    }
});
router.post("/user/signin", async (req, res) => {
    try {
        const parsedData = UserSigninSchema_1.UserSigninSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({
                error: "Invalid input",
                details: parsedData.error.errors
            });
            return;
        }
        const { login, password } = parsedData.data;
        const user = await userSchema_1.User.findOne({ $or: [{ email: login }, { username: login }] });
        if (!user) {
            res.status(401).json({
                error: "Invalid credentials"
            });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                error: "Invalid credentials"
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            email: user.email,
            username: user.username
        }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });
        res.status(200).json({
            message: "Signin successful",
            token
        });
    }
    catch (error) {
        res.status(500).json({
            error: "Signin failed",
            details: error
        });
    }
});
router.post("/user/signout", userMiddleware_1.userAuthMiddleware, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(400).json({
                error: "No token provided"
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded || !decoded.exp) {
            res.status(400).json({
                error: "Invalid token"
            });
            return;
        }
        const existingBlacklist = await tokenBlacklist_1.TokenBlacklist.findOne({ token });
        if (existingBlacklist) {
            res.status(200).json({
                message: "Already signed out"
            });
            return;
        }
        await tokenBlacklist_1.TokenBlacklist.create({
            token: token,
            expiresAt: new Date(decoded.exp * 1000)
        });
        res.status(200).json({
            message: "Signed out successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            error: "Signout failed",
            details: error
        });
    }
});
exports.default = router;
//# sourceMappingURL=userAuth.js.map