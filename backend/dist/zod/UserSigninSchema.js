"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSigninSchema = void 0;
const zod_1 = require("zod");
exports.UserSigninSchema = zod_1.z.object({
    login: zod_1.z.string().min(3, "Email or username is required"),
    password: zod_1.z.string().min(1, "Password is required")
});
//# sourceMappingURL=UserSigninSchema.js.map