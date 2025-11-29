// routes/userAuth.ts
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../db/userSchema";
import { v4 as uuidv4 } from 'uuid';
import { userAuthMiddleware } from "../middleware/userMiddleware";

const router = express.Router();

// User Signup
router.post("/signup", async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        // Validation
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

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
            return;
        }

        // Username validation
        if (username.length < 3 || username.length > 50) {
            res.status(400).json({
                success: false,
                message: "Username must be between 3 and 50 characters"
            });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({
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

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate UUID (which serves as both UUID and API key)
        const userUuid = uuidv4();

        // Create new user
        // const newUser = new User({
        //     username,
        //     email: email.toLowerCase(),
        //     password: hashedPassword,
        //     uuid: userUuid // UUID serves as API key
        // });

        const newUser = await User.create({
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
            uuid: userUuid // UUID serves as API key
        });
        // await newUser.save();

        // Generate JWT token for web authentication
        const token = jwt.sign(
            { 
                userId: newUser._id,
                uuid: newUser.uuid,
                email: newUser.email 
            },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                token, // For web authentication
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    uuid: newUser.uuid,
                    apiKey: newUser.uuid, // UUID is the API key for API routes
                    createdAt: newUser.createdAt
                }
            }
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// User Signin
router.post("/signin", async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
            return;
        }

        // Find user
        const user = await User.findOne({ 
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

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
            return;
        }

        // Generate JWT token for web authentication
        const token = jwt.sign(
            { 
                userId: user._id,
                uuid: user.uuid,
                email: user.email 
            },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            message: "Signin successful",
            data: {
                token, // For web authentication
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    uuid: user.uuid,
                    apiKey: user.uuid, // UUID is the API key for API routes
                    mongoUri: user.mongoUri ? "configured" : null, // Don't expose full URI
                    dbName: user.dbName,
                    schedule: user.schedule,
                    isActive: user.isActive,
                    createdAt: user.createdAt
                }
            }
        });
    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Get user profile (requires JWT authentication)
router.get("/profile", userAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const decoded = req.user as any;
        const user = await User.findById(decoded.userId);

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
                    apiKey: user.uuid, // UUID is the API key
                    mongoUri: user.mongoUri ? "configured" : null, // Don't expose full URI
                    dbName: user.dbName,
                    schedule: user.schedule,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile"
        });
    }
});

// Update user profile (requires JWT authentication)
router.put("/profile", userAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const decoded = req.user as any;
        const { username, mongoUri, dbName, schedule } = req.body;

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }

        // Validate inputs if provided
        if (username !== undefined) {
            if (username.length < 3 || username.length > 50) {
                res.status(400).json({
                    success: false,
                    message: "Username must be between 3 and 50 characters"
                });
                return;
            }

            // Check if username is already taken by another user
            const existingUser = await User.findOne({ 
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

        // Update user fields
        if (username !== undefined) user.username = username;
        if (mongoUri !== undefined) user.mongoUri = mongoUri || undefined;
        if (dbName !== undefined) user.dbName = dbName || undefined;
        if (schedule !== undefined) user.schedule = schedule || "0 2 * * *";

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
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
});

// Change password (requires JWT authentication)
router.put("/change-password", userAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const decoded = req.user as any;
        const { currentPassword, newPassword } = req.body;

        // Validation
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

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
            return;
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedNewPassword;
        await user.save();

        res.json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to change password"
        });
    }
});

// Delete account (requires JWT authentication)
router.delete("/account", userAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const decoded = req.user as any;
        const { password } = req.body;

        // Validation
        if (!password) {
            res.status(400).json({
                success: false,
                message: "Password is required to delete account"
            });
            return;
        }

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({
                success: false,
                message: "Incorrect password"
            });
            return;
        }

        // Soft delete - mark as inactive instead of hard delete
        user.isActive = false;
        await user.save();

        res.json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete account"
        });
    }
});

// Refresh token
router.post("/refresh-token", userAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const decoded = req.user as any;
        
        // Find user to ensure they still exist and are active
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: "User not found or inactive"
            });
            return;
        }

        // Generate new JWT token
        const token = jwt.sign(
            { 
                userId: user._id,
                uuid: user.uuid,
                email: user.email 
            },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

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
    } catch (error) {
        console.error("Token refresh error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to refresh token"
        });
    }
});

export default router;