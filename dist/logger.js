"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
exports.log = {
    success: (msg) => {
        console.log(`[✅ SUCCESS] ${msg}`);
    },
    error: (msg) => {
        console.error(`[❌ ERROR] ${msg}`);
    },
    info: (msg) => {
        console.log(`[ℹ️ INFO] ${msg}`);
    }
};
