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
const router = express_1.default.Router();
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
        const { email, password } = parsedData.data;
        const user = await userSchema_1.User.findOne({ email });
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
            email: user.email
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
exports.default = router;
//# sourceMappingURL=userSignin.js.map