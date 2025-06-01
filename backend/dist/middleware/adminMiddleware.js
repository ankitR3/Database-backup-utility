"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminSchema_1 = require("../db/adminSchema");
const tokenBlacklist_1 = require("../db/tokenBlacklist");
const adminMiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            res.status(401).json({
                error: "Access denied. No token provided."
            });
            return;
        }
        const blacklistedToken = await tokenBlacklist_1.TokenBlacklist.findOne({ token });
        if (blacklistedToken) {
            res.status(401).json({
                error: "Token has been invalidated"
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const admin = await adminSchema_1.Admin.findById(decoded.userId);
        if (!admin || (admin.role !== "admin" && admin.role !== "superadmin")) {
            res.status(403).json({
                error: "Access denied. Admin only."
            });
            return;
        }
        req.admin = admin;
        next();
    }
    catch (error) {
        res.status(401).json({
            error: "Invalid token."
        });
        return;
    }
};
exports.adminMiddleware = adminMiddleware;
//# sourceMappingURL=adminMiddleware.js.map