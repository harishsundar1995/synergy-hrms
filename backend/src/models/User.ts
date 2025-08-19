import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  organizationId?: string;
  role: 'super_admin' | 'org_admin' | 'hr_manager' | 'manager' | 'employee';
  permissions: string[];
  profile: {
    department?: string;
    position?: string;
    manager?: string;
    directReports: string[];
    startDate?: Date;
    location?: string;
    timezone?: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      weekly_reports: boolean;
      burnout_alerts: boolean;
    };
    privacy: {
      anonymousFeedback: boolean;
      shareData: boolean;
    };
    ui: {
      theme: 'light' | 'dark' | 'auto';
      language: string;
    };
  };
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  _id: { type: String, required: true },
  clerkId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, lowercase: true, index: true },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  fullName: { type: String, trim: true },
  imageUrl: { type: String },
  organizationId: { type: String, ref: 'Organization', index: true },
  role: { 
    type: String, 
    enum: ['super_admin', 'org_admin', 'hr_manager', 'manager', 'employee'],
    default: 'employee',
    index: true
  },
  permissions: [{ type: String }],
  profile: {
    department: { type: String, ref: 'Department' },
    position: { type: String, trim: true },
    manager: { type: String, ref: 'User' },
    directReports: [{ type: String, ref: 'User' }],
    startDate: { type: Date },
    location: { type: String, trim: true },
    timezone: { type: String, default: 'UTC' }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      weekly_reports: { type: Boolean, default: true },
      burnout_alerts: { type: Boolean, default: true }
    },
    privacy: {
      anonymousFeedback: { type: Boolean, default: false },
      shareData: { type: Boolean, default: true }
    },
    ui: {
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
      language: { type: String, default: 'en' }
    }
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active',
    index: true
  },
  lastLoginAt: { type: Date },
}, {
  _id: false,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
UserSchema.index({ email: 1, organizationId: 1 });
UserSchema.index({ 'profile.department': 1 });
UserSchema.index({ 'profile.manager': 1 });
UserSchema.index({ role: 1, status: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
