"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tokenBlacklist_1 = require("../db/tokenBlacklist");
const userMiddleware_1 = require("../middleware/userMiddleware");
const router = express_1.default.Router();
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
//# sourceMappingURL=userSignout.js.map