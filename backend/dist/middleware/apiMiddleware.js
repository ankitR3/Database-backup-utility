"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiMiddleware = void 0;
const userSchema_1 = require("../db/userSchema");
const apiMiddleware = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'] || req.body?.apikey;
        if (!apiKey) {
            res.status(401).json({
                success: false,
                message: "API key is required"
            });
            return;
        }
        const user = await userSchema_1.User.findOne({ uuid: apiKey, isActive: true });
        if (!user) {
            res.status(403).json({
                success: false,
                message: "Invalid API key"
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("API middleware error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
exports.apiMiddleware = apiMiddleware;
//# sourceMappingURL=apiMiddleware.js.map