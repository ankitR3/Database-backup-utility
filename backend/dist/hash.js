"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const password = process.env.ADMIN_PASSWORD;
if (!password) {
    console.error("❌ ADMIN_PASSWORD is not set in .env");
    process.exit(1);
}
bcrypt_1.default.hash(password, 10).then((hash) => {
    console.log("Hashed password:", hash);
});
//# sourceMappingURL=hash.js.map