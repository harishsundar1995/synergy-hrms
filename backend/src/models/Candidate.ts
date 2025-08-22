import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
  _id: string;
  // Basic Information
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location: {
      city: string;
      state: string;
      country: string;
    };
    linkedinUrl?: string;
    portfolioUrl?: string;
    profilePicture?: string;
  };
  
  // Professional Information
  experience: {
    totalYears: number;
    currentRole?: {
      title: string;
      company: string;
      startDate: Date;
      current: boolean;
      endDate?: Date;
    };
    previousRoles: Array<{
      title: string;
      company: string;
      startDate: Date;
      endDate: Date;
      description?: string;
    }>;
  };
  
  // Education
  education: Array<{
    degree: string;
    institution: string;
    graduationYear: number;
    gpa?: number;
    major?: string;
  }>;
  
  // Skills & Expertise
  skills: {
    technical: Array<{
      name: string;
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      yearsOfExperience?: number;
    }>;
    soft: string[];
    languages: Array<{
      language: string;
      proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
    }>;
  };
  
  // Documents & Files
  documents: Array<{
    type: 'resume' | 'cover_letter' | 'portfolio' | 'certificate' | 'other';
    filename: string;
    url: string;
    uploadDate: Date;
    size: number;
  }>;
  
  // AI Analysis
  aiAnalysis: {
    profileScore: number; // 0-100
    skillsMatch?: {
      jobId: string;
      matchPercentage: number;
      matchingSkills: string[];
      missingSkills: string[];
    }[];
    resumeAnalysis?: {
      extractedSkills: string[];
      experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
      careerProgression: 'ascending' | 'lateral' | 'descending' | 'mixed';
      keyStrengths: string[];
      potentialConcerns: string[];
      confidence: number;
      analyzedAt: Date;
    };
    personalityInsights?: {
      traits: string[];
      culturalFit: number; // 0-100
      teamCompatibility: string[];
      workStyle: string;
    };
  };
  
  // Application History
  applicationHistory: Array<{
    jobId: string;
    status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
    appliedDate: Date;
    lastUpdated: Date;
    currentStage?: string;
    notes?: string;
  }>;
  
  // Source & Tracking
  source: {
    channel: 'direct' | 'linkedin' | 'indeed' | 'referral' | 'company_website' | 'recruiter' | 'other';
    referrerName?: string;
    campaign?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
  
  // Notes & Communication
  notes: Array<{
    authorId: string;
    authorName: string;
    content: string;
    type: 'general' | 'interview' | 'screening' | 'reference' | 'follow_up';
    isPrivate: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  
  // Activity Timeline
  activities: Array<{
    type: 'application' | 'email' | 'call' | 'interview' | 'note' | 'status_change' | 'document_upload';
    description: string;
    performedBy: string;
    metadata?: any;
    timestamp: Date;
  }>;
  
  // Status & Preferences
  status: 'active' | 'passive' | 'not_interested' | 'hired' | 'archived';
  availability: {
    immediate: boolean;
    preferredStartDate?: Date;
    noticePeriod?: number; // in days
  };
  preferences: {
    jobType: ('full-time' | 'part-time' | 'contract' | 'internship')[];
    workMode: ('remote' | 'hybrid' | 'on-site')[];
    salaryExpectation?: {
      min: number;
      max: number;
      currency: string;
    };
    locations: string[];
    industries: string[];
  };
  
  // Ratings & Feedback
  ratings: {
    technical: number; // 1-5
    communication: number; // 1-5
    cultural: number; // 1-5
    overall: number; // 1-5
    ratedBy: string;
    ratedAt: Date;
    feedback?: string;
  }[];
  
  // Privacy & Consent
  privacy: {
    dataConsent: boolean;
    marketingConsent: boolean;
    profileVisibility: 'public' | 'private' | 'recruiter_only';
    retentionPeriod?: Date;
  };
  
  // System Fields
  organizationId?: string;
  createdBy: string;
  assignedRecruiter?: string;
  tags: string[];
  starred: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
}

const CandidateSchema: Schema = new Schema({
  personalInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, trim: true },
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true, default: 'United States' }
    },
    linkedinUrl: { type: String },
    portfolioUrl: { type: String },
    profilePicture: { type: String }
  },
  
  experience: {
    totalYears: { type: Number, required: true, min: 0, max: 50 },
    currentRole: {
      title: String,
      company: String,
      startDate: Date,
      current: { type: Boolean, default: true },
      endDate: Date
    },
    previousRoles: [{
      title: { type: String, required: true },
      company: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      description: String
    }]
  },
  
  education: [{
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    graduationYear: { type: Number, required: true, min: 1950, max: 2030 },
    gpa: { type: Number, min: 0, max: 4.0 },
    major: String
  }],
  
  skills: {
    technical: [{
      name: { type: String, required: true },
      level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], required: true },
      yearsOfExperience: { type: Number, min: 0, max: 30 }
    }],
    soft: [{ type: String }],
    languages: [{
      language: { type: String, required: true },
      proficiency: { type: String, enum: ['basic', 'conversational', 'fluent', 'native'], required: true }
    }]
  },
  
  documents: [{
    type: { type: String, enum: ['resume', 'cover_letter', 'portfolio', 'certificate', 'other'], required: true },
    filename: { type: String, required: true },
    url: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    size: { type: Number, required: true }
  }],
  
  aiAnalysis: {
    profileScore: { type: Number, min: 0, max: 100, default: 0 },
    skillsMatch: [{
      jobId: { type: String, required: true },
      matchPercentage: { type: Number, min: 0, max: 100 },
      matchingSkills: [String],
      missingSkills: [String]
    }],
    resumeAnalysis: {
      extractedSkills: [String],
      experienceLevel: { type: String, enum: ['entry', 'mid', 'senior', 'executive'] },
      careerProgression: { type: String, enum: ['ascending', 'lateral', 'descending', 'mixed'] },
      keyStrengths: [String],
      potentialConcerns: [String],
      confidence: { type: Number, min: 0, max: 100 },
      analyzedAt: Date
    },
    personalityInsights: {
      traits: [String],
      culturalFit: { type: Number, min: 0, max: 100 },
      teamCompatibility: [String],
      workStyle: String
    }
  },
  
  applicationHistory: [{
    jobId: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'],
      required: true 
    },
    appliedDate: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    currentStage: String,
    notes: String
  }],
  
  source: {
    channel: { 
      type: String, 
      enum: ['direct', 'linkedin', 'indeed', 'referral', 'company_website', 'recruiter', 'other'],
      required: true 
    },
    referrerName: String,
    campaign: String,
    utm_source: String,
    utm_medium: String,
    utm_campaign: String
  },
  
  notes: [{
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['general', 'interview', 'screening', 'reference', 'follow_up'], default: 'general' },
    isPrivate: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  
  activities: [{
    type: { 
      type: String, 
      enum: ['application', 'email', 'call', 'interview', 'note', 'status_change', 'document_upload'],
      required: true 
    },
    description: { type: String, required: true },
    performedBy: { type: String, required: true },
    metadata: Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
  }],
  
  status: { 
    type: String, 
    enum: ['active', 'passive', 'not_interested', 'hired', 'archived'],
    default: 'active' 
  },
  
  availability: {
    immediate: { type: Boolean, default: false },
    preferredStartDate: Date,
    noticePeriod: { type: Number, min: 0, max: 365 }
  },
  
  preferences: {
    jobType: [{ type: String, enum: ['full-time', 'part-time', 'contract', 'internship'] }],
    workMode: [{ type: String, enum: ['remote', 'hybrid', 'on-site'] }],
    salaryExpectation: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, default: 'USD' }
    },
    locations: [String],
    industries: [String]
  },
  
  ratings: [{
    technical: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    cultural: { type: Number, min: 1, max: 5 },
    overall: { type: Number, min: 1, max: 5 },
    ratedBy: { type: String, required: true },
    ratedAt: { type: Date, default: Date.now },
    feedback: String
  }],
  
  privacy: {
    dataConsent: { type: Boolean, required: true, default: false },
    marketingConsent: { type: Boolean, default: false },
    profileVisibility: { type: String, enum: ['public', 'private', 'recruiter_only'], default: 'recruiter_only' },
    retentionPeriod: Date
  },
  
  organizationId: String,
  createdBy: { type: String, required: true },
  assignedRecruiter: String,
  tags: [String],
  starred: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastContactedAt: Date
}, {
  timestamps: true
});

// Indexes for performance
CandidateSchema.index({ 'personalInfo.email': 1 });
CandidateSchema.index({ organizationId: 1 });
CandidateSchema.index({ assignedRecruiter: 1 });
CandidateSchema.index({ status: 1 });
CandidateSchema.index({ 'skills.technical.name': 1 });
CandidateSchema.index({ createdAt: -1 });
CandidateSchema.index({ 'aiAnalysis.profileScore': -1 });

// Text index for search
CandidateSchema.index({
  'personalInfo.firstName': 'text',
  'personalInfo.lastName': 'text',
  'personalInfo.email': 'text',
  'experience.currentRole.title': 'text',
  'experience.currentRole.company': 'text',
  'skills.technical.name': 'text',
  'education.institution': 'text',
  'education.degree': 'text'
});

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
