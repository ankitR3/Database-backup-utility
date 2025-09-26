import mongoose, { Document, Schema } from 'mongoose';

export interface UserType extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  username: string;
  password: string;
  uuid: string;
  mongoUri?: string | null;
  dbName?: string | null;
  backupDir?: string | null;
  schedule?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserType>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  uuid: {
    type: String,
    required: true,
    unique: true
  },
  mongoUri: {
    type: String,
    default: null
  },
  dbName: {
    type: String,
    default: null
  },
  backupDir: {
    type: String,
    default: null
  },
  schedule: {
    type: String,
    default: "0 2 * * *" // default daily at 2am
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const User = mongoose.model<UserType>("User", userSchema);
