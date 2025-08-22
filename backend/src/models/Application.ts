import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  _id: string;
  // Core References
  candidateId: string;
  jobId: string;
  organizationId?: string;
  
  // Application Details
  applicationInfo: {
    appliedDate: Date;
    source: 'direct' | 'linkedin' | 'indeed' | 'referral' | 'company_website' | 'recruiter' | 'other';
    referrerName?: string;
    coverLetter?: string;
    customAnswers?: Array<{
      question: string;
      answer: string;
      type: 'text' | 'choice' | 'file';
    }>;
  };
  
  // Pipeline Management
  pipeline: {
    currentStage: string;
    status: 'applied' | 'screening' | 'interview' | 'assessment' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    stageHistory: Array<{
      stage: string;
      status: string;
      enteredAt: Date;
      exitedAt?: Date;
      duration?: number; // in hours
      performedBy?: string;
      notes?: string;
      outcome?: 'passed' | 'failed' | 'pending' | 'on_hold';
    }>;
    nextAction?: {
      type: 'call' | 'email' | 'interview' | 'assessment' | 'reference_check' | 'offer' | 'follow_up';
      dueDate: Date;
      assignedTo?: string;
      description?: string;
    };
  };
  
  // Screening & Assessment
  screening: {
    initialScreening?: {
      completed: boolean;
      completedAt?: Date;
      completedBy?: string;
      score?: number; // 0-100
      notes?: string;
      recommendation: 'proceed' | 'reject' | 'hold' | 'needs_review';
      criteria: Array<{
        criterion: string;
        met: boolean;
        notes?: string;
      }>;
    };
    
    phoneScreening?: {
      scheduled: boolean;
      scheduledAt?: Date;
      completed: boolean;
      completedAt?: Date;
      duration?: number; // in minutes
      interviewer?: string;
      score?: number; // 1-5
      notes?: string;
      recording?: string;
      feedback?: {
        communication: number; // 1-5
        technical: number; // 1-5
        enthusiasm: number; // 1-5
        cultural: number; // 1-5;
        overall: number; // 1-5
        strengths: string[];
        concerns: string[];
        recommendation: 'proceed' | 'reject' | 'hold';
      };
    };
    
    assessments?: Array<{
      type: 'technical' | 'cognitive' | 'personality' | 'skills' | 'culture_fit' | 'custom';
      name: string;
      provider?: string;
      assignedAt: Date;
      dueDate?: Date;
      completedAt?: Date;
      score?: number;
      maxScore?: number;
      passed: boolean;
      results?: Record<string, unknown>;
      feedback?: string;
      url?: string;
    }>;
  };
  
  // Interview Process
  interviews: Array<{
    type: 'phone' | 'video' | 'in_person' | 'panel' | 'technical' | 'behavioral' | 'final';
    round: number;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
    scheduledAt?: Date;
    completedAt?: Date;
    duration?: number; // in minutes
    interviewers: Array<{
      interviewerId: string;
      name: string;
      role: string;
      email: string;
    }>;
    location?: {
      type: 'office' | 'remote' | 'phone';
      address?: string;
      meetingLink?: string;
      dialInNumber?: string;
    };
    feedback: Array<{
      interviewerId: string;
      interviewerName: string;
      scores: {
        technical?: number; // 1-5
        communication: number; // 1-5
        problemSolving?: number; // 1-5
        cultural: number; // 1-5
        leadership?: number; // 1-5
        overall: number; // 1-5
      };
      strengths: string[];
      concerns: string[];
      notes?: string;
      recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire';
      submittedAt: Date;
    }>;
    overallFeedback?: {
      averageScore: number;
      recommendation: 'proceed' | 'reject' | 'hold';
      consensusNotes?: string;
      nextSteps?: string;
    };
    recordingUrl?: string;
    documents?: string[];
  }>;
  
  // AI Analysis & Insights
  aiInsights: {
    candidateJobMatch: {
      overallScore: number; // 0-100
      skillsMatch: number; // 0-100
      experienceMatch: number; // 0-100
      culturalMatch: number; // 0-100
      salaryMatch: number; // 0-100
      locationMatch: number; // 0-100
      analyzedAt: Date;
      confidence: number; // 0-100
      
      details: {
        matchingSkills: string[];
        missingSkills: string[];
        skillGaps: Array<{
          skill: string;
          importance: 'low' | 'medium' | 'high' | 'critical';
          alternatives?: string[];
        }>;
        experienceGap?: {
          required: number;
          candidate: number;
          assessment: 'under_qualified' | 'qualified' | 'over_qualified';
        };
      };
    };
    
    hiringRecommendation: {
      recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire' | 'strong_no_hire';
      confidence: number; // 0-100
      reasoning: string[];
      riskFactors: string[];
      successProbability: number; // 0-100
      expectedPerformance: 'below_average' | 'average' | 'above_average' | 'exceptional';
      retentionProbability: number; // 0-100
      updatedAt: Date;
    };
    
    interviewSuggestions?: {
      technicalQuestions: string[];
      behavioralQuestions: string[];
      skillsToProbe: string[];
      redFlags: string[];
      focusAreas: string[];
    };
  };
  
  // Offer Management
  offer?: {
    status: 'preparing' | 'pending_approval' | 'sent' | 'negotiating' | 'accepted' | 'declined' | 'withdrawn' | 'expired';
    sentAt?: Date;
    expiresAt?: Date;
    acceptedAt?: Date;
    declinedAt?: Date;
    
    details: {
      position: string;
      department: string;
      startDate?: Date;
      
      compensation: {
        baseSalary: number;
        currency: string;
        bonus?: {
          type: 'annual' | 'signing' | 'performance';
          amount: number;
          conditions?: string;
        };
        equity?: {
          type: 'stock_options' | 'rsu' | 'espp';
          amount: number;
          vestingSchedule?: string;
        };
        benefits: string[];
        totalCompensation?: number;
      };
      
      workArrangement: {
        type: 'full-time' | 'part-time' | 'contract';
        workMode: 'remote' | 'hybrid' | 'on-site';
        schedule?: string;
        probationPeriod?: number; // in months
      };
    };
    
    negotiations?: Array<{
      requestType: 'salary' | 'bonus' | 'equity' | 'benefits' | 'start_date' | 'work_arrangement' | 'other';
      candidateRequest: string;
      companyResponse?: string;
      status: 'pending' | 'accepted' | 'declined' | 'counter_offered';
      requestedAt: Date;
      respondedAt?: Date;
    }>;
    
    approvals?: Array<{
      approverRole: string;
      approverId: string;
      approverName: string;
      status: 'pending' | 'approved' | 'rejected';
      comments?: string;
      submittedAt: Date;
      respondedAt?: Date;
    }>;
  };
  
  // Communication & Notes
  communications: Array<{
    type: 'email' | 'call' | 'sms' | 'linkedin' | 'meeting' | 'other';
    direction: 'inbound' | 'outbound';
    subject?: string;
    content?: string;
    fromEmail?: string;
    toEmail?: string;
    ccEmails?: string[];
    templateUsed?: string;
    sentAt?: Date;
    receivedAt?: Date;
    readAt?: Date;
    replied?: boolean;
    attachments?: string[];
    metadata?: Record<string, unknown>;
  }>;
  
  notes: Array<{
    authorId: string;
    authorName: string;
    content: string;
    type: 'general' | 'interview' | 'screening' | 'reference' | 'offer' | 'internal';
    isPrivate: boolean;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
  }>;
  
  // Team & Collaboration
  team: {
    recruiter?: string;
    hiringManager?: string;
    interviewers?: string[];
    coordinator?: string;
    
    assignments: Array<{
      userId: string;
      userName: string;
      role: 'recruiter' | 'hiring_manager' | 'interviewer' | 'coordinator' | 'decision_maker';
      assignedAt: Date;
      permissions: string[];
    }>;
  };
  
  // Metrics & Tracking
  metrics: {
    timeInPipeline: number; // in hours
    timeInCurrentStage: number; // in hours
    responseTime?: number; // candidate response time in hours
    interviewerRatings: {
      average: number;
      count: number;
      distribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      };
    };
    
    stages: {
      [stageName: string]: {
        enteredAt: Date;
        exitedAt?: Date;
        duration?: number; // in hours
        outcome?: string;
      };
    };
  };
  
  // References
  references?: Array<{
    name: string;
    relationship: string;
    company?: string;
    position?: string;
    email?: string;
    phone?: string;
    contacted: boolean;
    contactedAt?: Date;
    response?: {
      technical: number; // 1-5
      reliability: number; // 1-5
      teamwork: number; // 1-5
      overall: number; // 1-5
      wouldRehire: boolean;
      comments?: string;
      redFlags?: string[];
    };
  }>;
  
  // Background Check
  backgroundCheck?: {
    required: boolean;
    provider?: string;
    initiatedAt?: Date;
    completedAt?: Date;
    status: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'discrepancy_found';
    results?: {
      identity: 'clear' | 'issue' | 'failed';
      criminal: 'clear' | 'issue' | 'failed';
      employment: 'clear' | 'issue' | 'failed';
      education: 'clear' | 'issue' | 'failed';
      credit?: 'clear' | 'issue' | 'failed';
      driving?: 'clear' | 'issue' | 'failed';
      issues?: string[];
      reportUrl?: string;
    };
  };
  
  // System & Audit
  createdBy: string;
  tags: string[];
  starred: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}

