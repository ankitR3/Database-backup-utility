"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema_1 = require("../db/userSchema");
const UserSignupSchema_1 = require("../zod/UserSignupSchema");
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
exports.default = router;
//# sourceMappingURL=userSignup.js.map