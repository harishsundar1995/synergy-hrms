import mongoose, { Document, Schema } from 'mongoose';

// Interview Type enumeration
export enum InterviewType {
  PHONE = 'phone',
  VIDEO = 'video',
  IN_PERSON = 'in_person',
  PANEL = 'panel',
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  FINAL = 'final'
}

// Interview Status enumeration
export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled'
}

// Recommendation enumeration
export enum Recommendation {
  STRONG_HIRE = 'strong_hire',
  HIRE = 'hire',
  MAYBE = 'maybe',
  NO_HIRE = 'no_hire',
  STRONG_NO_HIRE = 'strong_no_hire'
}

// Interviewer interface
interface IInterviewer {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: string;
}

// Feedback interface
interface IFeedback {
  overall: string;
  strengths: string[];
  concerns: string[];
  technicalSkills?: number; // 1-10 rating
  communicationSkills?: number; // 1-10 rating
  culturalFit?: number; // 1-10 rating
  problemSolving?: number; // 1-10 rating
  recommendation: Recommendation;
  detailedNotes?: string;
  followUpQuestions?: string[];
  submittedAt: Date;
  submittedBy: mongoose.Types.ObjectId;
}

// Interview Calendar Event interface
interface ICalendarEvent {
  eventId?: string; // Google Calendar/Outlook event ID
  meetingLink?: string;
  calendarProvider?: 'google' | 'outlook' | 'zoom' | 'teams' | 'other';
  roomBooking?: {
    roomId: string;
    roomName: string;
    building?: string;
    floor?: string;
  };
}

// Interview Preparation interface
interface IPreparation {
  interviewGuide?: string;
  questionsToAsk?: string[];
  candidateResume?: string; // URL to resume
  portfolioLinks?: string[];
  previousInterviewNotes?: string;
  focusAreas?: string[];
}

// Availability Slot interface
interface IAvailabilitySlot {
  startTime: Date;
  endTime: Date;
  interviewerId: mongoose.Types.ObjectId;
  isAvailable: boolean;
}

// Interview Document interface
export interface IInterview extends Document {
  // Core Information
  candidate: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  application?: mongoose.Types.ObjectId;
  
  // Interview Details
  type: InterviewType;
  round: number;
  status: InterviewStatus;
  title?: string;
  description?: string;
  
  // Scheduling
  scheduledAt: Date;
  duration: number; // in minutes
  timezone: string;
  buffer?: {
    before: number; // minutes
    after: number; // minutes
  };
  
  // Location & Meeting
  location?: string;
  isRemote: boolean;
  calendar: ICalendarEvent;
  
  // Participants
  interviewers: IInterviewer[];
  coordinatedBy?: mongoose.Types.ObjectId; // HR/Recruiter who scheduled
  
  // Preparation & Materials
  preparation: IPreparation;
  
  // Results & Feedback
  feedback?: IFeedback[];
  overallRating?: number; // Calculated from all feedback
  finalDecision?: 'proceed' | 'reject' | 'on_hold';
  
  // Communication
  remindersSent?: {
    candidate: Date[];
    interviewers: Date[];
  };
  confirmationReceived?: {
    candidate?: Date;
    interviewers?: mongoose.Types.ObjectId[];
  };
  
  // Rescheduling History
  rescheduleHistory?: Array<{
    originalDate: Date;
    newDate: Date;
    reason: string;
    requestedBy: 'candidate' | 'interviewer' | 'coordinator';
    requestedAt: Date;
  }>;
  
