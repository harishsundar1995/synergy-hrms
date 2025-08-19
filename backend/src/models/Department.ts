import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  _id: string;
  name: string;
  description?: string;
  organizationId: string;
  members: string[];
  settings: {
    burnoutThreshold: number;
    engagementTarget: number;
    allowAnonymousFeedback: boolean;
  };
  stats: {
    memberCount: number;
    avgEngagement: number;
    avgBurnoutRisk: number;
    turnoverRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>({
  _id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  organizationId: { type: String, required: true, ref: 'Organization', index: true },
  members: [{ type: String, ref: 'User' }],
  settings: {
    burnoutThreshold: { type: Number, default: 0.7, min: 0, max: 1 },
    engagementTarget: { type: Number, default: 0.8, min: 0, max: 1 },
    allowAnonymousFeedback: { type: Boolean, default: true }
  },
  stats: {
    memberCount: { type: Number, default: 0 },
    avgEngagement: { type: Number, default: 0, min: 0, max: 1 },
    avgBurnoutRisk: { type: Number, default: 0, min: 0, max: 1 },
    turnoverRate: { type: Number, default: 0, min: 0, max: 1 }
  }
}, {
  _id: false,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
DepartmentSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
