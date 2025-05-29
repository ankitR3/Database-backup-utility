import mongoose, {Document, Schema} from "mongoose";

export interface UserType extends Document {
    email: string;
    username: string;
    password: string;
    _id: string;
}

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {timestamps: true});

export const User = mongoose.model<UserType>("User", userSchema);