import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  _id: string;
  name: string;
  domain: string;
  settings: {
    allowSelfRegistration: boolean;
    requireManagerApproval: boolean;
    dataRetentionDays: number;
    enableSentimentAnalysis: boolean;
    enableBurnoutPrediction: boolean;
  };
  subscription: {
    plan: 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'suspended' | 'cancelled';
    maxEmployees: number;
    features: string[];
  };
  stats: {
    totalEmployees: number;
    departments: number;
    avgEngagement: number;
    turnoverRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>({
  _id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  domain: { type: String, required: true, lowercase: true, unique: true },
  settings: {
    allowSelfRegistration: { type: Boolean, default: true },
    requireManagerApproval: { type: Boolean, default: false },
    dataRetentionDays: { type: Number, default: 730 }, // 2 years
    enableSentimentAnalysis: { type: Boolean, default: true },
    enableBurnoutPrediction: { type: Boolean, default: true }
  },
  subscription: {
    plan: { 
      type: String, 
      enum: ['starter', 'professional', 'enterprise'], 
      default: 'professional' 
    },
    status: { 
      type: String, 
      enum: ['active', 'suspended', 'cancelled'], 
      default: 'active' 
    },
    maxEmployees: { type: Number, default: 100 },
    features: [{ type: String }]
  },
  stats: {
    totalEmployees: { type: Number, default: 0 },
    departments: { type: Number, default: 0 },
    avgEngagement: { type: Number, default: 0, min: 0, max: 1 },
    turnoverRate: { type: Number, default: 0, min: 0, max: 1 }
  }
}, {
  _id: false,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
OrganizationSchema.index({ domain: 1 }, { unique: true });
OrganizationSchema.index({ 'subscription.status': 1 });

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
