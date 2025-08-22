import express, { Request, Response, NextFunction } from 'express';
import { Interview, InterviewType, InterviewStatus, Recommendation } from '../models/Interview';

const router = express.Router();

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

// Simple auth middleware for development
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Mock authentication - in production, validate JWT token
  req.user = { id: '66c4a1b2f8d3e12345678905', email: 'admin@company.com' };
  next();
};

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Mock data for development
const mockInterviews = [
  {
    _id: '66c4a1b2f8d3e12345678901',
    candidate: {
      _id: '66c4a1b2f8d3e12345678902',
      firstName: 'Emily',
      lastName: 'Watson',
      email: 'emily.watson@email.com',
      profilePicture: null
    },
    job: {
      _id: '66c4a1b2f8d3e12345678903',
      title: 'Senior Frontend Developer',
      department: 'Engineering'
    },
    type: InterviewType.VIDEO,
    round: 1,
    status: InterviewStatus.SCHEDULED,
    title: 'Technical Interview - React & TypeScript',
    scheduledAt: new Date('2024-08-22T14:00:00Z'),
    duration: 60,
    timezone: 'UTC',
    isRemote: true,
    calendar: {
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      calendarProvider: 'google'
    },
    interviewers: [
      {
        _id: '66c4a1b2f8d3e12345678904',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@company.com',
        role: 'Engineering Manager',
        department: 'Engineering'
      }
    ],
    preparation: {
      questionsToAsk: [
        'Explain React hooks and their benefits',
        'How do you handle state management in large applications?',
        'What are your thoughts on TypeScript vs JavaScript?'
      ],
      focusAreas: ['React', 'TypeScript', 'State Management', 'Component Architecture']
    },
    aiInsights: {
      successPrediction: 85,
      candidatePreparation: 'Candidate has strong React experience based on portfolio review',
      interviewerMatch: 'Good technical match - John has 5+ years React experience'
    },
    createdAt: new Date('2024-08-20T10:00:00Z'),
    updatedAt: new Date('2024-08-20T10:00:00Z'),
    createdBy: '66c4a1b2f8d3e12345678905'
  },
  {
    _id: '66c4a1b2f8d3e12345678906',
    candidate: {
      _id: '66c4a1b2f8d3e12345678907',
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@email.com',
      profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b193?w=150&h=150&fit=crop&crop=face'
    },
    job: {
      _id: '66c4a1b2f8d3e12345678908',
      title: 'Senior Backend Developer',
      department: 'Engineering'
    },
    type: InterviewType.PANEL,
    round: 2,
    status: InterviewStatus.COMPLETED,
    title: 'Technical Panel Interview - System Design',
    scheduledAt: new Date('2024-08-21T10:30:00Z'),
    duration: 90,
    timezone: 'UTC',
    isRemote: false,
    location: 'Conference Room A - Building 1, Floor 3',
    calendar: {
      roomBooking: {
        roomId: 'conf-room-a',
        roomName: 'Conference Room A',
        building: 'Building 1',
        floor: '3rd Floor'
      }
    },
    interviewers: [
      {
        _id: '66c4a1b2f8d3e12345678909',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@company.com',
        role: 'Senior Developer',
        department: 'Engineering'
      },
      {
        _id: '66c4a1b2f8d3e12345678910',
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@company.com',
        role: 'Tech Lead',
        department: 'Engineering'
      }
    ],
    preparation: {
      questionsToAsk: [
        'Design a scalable chat application',
        'How would you handle database sharding?',
        'Explain microservices architecture patterns'
      ],
      focusAreas: ['System Design', 'Database Architecture', 'Microservices', 'Scalability']
    },
    feedback: [
      {
        overall: 'Excellent candidate with strong technical skills and system design knowledge',
        strengths: [
          'Deep knowledge of Python and backend frameworks',
          'Great problem-solving approach to system design',
          'Good communication and collaboration skills',
          'Strong understanding of database optimization'
        ],
        concerns: [
          'Limited experience with Kubernetes',
          'Could improve knowledge of monitoring tools'
        ],
        technicalSkills: 9,
        communicationSkills: 8,
        culturalFit: 9,
        problemSolving: 9,
        recommendation: Recommendation.STRONG_HIRE,
        detailedNotes: 'Sarah demonstrated exceptional system design skills during the whiteboard session. Her approach to scaling was methodical and well-thought-out.',
        submittedAt: new Date('2024-08-21T12:00:00Z'),
        submittedBy: '66c4a1b2f8d3e12345678909'
      }
    ],
    overallRating: 8.75,
    finalDecision: 'proceed',
    aiInsights: {
      successPrediction: 92,
      candidatePreparation: 'Candidate well-prepared with strong system design background',
      interviewerMatch: 'Excellent panel composition for technical assessment'
    },
    createdAt: new Date('2024-08-19T15:30:00Z'),
    updatedAt: new Date('2024-08-21T12:15:00Z'),
    createdBy: '66c4a1b2f8d3e12345678905'
  },
  {
    _id: '66c4a1b2f8d3e12345678911',
    candidate: {
      _id: '66c4a1b2f8d3e12345678912',
      firstName: 'Michael',
      lastName: 'Rodriguez',
      email: 'michael.rodriguez@email.com'
    },
    job: {
      _id: '66c4a1b2f8d3e12345678913',
      title: 'Senior Product Manager',
      department: 'Product'
    },
    type: InterviewType.BEHAVIORAL,
    round: 1,
    status: InterviewStatus.SCHEDULED,
    title: 'Behavioral Interview - Leadership & Strategy',
    scheduledAt: new Date('2024-08-23T16:00:00Z'),
    duration: 45,
    timezone: 'UTC',
    isRemote: true,
    calendar: {
      meetingLink: 'https://zoom.us/j/123456789',
      calendarProvider: 'zoom'
    },
    interviewers: [
      {
        _id: '66c4a1b2f8d3e12345678914',
        firstName: 'Lisa',
        lastName: 'Davis',
        email: 'lisa.davis@company.com',
        role: 'VP Product',
        department: 'Product'
      }
    ],
    preparation: {
      questionsToAsk: [
        'Tell me about a time you had to make a difficult product decision',
        'How do you prioritize features when resources are limited?',
        'Describe your approach to stakeholder management'
      ],
      focusAreas: ['Product Strategy', 'Leadership', 'Stakeholder Management', 'Decision Making'],
      candidateResume: 'https://example.com/resumes/michael-rodriguez.pdf'
    },
    aiInsights: {
      successPrediction: 78,
      candidatePreparation: 'Strong product management background, previous leadership roles',
      interviewerMatch: 'Good match - Lisa has experience evaluating senior PM candidates'
    },
    remindersSent: {
      candidate: [new Date('2024-08-22T16:00:00Z')],
      interviewers: [new Date('2024-08-22T16:00:00Z')]
    },
    createdAt: new Date('2024-08-20T09:15:00Z'),
    updatedAt: new Date('2024-08-20T09:15:00Z'),
    createdBy: '66c4a1b2f8d3e12345678905'
  },
  {
    _id: '66c4a1b2f8d3e12345678915',
    candidate: {
      _id: '66c4a1b2f8d3e12345678916',
      firstName: 'Jennifer',
      lastName: 'Kim',
      email: 'jennifer.kim@email.com',
      profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    job: {
      _id: '66c4a1b2f8d3e12345678917',
      title: 'UX Designer',
      department: 'Design'
    },
    type: InterviewType.TECHNICAL,
    round: 1,
    status: InterviewStatus.CANCELLED,
    title: 'Design Portfolio Review',
    scheduledAt: new Date('2024-08-20T14:00:00Z'),
    duration: 60,
    timezone: 'UTC',
    isRemote: true,
    calendar: {
      meetingLink: 'https://meet.google.com/xyz-abcd-efg',
      calendarProvider: 'google'
    },
    interviewers: [
      {
        _id: '66c4a1b2f8d3e12345678918',
        firstName: 'Mark',
        lastName: 'Thompson',
        email: 'mark.thompson@company.com',
        role: 'Design Lead',
        department: 'Design'
      }
    ],
    rescheduleHistory: [
      {
        originalDate: new Date('2024-08-20T14:00:00Z'),
        newDate: new Date('2024-08-24T15:00:00Z'),
        reason: 'Candidate requested reschedule due to emergency',
        requestedBy: 'candidate',
        requestedAt: new Date('2024-08-19T10:30:00Z')
      }
    ],
    createdAt: new Date('2024-08-18T11:20:00Z'),
    updatedAt: new Date('2024-08-19T10:35:00Z'),
    createdBy: '66c4a1b2f8d3e12345678905'
  },
  {
    _id: '66c4a1b2f8d3e12345678919',
    candidate: {
      _id: '66c4a1b2f8d3e12345678920',
      firstName: 'David',
      lastName: 'Park',
      email: 'david.park@email.com'
    },
    job: {
      _id: '66c4a1b2f8d3e12345678921',
      title: 'Data Scientist',
      department: 'Analytics'
    },
    type: InterviewType.FINAL,
    round: 3,
    status: InterviewStatus.SCHEDULED,
    title: 'Final Round - Executive Interview',
    scheduledAt: new Date('2024-08-24T11:00:00Z'),
    duration: 30,
    timezone: 'UTC',
    isRemote: false,
    location: 'Executive Conference Room - Building 2, Floor 5',
    calendar: {
      roomBooking: {
        roomId: 'exec-conf-room',
        roomName: 'Executive Conference Room',
        building: 'Building 2',
        floor: '5th Floor'
      }
    },
    interviewers: [
      {
        _id: '66c4a1b2f8d3e12345678922',
        firstName: 'Amanda',
        lastName: 'Foster',
        email: 'amanda.foster@company.com',
        role: 'CTO',
        department: 'Engineering'
      }
    ],
    preparation: {
      questionsToAsk: [
        'What interests you most about our company vision?',
        'Where do you see yourself in 3-5 years?',
        'What questions do you have for me?'
      ],
      focusAreas: ['Culture Fit', 'Long-term Goals', 'Company Vision Alignment'],
      previousInterviewNotes: 'Passed technical and behavioral rounds with strong recommendations'
    },
    aiInsights: {
      successPrediction: 95,
      candidatePreparation: 'Excellent performance in previous rounds, high likelihood of success',
      interviewerMatch: 'Perfect for final culture and vision alignment assessment'
    },
    createdAt: new Date('2024-08-21T14:45:00Z'),
    updatedAt: new Date('2024-08-21T14:45:00Z'),
    createdBy: '66c4a1b2f8d3e12345678905'
  }
];

// GET /api/interviews - Get all interviews with filtering and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      search,
      startDate,
      endDate,
      interviewerId,
      candidateId,
      jobId
    } = req.query;

    // For now, return mock data with filtering
    let filteredInterviews = [...mockInterviews];

    // Apply filters
    if (status && status !== 'all') {
      filteredInterviews = filteredInterviews.filter(interview => interview.status === status);
    }

    if (type) {
      filteredInterviews = filteredInterviews.filter(interview => interview.type === type);
    }

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredInterviews = filteredInterviews.filter(interview =>
        interview.candidate.firstName.toLowerCase().includes(searchTerm) ||
        interview.candidate.lastName.toLowerCase().includes(searchTerm) ||
        interview.job.title.toLowerCase().includes(searchTerm) ||
        interview.job.department.toLowerCase().includes(searchTerm)
      );
    }

    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      filteredInterviews = filteredInterviews.filter(interview => {
        const interviewDate = new Date(interview.scheduledAt);
        return interviewDate >= start && interviewDate <= end;
      });
    }

    if (interviewerId) {
      filteredInterviews = filteredInterviews.filter(interview =>
        interview.interviewers.some(interviewer => interviewer._id === interviewerId)
      );
    }

    if (candidateId) {
      filteredInterviews = filteredInterviews.filter(interview => interview.candidate._id === candidateId);
    }

    if (jobId) {
      filteredInterviews = filteredInterviews.filter(interview => interview.job._id === jobId);
    }

    // Sort by scheduled date (newest first)
    filteredInterviews.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    // Implement pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedInterviews = filteredInterviews.slice(startIndex, endIndex);

    // Calculate stats for response
    const totalInterviews = filteredInterviews.length;
    const totalPages = Math.ceil(totalInterviews / limitNum);

    // Generate dashboard stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayInterviews = mockInterviews.filter(interview => {
      const interviewDate = new Date(interview.scheduledAt);
      return interviewDate >= today && interviewDate < tomorrow && interview.status === InterviewStatus.SCHEDULED;
    }).length;

    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
    const nextWeek = new Date(thisWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const weekInterviews = mockInterviews.filter(interview => {
      const interviewDate = new Date(interview.scheduledAt);
      return interviewDate >= thisWeek && interviewDate < nextWeek;
    }).length;

    const completedInterviews = mockInterviews.filter(interview => interview.status === InterviewStatus.COMPLETED).length;
    const totalScheduled = mockInterviews.filter(interview => 
      interview.status === InterviewStatus.SCHEDULED || interview.status === InterviewStatus.COMPLETED
    ).length;
    const completionRate = totalScheduled > 0 ? Math.round((completedInterviews / totalScheduled) * 100) : 0;

    const avgDuration = mockInterviews.length > 0 
      ? Math.round(mockInterviews.reduce((sum, interview) => sum + interview.duration, 0) / mockInterviews.length)
      : 0;

    res.json({
      interviews: paginatedInterviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalInterviews,
        pages: totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      stats: {
        todayInterviews,
        weekInterviews,
        completionRate,
        avgDuration
      }
    });

  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

// GET /api/interviews/:id - Get specific interview
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const interview = mockInterviews.find(interview => interview._id === id);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    return res.json(interview);

  } catch (error) {
    console.error('Error fetching interview:', error);
    return res.status(500).json({ error: 'Failed to fetch interview' });
  }
});

