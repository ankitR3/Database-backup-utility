import mongoose, { Document, Schema} from "mongoose";

export interface AdminType extends Document {
    email: string;
    password: string;
    role: string;
    _id: string;
}

const adminSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ["admin", "superadmin"],
    },
}, {timestamps: true});

export const Admin = mongoose.model<AdminType>("Admin", adminSchema);