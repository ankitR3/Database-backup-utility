import mongoose, { Document, Schema } from 'mongoose';

export interface AdminType extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  uuid: string;
  apiKey: string;
  role: 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<AdminType>({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
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
  apiKey: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin'
  }
}, {
  timestamps: true,
  collection: 'admins'
});

export const Admin = mongoose.model<AdminType>('Admin', adminSchema);
