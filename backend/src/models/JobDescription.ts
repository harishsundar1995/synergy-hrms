import mongoose, { Schema, Document } from 'mongoose';

export interface IJobDescription extends Document {
  _id: string;
  title: string;
  department: string;
  organizationId?: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  workMode: 'remote' | 'hybrid' | 'on-site';
  location: string;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  overview: string;
  responsibilities: string[];
  requirements: {
    essential: string[];
    preferred: string[];
  };
  skills: {
    technical: string[];
    soft: string[];
  };
  benefits: string[];
  reportingTo?: string;
  teamSize?: number;
  // AI-POWERED FEATURES FOR PHASE 6
  aiGenerated: {
    isGenerated: boolean;
    prompt?: string;
    model?: string;
    generatedAt?: Date;
    humanEdited?: boolean;
    confidence?: number; // 0-100
  };
  marketAnalysis?: {
    avgSalary: number;
    demandLevel: 'low' | 'medium' | 'high' | 'very-high';
    competitionLevel: 'low' | 'medium' | 'high';
    skillGap: string[];
    trendingSkills: string[];
    analysisDate: Date;
    source: string;
  };
  biasCheck: {
    score: number; // 0-100, higher is better
    issues: string[];
    suggestions: string[];
    lastChecked: Date;
    checkedBy: 'ai' | 'human';
  };
  posting: {
    isActive: boolean;
    platforms: Array<{
      name: string;
      url?: string;
      postedAt?: Date;
      status: 'pending' | 'live' | 'expired' | 'failed';
    }>;
    applicantCount: number;
    viewCount: number;
    conversionRate?: number;
  };
  optimization: {
    seoScore: number;
    readabilityScore: number;
    diversityScore: number;
    suggestions: string[];
    lastOptimized: Date;
  };
  status: 'draft' | 'active' | 'paused' | 'closed';
  createdBy: string; // User ID
  updatedBy: string; // User ID
  applicationsCount?: number;
  postedDate?: Date;
  expiryDate?: Date;
  version: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const JobDescriptionSchema = new Schema<IJobDescription>({
  _id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  organizationId: { type: String, ref: 'Organization' },
  jobType: {
    type: String,
    required: true,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    default: 'full-time'
  },
  workMode: {
    type: String,
    required: true,
    enum: ['remote', 'hybrid', 'on-site'],
    default: 'hybrid'
  },
  location: { type: String, required: true, trim: true },
  salaryRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, required: true, default: 'USD' }
  },
  experienceLevel: {
    type: String,
    required: true,
    enum: ['entry', 'mid', 'senior', 'executive'],
    default: 'mid'
  },
  overview: { type: String, required: true },
  responsibilities: [{ type: String, required: true }],
  requirements: {
    essential: [{ type: String, required: true }],
    preferred: [{ type: String }]
  },
  skills: {
    technical: [{ type: String }],
    soft: [{ type: String }]
  },
  benefits: [{ type: String }],
  reportingTo: { type: String, ref: 'Employee' },
  teamSize: { type: Number, min: 0 },
  // AI-POWERED FEATURES FOR PHASE 6
  aiGenerated: {
    isGenerated: { type: Boolean, default: false },
    prompt: { type: String },
    model: { type: String, default: 'gpt-4' },
    generatedAt: { type: Date },
    humanEdited: { type: Boolean, default: false },
    confidence: { type: Number, min: 0, max: 100 }
  },
  marketAnalysis: {
    avgSalary: { type: Number },
    demandLevel: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'very-high'] 
    },
    competitionLevel: { 
      type: String, 
      enum: ['low', 'medium', 'high'] 
    },
    skillGap: [{ type: String }],
    trendingSkills: [{ type: String }],
    analysisDate: { type: Date },
    source: { type: String }
  },
  biasCheck: {
    score: { type: Number, min: 0, max: 100, default: 0 },
    issues: [{ type: String }],
    suggestions: [{ type: String }],
    lastChecked: { type: Date, default: Date.now },
    checkedBy: { type: String, enum: ['ai', 'human'], default: 'ai' }
  },
  posting: {
    isActive: { type: Boolean, default: false },
    platforms: [{
      name: { type: String, required: true },
      url: { type: String },
      postedAt: { type: Date },
      status: { 
        type: String, 
        enum: ['pending', 'live', 'expired', 'failed'],
        default: 'pending'
      }
    }],
    applicantCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    conversionRate: { type: Number, min: 0, max: 100 }
  },
  optimization: {
    seoScore: { type: Number, min: 0, max: 100, default: 0 },
    readabilityScore: { type: Number, min: 0, max: 100, default: 0 },
    diversityScore: { type: Number, min: 0, max: 100, default: 0 },
    suggestions: [{ type: String }],
    lastOptimized: { type: Date, default: Date.now }
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'active', 'paused', 'closed'],
    default: 'draft'
  },
  createdBy: { type: String, required: true, ref: 'User' },
  updatedBy: { type: String, required: true, ref: 'User' },
  applicationsCount: { type: Number, default: 0 },
  postedDate: { type: Date },
  expiryDate: { type: Date },
  version: { type: Number, default: 1 },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for better performance
JobDescriptionSchema.index({ title: 'text', overview: 'text' });
JobDescriptionSchema.index({ department: 1, status: 1 });
JobDescriptionSchema.index({ createdBy: 1 });
JobDescriptionSchema.index({ status: 1, postedDate: -1 });

// Pre-save middleware
JobDescriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.status === 'active' && !this.postedDate) {
    this.postedDate = new Date();
  }
  next();
});

export const JobDescription = mongoose.model<IJobDescription>('JobDescription', JobDescriptionSchema);
