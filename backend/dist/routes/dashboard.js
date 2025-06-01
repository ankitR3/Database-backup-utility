"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userMiddleware_1 = require("../middleware/userMiddleware");
const router = express_1.default.Router();
router.get("/dashboard", userMiddleware_1.userAuthMiddleware, (req, res) => {
    const user = req.user;
    res.status(200).json({
        message: "Welcome to the dashboard",
    });
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map