// POST /api/interviews - Create new interview
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      candidateId,
      jobId,
      type,
      round,
      title,
      scheduledAt,
      duration,
      timezone = 'UTC',
      location,
      isRemote = false,
      meetingLink,
      interviewers,
      preparation,
      notes
    } = req.body;

    // Basic validation
    if (!candidateId || !jobId || !type || !round || !scheduledAt || !duration || !interviewers?.length) {
      return res.status(400).json({ 
        error: 'Missing required fields: candidateId, jobId, type, round, scheduledAt, duration, interviewers' 
      });
    }

    // Create new interview object
    const newInterview = {
      _id: `66c4a1b2f8d3e12345${Date.now()}`,
      candidate: {
        _id: candidateId,
        firstName: 'New',
        lastName: 'Candidate',
        email: 'candidate@email.com'
      },
      job: {
        _id: jobId,
        title: 'Job Title',
        department: 'Department'
      },
      type,
      round,
      status: InterviewStatus.SCHEDULED,
      title: title || `${type.replace('_', ' ')} Interview - Round ${round}`,
      scheduledAt: new Date(scheduledAt),
      duration,
      timezone,
      location,
      isRemote,
      calendar: {
        meetingLink,
        calendarProvider: meetingLink?.includes('zoom') ? 'zoom' : 
                         meetingLink?.includes('teams') ? 'teams' : 'google'
      },
      interviewers: interviewers.map((interviewer: { _id?: string; firstName: string; lastName: string; email: string; role: string; department: string }) => ({
        _id: interviewer._id || `interviewer_${Date.now()}`,
        firstName: interviewer.firstName,
        lastName: interviewer.lastName,
        email: interviewer.email,
        role: interviewer.role,
        department: interviewer.department
      })),
      preparation: preparation || {},
      aiInsights: {
        successPrediction: Math.floor(Math.random() * 30) + 70, // 70-100%
        candidatePreparation: 'AI analysis will be completed shortly',
        interviewerMatch: 'Good match based on role requirements'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user?.id || 'unknown'
    };

    // In a real implementation, save to database
    // const savedInterview = await Interview.create(newInterview);

    return res.status(201).json(newInterview);

  } catch (error) {
    console.error('Error creating interview:', error);
    return res.status(500).json({ error: 'Failed to create interview' });
  }
});

