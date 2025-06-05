"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema_1 = require("../db/userSchema");
const uuid_1 = require("uuid");
const userMiddleware_1 = require("../middleware/userMiddleware");
const router = express_1.default.Router();
router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            res.status(400).json({
                success: false,
                message: "Username, email, and password are required"
            });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
            return;
        }
        if (username.length < 3 || username.length > 50) {
            res.status(400).json({
                success: false,
                message: "Username must be between 3 and 50 characters"
            });
            return;
        }
        const existingUser = await userSchema_1.User.findOne({
            $or: [{ email: email.toLowerCase() }, { username }]
        });
        if (existingUser) {
            const field = existingUser.email === email.toLowerCase() ? "email" : "username";
            res.status(400).json({
                success: false,
                message: `User with this ${field} already exists`
            });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const userUuid = (0, uuid_1.v4)();
        const newUser = new userSchema_1.User({
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
            uuid: userUuid
        });
        await newUser.save();
        const token = jsonwebtoken_1.default.sign({
            userId: newUser._id,
            uuid: newUser.uuid,
            email: newUser.email
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                token,
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    uuid: newUser.uuid,
                    apiKey: newUser.uuid,
                    createdAt: newUser.createdAt
                }
            }
        });
    }
    catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
            return;
        }
        const user = await userSchema_1.User.findOne({
            email: email.toLowerCase(),
            isActive: true
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            uuid: user.uuid,
            email: user.email
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({
            success: true,
            message: "Signin successful",
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    uuid: user.uuid,
                    apiKey: user.uuid,
                    mongoUri: user.mongoUri ? "configured" : null,
                    dbName: user.dbName,
                    schedule: user.schedule,
                    isActive: user.isActive,
                    createdAt: user.createdAt
                }
            }
        });
    }
    catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});
router.get("/profile", userMiddleware_1.userAuthMiddleware, async (req, res) => {
    try {
        const decoded = req.user;
        const user = await userSchema_1.User.findById(decoded.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    uuid: user.uuid,
                    apiKey: user.uuid,
                    mongoUri: user.mongoUri ? "configured" : null,
                    dbName: user.dbName,
                    schedule: user.schedule,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });
    }
    catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile"
        });
    }
});
router.put("/profile", userMiddleware_1.userAuthMiddleware, async (req, res) => {
    try {
        const decoded = req.user;
        const { username, mongoUri, dbName, schedule } = req.body;
        const user = await userSchema_1.User.findById(decoded.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }
        if (username !== undefined) {
            if (username.length < 3 || username.length > 50) {
                res.status(400).json({
                    success: false,
                    message: "Username must be between 3 and 50 characters"
                });
                return;
            }
            const existingUser = await userSchema_1.User.findOne({
                username,
                _id: { $ne: user._id }
            });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: "Username already exists"
                });
                return;
            }
        }
        if (mongoUri !== undefined) {
            if (mongoUri && !mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
                res.status(400).json({
                    success: false,
                    message: "Invalid MongoDB URI format"
                });
                return;
            }
        }
        if (dbName !== undefined) {
            if (dbName) {
                const invalidChars = /[\/\\. "$*<>:|?]/;
                if (invalidChars.test(dbName)) {
                    res.status(400).json({
                        success: false,
                        message: "Database name contains invalid characters"
                    });
                    return;
                }
            }
        }
        if (username !== undefined)
            user.username = username;
        if (mongoUri !== undefined)
            user.mongoUri = mongoUri || undefined;
        if (dbName !== undefined)
            user.dbName = dbName || undefined;
        if (schedule !== undefined)
            user.schedule = schedule || "0 2 * * *";
        await user.save();
        res.json({
            success: true,
            message: "Profile updated successfully",
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    uuid: user.uuid,
                    apiKey: user.uuid,
                    mongoUri: user.mongoUri ? "configured" : null,
                    dbName: user.dbName,
                    schedule: user.schedule,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });
    }
    catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
});
router.put("/change-password", userMiddleware_1.userAuthMiddleware, async (req, res) => {
    try {
        const decoded = req.user;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
            });
            return;
        }
        const user = await userSchema_1.User.findById(decoded.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
            return;
        }
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
        user.password = hashedNewPassword;
        await user.save();
        res.json({
            success: true,
            message: "Password changed successfully"
        });
    }
    catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to change password"
        });
    }
});
router.delete("/account", userMiddleware_1.userAuthMiddleware, async (req, res) => {
    try {
        const decoded = req.user;
        const { password } = req.body;
        if (!password) {
            res.status(400).json({
                success: false,
                message: "Password is required to delete account"
            });
            return;
        }
        const user = await userSchema_1.User.findById(decoded.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({
                success: false,
                message: "Incorrect password"
            });
            return;
        }
        user.isActive = false;
        await user.save();
        res.json({
            success: true,
            message: "Account deleted successfully"
        });
    }
    catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete account"
        });
    }
});
router.post("/refresh-token", userMiddleware_1.userAuthMiddleware, async (req, res) => {
    try {
        const decoded = req.user;
        const user = await userSchema_1.User.findById(decoded.userId);
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: "User not found or inactive"
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            uuid: user.uuid,
            email: user.email
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    uuid: user.uuid,
                    apiKey: user.uuid
                }
            }
        });
    }
    catch (error) {
        console.error("Token refresh error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to refresh token"
        });
    }
});
exports.default = router;
//# sourceMappingURL=userAuth.js.map