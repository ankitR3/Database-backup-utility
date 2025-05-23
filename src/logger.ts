export const log = {
    success: (msg: string) => {
        console.log(`[✅ SUCCESS] ${msg}`);
    },
    error: (msg: string) => {
        console.error(`[❌ ERROR] ${msg}`);
    },
    info: (msg: string) => {
        console.log(`[ℹ️ INFO] ${msg}`);
    }
};