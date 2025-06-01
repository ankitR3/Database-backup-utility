export const log = {
    success: (msg: string) => {
        console.log(`[✅ SUCCESS] ${msg}`);
    },
    error: (msg: string, err?: any, p0?: string, reason?: unknown) => {
        console.error(`[❌ ERROR] ${msg}`);
        if (err) {
            console.error(err);
        }
    },
    info: (msg: string) => {
        console.log(`[ℹ️ INFO] ${msg}`);
    }
};