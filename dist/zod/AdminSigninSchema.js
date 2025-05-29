"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSigninSchema = void 0;
const zod_1 = require("zod");
exports.AdminSigninSchema = zod_1.z.object({
    username: zod_1.z.string().min(3),
    password: zod_1.z.string().min(6)
});
//# sourceMappingURL=AdminSigninSchema.js.map