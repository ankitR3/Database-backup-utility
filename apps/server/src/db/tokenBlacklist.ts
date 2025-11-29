import mongoose, { Document, Schema} from "mongoose";

export interface TokenBlacklist extends Document {
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const tokenBlacklistSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// Auto-delete expired tokens
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenBlacklist = mongoose.model<TokenBlacklist>("TokenBlacklist", tokenBlacklistSchema);