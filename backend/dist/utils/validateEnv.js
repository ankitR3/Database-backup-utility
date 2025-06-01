"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function validateEnv() {
    if (!process.env.DB_URI) {
        throw new Error("❌ Missing DB_URI in environment variables");
    }
    if (!process.env.DB_NAME) {
        throw new Error("❌ Missing DB_NAME in environment variables");
    }
    if (!process.env.PORT) {
        throw new Error("❌ Missing PORT in environment variables");
    }
}
//# sourceMappingURL=validateEnv.js.map