const ApplicationSchema: Schema = new Schema({
  candidateId: { type: String, required: true },
  jobId: { type: String, required: true },
  organizationId: String,
  
  applicationInfo: {
    appliedDate: { type: Date, required: true, default: Date.now },
    source: { 
      type: String, 
      enum: ['direct', 'linkedin', 'indeed', 'referral', 'company_website', 'recruiter', 'other'],
      required: true 
    },
    referrerName: String,
    coverLetter: String,
    customAnswers: [{
      question: { type: String, required: true },
      answer: { type: String, required: true },
      type: { type: String, enum: ['text', 'choice', 'file'], default: 'text' }
    }]
  },
  
  pipeline: {
    currentStage: { type: String, required: true, default: 'applied' },
    status: { 
      type: String, 
      enum: ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected', 'withdrawn'],
      required: true,
      default: 'applied'
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    stageHistory: [{
      stage: { type: String, required: true },
      status: { type: String, required: true },
      enteredAt: { type: Date, required: true },
      exitedAt: Date,
      duration: Number,
      performedBy: String,
      notes: String,
      outcome: { type: String, enum: ['passed', 'failed', 'pending', 'on_hold'] }
    }],
    nextAction: {
      type: { type: String, enum: ['call', 'email', 'interview', 'assessment', 'reference_check', 'offer', 'follow_up'] },
      dueDate: Date,
      assignedTo: String,
      description: String
    }
  },
  
  screening: {
    initialScreening: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      completedBy: String,
      score: { type: Number, min: 0, max: 100 },
      notes: String,
      recommendation: { type: String, enum: ['proceed', 'reject', 'hold', 'needs_review'] },
      criteria: [{
        criterion: { type: String, required: true },
        met: { type: Boolean, required: true },
        notes: String
      }]
    },
    
    phoneScreening: {
      scheduled: { type: Boolean, default: false },
      scheduledAt: Date,
      completed: { type: Boolean, default: false },
      completedAt: Date,
      duration: Number,
      interviewer: String,
      score: { type: Number, min: 1, max: 5 },
      notes: String,
      recording: String,
      feedback: {
        communication: { type: Number, min: 1, max: 5 },
        technical: { type: Number, min: 1, max: 5 },
        enthusiasm: { type: Number, min: 1, max: 5 },
        cultural: { type: Number, min: 1, max: 5 },
        overall: { type: Number, min: 1, max: 5 },
        strengths: [String],
        concerns: [String],
        recommendation: { type: String, enum: ['proceed', 'reject', 'hold'] }
      }
    },
    
    assessments: [{
      type: { type: String, enum: ['technical', 'cognitive', 'personality', 'skills', 'culture_fit', 'custom'], required: true },
      name: { type: String, required: true },
      provider: String,
      assignedAt: { type: Date, required: true },
      dueDate: Date,
      completedAt: Date,
      score: Number,
      maxScore: Number,
      passed: { type: Boolean, required: true },
      results: Schema.Types.Mixed,
      feedback: String,
      url: String
    }]
  },
  
  interviews: [{
    type: { type: String, enum: ['phone', 'video', 'in_person', 'panel', 'technical', 'behavioral', 'final'], required: true },
    round: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no_show'], default: 'scheduled' },
    scheduledAt: Date,
    completedAt: Date,
    duration: Number,
    interviewers: [{
      interviewerId: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, required: true },
      email: { type: String, required: true }
    }],
    location: {
      type: { type: String, enum: ['office', 'remote', 'phone'] },
      address: String,
      meetingLink: String,
      dialInNumber: String
    },
    feedback: [{
      interviewerId: { type: String, required: true },
      interviewerName: { type: String, required: true },
      scores: {
        technical: { type: Number, min: 1, max: 5 },
        communication: { type: Number, min: 1, max: 5, required: true },
        problemSolving: { type: Number, min: 1, max: 5 },
        cultural: { type: Number, min: 1, max: 5, required: true },
        leadership: { type: Number, min: 1, max: 5 },
        overall: { type: Number, min: 1, max: 5, required: true }
      },
      strengths: [String],
      concerns: [String],
      notes: String,
      recommendation: { type: String, enum: ['strong_hire', 'hire', 'no_hire', 'strong_no_hire'], required: true },
      submittedAt: { type: Date, default: Date.now }
    }],
    overallFeedback: {
      averageScore: Number,
      recommendation: { type: String, enum: ['proceed', 'reject', 'hold'] },
      consensusNotes: String,
      nextSteps: String
    },
    recordingUrl: String,
    documents: [String]
  }],
  
  aiInsights: {
    candidateJobMatch: {
      overallScore: { type: Number, min: 0, max: 100 },
      skillsMatch: { type: Number, min: 0, max: 100 },
      experienceMatch: { type: Number, min: 0, max: 100 },
      culturalMatch: { type: Number, min: 0, max: 100 },
      salaryMatch: { type: Number, min: 0, max: 100 },
      locationMatch: { type: Number, min: 0, max: 100 },
      analyzedAt: Date,
      confidence: { type: Number, min: 0, max: 100 },
      
      details: {
        matchingSkills: [String],
        missingSkills: [String],
        skillGaps: [{
          skill: { type: String, required: true },
          importance: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
          alternatives: [String]
        }],
        experienceGap: {
          required: Number,
          candidate: Number,
          assessment: { type: String, enum: ['under_qualified', 'qualified', 'over_qualified'] }
        }
      }
    },
    
    hiringRecommendation: {
      recommendation: { type: String, enum: ['strong_hire', 'hire', 'maybe', 'no_hire', 'strong_no_hire'] },
      confidence: { type: Number, min: 0, max: 100 },
      reasoning: [String],
      riskFactors: [String],
      successProbability: { type: Number, min: 0, max: 100 },
      expectedPerformance: { type: String, enum: ['below_average', 'average', 'above_average', 'exceptional'] },
      retentionProbability: { type: Number, min: 0, max: 100 },
      updatedAt: Date
    },
    
    interviewSuggestions: {
      technicalQuestions: [String],
      behavioralQuestions: [String],
      skillsToProbe: [String],
      redFlags: [String],
      focusAreas: [String]
    }
  },
  
  offer: {
    status: { type: String, enum: ['preparing', 'pending_approval', 'sent', 'negotiating', 'accepted', 'declined', 'withdrawn', 'expired'] },
    sentAt: Date,
    expiresAt: Date,
    acceptedAt: Date,
    declinedAt: Date,
    
    details: {
      position: { type: String, required: true },
      department: { type: String, required: true },
      startDate: Date,
      
      compensation: {
        baseSalary: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, default: 'USD' },
        bonus: {
          type: { type: String, enum: ['annual', 'signing', 'performance'] },
          amount: { type: Number, min: 0 },
          conditions: String
        },
        equity: {
          type: { type: String, enum: ['stock_options', 'rsu', 'espp'] },
          amount: { type: Number, min: 0 },
          vestingSchedule: String
        },
        benefits: [String],
        totalCompensation: Number
      },
      
      workArrangement: {
        type: { type: String, enum: ['full-time', 'part-time', 'contract'], required: true },
        workMode: { type: String, enum: ['remote', 'hybrid', 'on-site'], required: true },
        schedule: String,
        probationPeriod: { type: Number, min: 0, max: 24 }
      }
    },
    
    negotiations: [{
      requestType: { type: String, enum: ['salary', 'bonus', 'equity', 'benefits', 'start_date', 'work_arrangement', 'other'], required: true },
      candidateRequest: { type: String, required: true },
      companyResponse: String,
      status: { type: String, enum: ['pending', 'accepted', 'declined', 'counter_offered'], default: 'pending' },
      requestedAt: { type: Date, default: Date.now },
      respondedAt: Date
    }],
    
    approvals: [{
      approverRole: { type: String, required: true },
      approverId: { type: String, required: true },
      approverName: { type: String, required: true },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      comments: String,
      submittedAt: { type: Date, default: Date.now },
      respondedAt: Date
    }]
  },
  
  communications: [{
    type: { type: String, enum: ['email', 'call', 'sms', 'linkedin', 'meeting', 'other'], required: true },
    direction: { type: String, enum: ['inbound', 'outbound'], required: true },
    subject: String,
    content: String,
    fromEmail: String,
    toEmail: String,
    ccEmails: [String],
    templateUsed: String,
    sentAt: Date,
    receivedAt: Date,
    readAt: Date,
    replied: { type: Boolean, default: false },
    attachments: [String],
    metadata: Schema.Types.Mixed
  }],
  
  notes: [{
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['general', 'interview', 'screening', 'reference', 'offer', 'internal'], default: 'general' },
    isPrivate: { type: Boolean, default: false },
    tags: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  
  team: {
    recruiter: String,
    hiringManager: String,
    interviewers: [String],
    coordinator: String,
    
    assignments: [{
      userId: { type: String, required: true },
      userName: { type: String, required: true },
      role: { type: String, enum: ['recruiter', 'hiring_manager', 'interviewer', 'coordinator', 'decision_maker'], required: true },
      assignedAt: { type: Date, default: Date.now },
      permissions: [String]
    }]
  },
  
  metrics: {
    timeInPipeline: { type: Number, default: 0 },
    timeInCurrentStage: { type: Number, default: 0 },
    responseTime: Number,
    interviewerRatings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      distribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 }
      }
    },
    
    stages: Schema.Types.Mixed
  },
  
  references: [{
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    company: String,
    position: String,
    email: String,
    phone: String,
    contacted: { type: Boolean, default: false },
    contactedAt: Date,
    response: {
      technical: { type: Number, min: 1, max: 5 },
      reliability: { type: Number, min: 1, max: 5 },
      teamwork: { type: Number, min: 1, max: 5 },
      overall: { type: Number, min: 1, max: 5 },
      wouldRehire: Boolean,
      comments: String,
      redFlags: [String]
    }
  }],
  
  backgroundCheck: {
    required: { type: Boolean, default: false },
    provider: String,
    initiatedAt: Date,
    completedAt: Date,
    status: { type: String, enum: ['not_started', 'in_progress', 'completed', 'failed', 'discrepancy_found'], default: 'not_started' },
    results: {
      identity: { type: String, enum: ['clear', 'issue', 'failed'] },
      criminal: { type: String, enum: ['clear', 'issue', 'failed'] },
      employment: { type: String, enum: ['clear', 'issue', 'failed'] },
      education: { type: String, enum: ['clear', 'issue', 'failed'] },
      credit: { type: String, enum: ['clear', 'issue', 'failed'] },
      driving: { type: String, enum: ['clear', 'issue', 'failed'] },
      issues: [String],
      reportUrl: String
    }
  },
  
  createdBy: { type: String, required: true },
  tags: [String],
  starred: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastActivityAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Compound indexes for performance
ApplicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });
ApplicationSchema.index({ organizationId: 1 });
ApplicationSchema.index({ 'pipeline.status': 1 });
ApplicationSchema.index({ 'pipeline.currentStage': 1 });
ApplicationSchema.index({ 'team.recruiter': 1 });
ApplicationSchema.index({ 'team.hiringManager': 1 });
ApplicationSchema.index({ createdAt: -1 });
ApplicationSchema.index({ lastActivityAt: -1 });
ApplicationSchema.index({ 'aiInsights.candidateJobMatch.overallScore': -1 });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
