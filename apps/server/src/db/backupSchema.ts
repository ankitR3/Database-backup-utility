import mongoose, { Document, Schema } from "mongoose";

export interface BackupType extends Document {
  userId: mongoose.Types.ObjectId;
  userUuid: string;
  dbName: string;
  backupPath: string;
  backupSize: number;
  status: 'pending' | 'completed' | 'failed';
  errorMessage?: string | null;
  createdAt: Date;
  completedAt?: Date | null;
}

const backupSchema = new Schema<BackupType>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userUuid: {
    type: String,
    required: true,
    index: true
  },
  dbName: {
    type: String,
    required: true
  },
  backupPath: {
    type: String,
    required: true
  },
  backupSize: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  errorMessage: {
    type: String,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for query performance
backupSchema.index({ userId: 1, createdAt: -1 });
backupSchema.index({ userUuid: 1, createdAt: -1 });
backupSchema.index({ status: 1 });

export const Backup = mongoose.model<BackupType>('Backup', backupSchema);
