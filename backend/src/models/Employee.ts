import { Schema, model, Document, Types } from 'mongoose';

export interface IEmployee extends Document {
  _id: Types.ObjectId;
  clerkId: string;
  employeeId: string;
  organizationId: Types.ObjectId;
  departmentId: Types.ObjectId;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: Date;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
      email?: string;
    };
  };
  employment: {
    position: string;
    level: 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'executive';
    status: 'active' | 'inactive' | 'onLeave' | 'terminated';
    startDate: Date;
    endDate?: Date;
    employmentType: 'fullTime' | 'partTime' | 'contract' | 'intern';
    salary?: {
      amount: number;
      currency: string;
      frequency: 'hourly' | 'monthly' | 'yearly';
    };
    workLocation: 'onsite' | 'remote' | 'hybrid';
    reportingManager?: Types.ObjectId;
    teamMembers?: Types.ObjectId[];
  };
  skills: {
    technical: string[];
    soft: string[];
    certifications: {
      name: string;
      issuingOrganization: string;
      dateObtained: Date;
      expiryDate?: Date;
      credentialId?: string;
    }[];
    languages: {
      language: string;
      proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
    }[];
  };
  performance: {
    currentRating?: number; // 1-5 scale
    lastReviewDate?: Date;
    nextReviewDate?: Date;
    goals: {
      title: string;
      description: string;
      status: 'pending' | 'inProgress' | 'completed' | 'cancelled';
      dueDate: Date;
      completedDate?: Date;
    }[];
    achievements: {
      title: string;
      description: string;
      date: Date;
      category: 'project' | 'skill' | 'leadership' | 'innovation' | 'other';
    }[];
  };
  wellbeing: {
    stressLevel?: number; // 1-10 scale
    workLifeBalance?: number; // 1-10 scale
    jobSatisfaction?: number; // 1-10 scale
    burnoutRisk?: 'low' | 'medium' | 'high';
    lastAssessmentDate?: Date;
    mentalHealthSupport?: {
      isActive: boolean;
      provider?: string;
      sessions?: number;
    };
  };
  benefits: {
    healthInsurance?: boolean;
    dentalInsurance?: boolean;
    visionInsurance?: boolean;
    retirementPlan?: boolean;
    paidTimeOff?: {
      totalDays: number;
      usedDays: number;
      remainingDays: number;
    };
    sickLeave?: {
      totalDays: number;
      usedDays: number;
      remainingDays: number;
    };
  };
  preferences: {
    communicationStyle: 'direct' | 'collaborative' | 'supportive' | 'analytical';
    workStyle: 'independent' | 'collaborative' | 'structured' | 'flexible';
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    timezone: string;
    workingHours: {
      start: string; // HH:MM format
      end: string;   // HH:MM format
    };
  };
  documents: {
    resume?: string; // File path or URL
    contracts?: string[];
    certifications?: string[];
    identityDocuments?: string[];
  };
  notes: {
    content: string;
    author: Types.ObjectId;
    date: Date;
    isPrivate: boolean;
    category: 'general' | 'performance' | 'disciplinary' | 'recognition' | 'development';
  }[];
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

