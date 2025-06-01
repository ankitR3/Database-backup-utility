"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tokenBlacklist_1 = require("../db/tokenBlacklist");
const userAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            message: "Authorization header missing"
        });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const blacklistedToken = await tokenBlacklist_1.TokenBlacklist.findOne({ token });
        if (blacklistedToken) {
            res.status(401).json({
                message: "Token has been invalidated"
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(403).json({
            message: "Invalid token"
        });
        return;
    }
};
exports.userAuthMiddleware = userAuthMiddleware;
//# sourceMappingURL=userMiddleware.js.map