// PUT /api/interviews/:id - Update interview
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const interviewIndex = mockInterviews.findIndex(interview => interview._id === id);
    
    if (interviewIndex === -1) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Update the interview
    const updatedInterview = {
      ...mockInterviews[interviewIndex],
      ...updates,
      updatedAt: new Date()
    };

    mockInterviews[interviewIndex] = updatedInterview;

    return res.json(updatedInterview);

  } catch (error) {
    console.error('Error updating interview:', error);
    return res.status(500).json({ error: 'Failed to update interview' });
  }
});

// POST /api/interviews/:id/feedback - Add feedback to interview
router.post('/:id/feedback', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      overall,
      strengths,
      concerns,
      technicalSkills,
      communicationSkills,
      culturalFit,
      problemSolving,
      recommendation,
      detailedNotes,
      followUpQuestions
    } = req.body;

    const interviewIndex = mockInterviews.findIndex(interview => interview._id === id);
    
    if (interviewIndex === -1) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Create feedback object
    const feedback = {
      overall,
      strengths: strengths || [],
      concerns: concerns || [],
      technicalSkills,
      communicationSkills,
      culturalFit,
      problemSolving,
      recommendation,
      detailedNotes,
      followUpQuestions: followUpQuestions || [],
      submittedAt: new Date(),
      submittedBy: req.user?.id || 'unknown'
    };

    // Add feedback to interview
    if (!mockInterviews[interviewIndex].feedback) {
      (mockInterviews[interviewIndex] as Record<string, unknown>).feedback = [];
    }
    mockInterviews[interviewIndex].feedback!.push(feedback);

    // Calculate overall rating
    const allFeedback = mockInterviews[interviewIndex].feedback!;
    const avgRating = allFeedback.reduce((sum, fb) => {
      const skills = [fb.technicalSkills, fb.communicationSkills, fb.culturalFit, fb.problemSolving]
        .filter(rating => rating !== undefined) as number[];
      const fbAvg = skills.length > 0 ? skills.reduce((s, r) => s + r, 0) / skills.length : 5;
      return sum + fbAvg;
    }, 0) / allFeedback.length;

    mockInterviews[interviewIndex].overallRating = Math.round(avgRating * 100) / 100;
    mockInterviews[interviewIndex].status = InterviewStatus.COMPLETED;
    mockInterviews[interviewIndex].updatedAt = new Date();

    return res.json(mockInterviews[interviewIndex]);

  } catch (error) {
    console.error('Error adding feedback:', error);
    return res.status(500).json({ error: 'Failed to add feedback' });
  }
});

