"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const adminSchema_1 = require("../db/adminSchema");
const AdminSigninSchema_1 = require("../zod/AdminSigninSchema");
const tokenBlacklist_1 = require("../db/tokenBlacklist");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const router = express_1.default.Router();
router.post("/admin/signin", async (req, res) => {
    try {
        const parsedData = AdminSigninSchema_1.AdminSigninSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({
                error: "Invalid input",
                details: parsedData.error.errors
            });
            return;
        }
        const { email, password } = parsedData.data;
        const admin = await adminSchema_1.Admin.findOne({ email });
        if (!admin) {
            res.status(401).json({
                error: "Invalid credentials"
            });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, admin.password);
        if (!isPasswordValid) {
            res.status(401).json({
                error: "Invalid credentials"
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            userId: admin._id,
            email: admin.email,
            role: admin.role
        }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({
            message: "Admin signin successful",
            token,
            role: admin.role
        });
    }
    catch (error) {
        res.status(500).json({
            error: "Admin signin failed",
            details: error
        });
    }
});
router.post("/admin/signout", adminMiddleware_1.adminMiddleware, async (req, res) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            res.status(400).json({
                error: "No token provided"
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
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
            message: "Admin signed out successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            error: "Admin signout failed",
            details: error
        });
    }
});
exports.default = router;
//# sourceMappingURL=adminAuth.js.map