  // AI Analysis
  aiInsights?: {
    scheduleOptimization?: string;
    interviewerMatch?: string;
    candidatePreparation?: string;
    riskAssessment?: string;
    successPrediction?: number; // 0-100%
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  
  // Methods
  canReschedule(): boolean;
  calculateOverallRating(): number;
  generateCalendarEvent(): object;
  sendReminders(): Promise<void>;
}

// Interview Schema
const InterviewSchema = new Schema<IInterview>({
  // Core Information
  candidate: {
    type: Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
    index: true
  },
  job: {
    type: Schema.Types.ObjectId,
    ref: 'JobDescription',
    required: true,
    index: true
  },
  application: {
    type: Schema.Types.ObjectId,
    ref: 'Application'
  },
  
  // Interview Details
  type: {
    type: String,
    enum: Object.values(InterviewType),
    required: true,
    index: true
  },
  round: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  status: {
    type: String,
    enum: Object.values(InterviewStatus),
    default: InterviewStatus.SCHEDULED,
    index: true
  },
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Scheduling
  scheduledAt: {
    type: Date,
    required: true,
    index: true
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 480 // 8 hours max
  },
  timezone: {
    type: String,
    required: true,
    default: 'UTC'
  },
  buffer: {
    before: {
      type: Number,
      default: 5
    },
    after: {
      type: Number,
      default: 5
    }
  },
  
  // Location & Meeting
  location: {
    type: String,
    trim: true
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  calendar: {
    eventId: String,
    meetingLink: String,
    calendarProvider: {
      type: String,
      enum: ['google', 'outlook', 'zoom', 'teams', 'other']
    },
    roomBooking: {
      roomId: String,
      roomName: String,
      building: String,
      floor: String
    }
  },
  
  // Participants
  interviewers: [{
    _id: {
      type: Schema.Types.ObjectId,
      required: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      trim: true
    }
  }],
  coordinatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Preparation & Materials
  preparation: {
    interviewGuide: String,
    questionsToAsk: [String],
    candidateResume: String,
    portfolioLinks: [String],
    previousInterviewNotes: String,
    focusAreas: [String]
  },
  
  // Results & Feedback
  feedback: [{
    overall: {
      type: String,
      required: true
    },
    strengths: [String],
    concerns: [String],
    technicalSkills: {
      type: Number,
      min: 1,
      max: 10
    },
    communicationSkills: {
      type: Number,
      min: 1,
      max: 10
    },
    culturalFit: {
      type: Number,
      min: 1,
      max: 10
    },
    problemSolving: {
      type: Number,
      min: 1,
      max: 10
    },
    recommendation: {
      type: String,
      enum: Object.values(Recommendation),
      required: true
    },
    detailedNotes: String,
    followUpQuestions: [String],
    submittedAt: {
      type: Date,
      default: Date.now
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  overallRating: {
    type: Number,
    min: 0,
    max: 10
  },
  finalDecision: {
    type: String,
    enum: ['proceed', 'reject', 'on_hold']
  },
  
  // Communication
  remindersSent: {
    candidate: [Date],
    interviewers: [Date]
  },
  confirmationReceived: {
    candidate: Date,
    interviewers: [Schema.Types.ObjectId]
  },
  
  // Rescheduling History
  rescheduleHistory: [{
    originalDate: {
      type: Date,
      required: true
    },
    newDate: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    requestedBy: {
      type: String,
      enum: ['candidate', 'interviewer', 'coordinator'],
      required: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // AI Analysis
  aiInsights: {
    scheduleOptimization: String,
    interviewerMatch: String,
    candidatePreparation: String,
    riskAssessment: String,
    successPrediction: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // Metadata
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for efficient queries
InterviewSchema.index({ candidate: 1, job: 1 });
InterviewSchema.index({ scheduledAt: 1, status: 1 });
InterviewSchema.index({ 'interviewers._id': 1, scheduledAt: 1 });
InterviewSchema.index({ type: 1, round: 1 });
InterviewSchema.index({ createdAt: -1 });

// Virtual for end time
InterviewSchema.virtual('endTime').get(function() {
  return new Date(this.scheduledAt.getTime() + (this.duration * 60000));
});

// Instance Methods
InterviewSchema.methods.canReschedule = function(): boolean {
  const now = new Date();
  const scheduledTime = new Date(this.scheduledAt);
  const hoursUntilInterview = (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return this.status === InterviewStatus.SCHEDULED && hoursUntilInterview >= 24;
};

InterviewSchema.methods.calculateOverallRating = function(): number {
  if (!this.feedback || this.feedback.length === 0) return 0;
  
  const ratings = this.feedback.map((fb: IFeedback) => {
    const skills = [
      fb.technicalSkills,
      fb.communicationSkills,
      fb.culturalFit,
      fb.problemSolving
    ].filter(rating => rating !== undefined);
    
    return skills.length > 0 ? skills.reduce((sum: number, rating) => sum + rating!, 0) / skills.length : 5;
  });
  
  const averageRating = ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length;
  this.overallRating = Math.round(averageRating * 100) / 100;
  
  return this.overallRating;
};

InterviewSchema.methods.generateCalendarEvent = function(): object {
  const startTime = new Date(this.scheduledAt);
  const endTime = new Date(startTime.getTime() + (this.duration * 60000));
  
  return {
    summary: `Interview: ${this.candidate.firstName} ${this.candidate.lastName} - ${this.job.title}`,
    description: `${this.type.replace('_', ' ')} interview (Round ${this.round})\n\n${this.description || ''}`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: this.timezone
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: this.timezone
    },
    attendees: [
      { email: this.candidate.email },
      ...this.interviewers.map((i: IInterviewer) => ({ email: i.email }))
    ],
    location: this.location || this.calendar.meetingLink || 'Video Call',
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 30 }       // 30 minutes before
      ]
    }
  };
};

InterviewSchema.methods.sendReminders = async function(): Promise<void> {
  // TODO: Implement email/SMS reminder logic
  // This would integrate with email services like SendGrid, AWS SES, etc.
  console.log(`Sending reminders for interview ${this._id}`);
};

// Static Methods
InterviewSchema.statics.findUpcoming = function(days: number = 7) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return this.find({
    scheduledAt: { $gte: now, $lte: futureDate },
    status: InterviewStatus.SCHEDULED
  }).populate('candidate job');
};

InterviewSchema.statics.findByInterviewer = function(interviewerId: string) {
  return this.find({
    'interviewers._id': interviewerId,
    status: { $in: [InterviewStatus.SCHEDULED, InterviewStatus.COMPLETED] }
  }).populate('candidate job');
};

InterviewSchema.statics.getAvailableSlots = function(
  interviewerIds: string[],
  startDate: Date,
  endDate: Date,
  duration: number
) {
  // TODO: Implement availability calculation
  // This would check existing interviews and calculate free slots
  return [];
};

// Pre-save middleware
InterviewSchema.pre('save', function(next) {
  if (this.isModified('feedback')) {
    this.calculateOverallRating();
  }
  next();
});

// Export the model
export const Interview = mongoose.model<IInterview>('Interview', InterviewSchema);
export default Interview;