const EmployeeSchema = new Schema<IEmployee>({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
    index: true
  },
  personalInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    dateOfBirth: Date,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    }
  },
  employment: {
    position: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ['intern', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive'],
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'onLeave', 'terminated'],
      default: 'active'
    },
    startDate: { type: Date, required: true },
    endDate: Date,
    employmentType: {
      type: String,
      enum: ['fullTime', 'partTime', 'contract', 'intern'],
      required: true
    },
    salary: {
      amount: Number,
      currency: { type: String, default: 'USD' },
      frequency: {
        type: String,
        enum: ['hourly', 'monthly', 'yearly'],
        default: 'yearly'
      }
    },
    workLocation: {
      type: String,
      enum: ['onsite', 'remote', 'hybrid'],
      required: true
    },
    reportingManager: {
      type: Schema.Types.ObjectId,
      ref: 'Employee'
    },
    teamMembers: [{
      type: Schema.Types.ObjectId,
      ref: 'Employee'
    }]
  },
  skills: {
    technical: [{ type: String, trim: true }],
    soft: [{ type: String, trim: true }],
    certifications: [{
      name: { type: String, required: true },
      issuingOrganization: { type: String, required: true },
      dateObtained: { type: Date, required: true },
      expiryDate: Date,
      credentialId: String
    }],
    languages: [{
      language: { type: String, required: true },
      proficiency: {
        type: String,
        enum: ['basic', 'intermediate', 'advanced', 'native'],
        required: true
      }
    }]
  },
  performance: {
    currentRating: {
      type: Number,
      min: 1,
      max: 5
    },
    lastReviewDate: Date,
    nextReviewDate: Date,
    goals: [{
      title: { type: String, required: true },
      description: String,
      status: {
        type: String,
        enum: ['pending', 'inProgress', 'completed', 'cancelled'],
        default: 'pending'
      },
      dueDate: { type: Date, required: true },
      completedDate: Date
    }],
    achievements: [{
      title: { type: String, required: true },
      description: String,
      date: { type: Date, required: true },
      category: {
        type: String,
        enum: ['project', 'skill', 'leadership', 'innovation', 'other'],
        required: true
      }
    }]
  },
  wellbeing: {
    stressLevel: {
      type: Number,
      min: 1,
      max: 10
    },
    workLifeBalance: {
      type: Number,
      min: 1,
      max: 10
    },
    jobSatisfaction: {
      type: Number,
      min: 1,
      max: 10
    },
    burnoutRisk: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    lastAssessmentDate: Date,
    mentalHealthSupport: {
      isActive: { type: Boolean, default: false },
      provider: String,
      sessions: Number
    }
  },
  benefits: {
    healthInsurance: Boolean,
    dentalInsurance: Boolean,
    visionInsurance: Boolean,
    retirementPlan: Boolean,
    paidTimeOff: {
      totalDays: Number,
      usedDays: { type: Number, default: 0 },
      remainingDays: Number
    },
    sickLeave: {
      totalDays: Number,
      usedDays: { type: Number, default: 0 },
      remainingDays: Number
    }
  },
  preferences: {
    communicationStyle: {
      type: String,
      enum: ['direct', 'collaborative', 'supportive', 'analytical']
    },
    workStyle: {
      type: String,
      enum: ['independent', 'collaborative', 'structured', 'flexible']
    },
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading']
    },
    timezone: String,
    workingHours: {
      start: String, // HH:MM format
      end: String    // HH:MM format
    }
  },
  documents: {
    resume: String,
    contracts: [String],
    certifications: [String],
    identityDocuments: [String]
  },
  notes: [{
    content: { type: String, required: true },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    date: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: false },
    category: {
      type: String,
      enum: ['general', 'performance', 'disciplinary', 'recognition', 'development'],
      default: 'general'
    }
  }],
  tags: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
EmployeeSchema.index({ 'personalInfo.email': 1 });
EmployeeSchema.index({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 });
EmployeeSchema.index({ 'employment.position': 1 });
EmployeeSchema.index({ 'employment.level': 1 });
EmployeeSchema.index({ 'employment.status': 1 });
EmployeeSchema.index({ 'employment.reportingManager': 1 });
EmployeeSchema.index({ 'wellbeing.burnoutRisk': 1 });
EmployeeSchema.index({ tags: 1 });
EmployeeSchema.index({ isActive: 1 });

// Virtual for full name
EmployeeSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for direct reports (team members)
EmployeeSchema.virtual('directReports', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'employment.reportingManager'
});

// Pre-save middleware to update remaining days for PTO and sick leave
EmployeeSchema.pre('save', function(next) {
  if (this.benefits?.paidTimeOff) {
    this.benefits.paidTimeOff.remainingDays = 
      this.benefits.paidTimeOff.totalDays - this.benefits.paidTimeOff.usedDays;
  }
  
  if (this.benefits?.sickLeave) {
    this.benefits.sickLeave.remainingDays = 
      this.benefits.sickLeave.totalDays - this.benefits.sickLeave.usedDays;
  }
  
  next();
});

export const Employee = model<IEmployee>('Employee', EmployeeSchema);