// POST /api/interviews/:id/reschedule - Reschedule interview
router.post('/:id/reschedule', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newDate, reason, requestedBy = 'coordinator' } = req.body;

    const interviewIndex = mockInterviews.findIndex(interview => interview._id === id);
    
    if (interviewIndex === -1) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const interview = mockInterviews[interviewIndex];

    // Check if interview can be rescheduled
    if (interview.status !== InterviewStatus.SCHEDULED) {
      return res.status(400).json({ error: 'Only scheduled interviews can be rescheduled' });
    }

    // Add to reschedule history
    if (!interview.rescheduleHistory) {
      (interview as Record<string, unknown>).rescheduleHistory = [];
    }

    interview.rescheduleHistory!.push({
      originalDate: interview.scheduledAt,
      newDate: new Date(newDate),
      reason,
      requestedBy,
      requestedAt: new Date()
    });

    // Update scheduled date
    interview.scheduledAt = new Date(newDate);
    interview.updatedAt = new Date();

    mockInterviews[interviewIndex] = interview;

    return res.json(interview);

  } catch (error) {
    console.error('Error rescheduling interview:', error);
    return res.status(500).json({ error: 'Failed to reschedule interview' });
  }
});

// DELETE /api/interviews/:id - Cancel/Delete interview
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by coordinator' } = req.body;

    const interviewIndex = mockInterviews.findIndex(interview => interview._id === id);
    
    if (interviewIndex === -1) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Update status to cancelled instead of deleting
    mockInterviews[interviewIndex].status = InterviewStatus.CANCELLED;
    mockInterviews[interviewIndex].updatedAt = new Date();

    return res.json({ message: 'Interview cancelled successfully', interview: mockInterviews[interviewIndex] });

  } catch (error) {
    console.error('Error cancelling interview:', error);
    return res.status(500).json({ error: 'Failed to cancel interview' });
  }
});

// GET /api/interviews/calendar/upcoming - Get upcoming interviews for calendar view
router.get('/calendar/upcoming', async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    
    const now = new Date();
    const futureDate = new Date(now.getTime() + (parseInt(days as string) * 24 * 60 * 60 * 1000));

    const upcomingInterviews = mockInterviews
      .filter(interview => {
        const interviewDate = new Date(interview.scheduledAt);
        return interviewDate >= now && 
               interviewDate <= futureDate && 
               interview.status === InterviewStatus.SCHEDULED;
      })
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    res.json(upcomingInterviews);

  } catch (error) {
    console.error('Error fetching upcoming interviews:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming interviews' });
  }
});

export default router;
