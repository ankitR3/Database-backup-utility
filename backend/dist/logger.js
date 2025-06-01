"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
exports.log = {
    success: (msg) => {
        console.log(`[✅ SUCCESS] ${msg}`);
    },
    error: (msg, err, p0, reason) => {
        console.error(`[❌ ERROR] ${msg}`);
        if (err) {
            console.error(err);
        }
    },
    info: (msg) => {
        console.log(`[ℹ️ INFO] ${msg}`);
    }
};
//# sourceMappingURL=logger.js.map