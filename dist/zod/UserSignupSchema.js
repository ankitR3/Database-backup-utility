"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSignUpSchema = void 0;
const zod_1 = require("zod");
exports.UserSignUpSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long")
});
//# sourceMappingURL=UserSignupSchema.js.map