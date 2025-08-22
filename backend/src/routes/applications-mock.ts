import { Router, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Mock application data
const mockApplications = [
  {
    _id: '1',
    candidateId: {
      _id: '1',
      firstName: 'Emily',
      lastName: 'Watson',
      email: 'emily.watson@email.com',
      location: 'New York, NY',
      experience: 5,
      profilePicture: null
    },
    jobDescriptionId: {
      _id: '1',
      title: 'Senior Frontend Developer',
      department: 'Engineering'
    },
    pipeline: {
      currentStage: 'screening',
      priority: 'medium'
    },
    aiInsights: {
      candidateJobMatch: {
        overallScore: 75
      },
      hiringRecommendation: {
        recommendation: 'maybe',
        confidence: 72
      }
    },
    appliedDate: '2024-01-12T11:45:00Z',
    timeInStage: 3
  },
  {
    _id: '2',
    candidateId: {
      _id: '2',
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@email.com',
      profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b193?w=150&h=150&fit=crop&crop=face',
      location: 'San Francisco, CA',
      experience: 6
    },
    jobDescriptionId: {
      _id: '2',
      title: 'Senior Backend Developer',
      department: 'Engineering'
    },
    pipeline: {
      currentStage: 'interview',
      priority: 'high'
    },
    aiInsights: {
      candidateJobMatch: {
        overallScore: 92
      },
      hiringRecommendation: {
        recommendation: 'strong_hire',
        confidence: 89
      }
    },
    appliedDate: '2024-01-15T10:30:00Z',
    timeInStage: 6
  },
  {
    _id: '3',
    candidateId: {
      _id: '3',
      firstName: 'Michael',
      lastName: 'Rodriguez',
      email: 'michael.rodriguez@email.com',
      location: 'Austin, TX',
      experience: 8,
      profilePicture: null
    },
    jobDescriptionId: {
      _id: '3',
      title: 'Senior Product Manager',
      department: 'Product'
    },
    pipeline: {
      currentStage: 'assessment',
      priority: 'high'
    },
    aiInsights: {
      candidateJobMatch: {
        overallScore: 88
      },
      hiringRecommendation: {
        recommendation: 'hire',
        confidence: 85
      }
    },
    appliedDate: '2024-01-10T09:15:00Z',
    timeInStage: 5
  }
];

// @route   GET /api/applications
// @desc    Get all applications with pipeline stages
// @access  Private
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('📋 Fetching applications for:', req.dbUser?.email);
    
    const { stage, jobId, search, priority } = req.query;

    let filteredApplications = [...mockApplications];

    // Apply filters
    if (stage && stage !== 'all') {
      filteredApplications = filteredApplications.filter(app => app.pipeline.currentStage === stage);
    }

    if (jobId && jobId !== 'all') {
      filteredApplications = filteredApplications.filter(app => app.jobDescriptionId._id === jobId);
    }

    if (priority && priority !== 'all') {
      filteredApplications = filteredApplications.filter(app => app.pipeline.priority === priority);
    }

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredApplications = filteredApplications.filter(app =>
        app.candidateId.firstName.toLowerCase().includes(searchTerm) ||
        app.candidateId.lastName.toLowerCase().includes(searchTerm) ||
        app.jobDescriptionId.title.toLowerCase().includes(searchTerm)
      );
    }

    // Calculate stage counts
    const stageStats = {
      applied: mockApplications.filter(app => app.pipeline.currentStage === 'applied').length,
      screening: mockApplications.filter(app => app.pipeline.currentStage === 'screening').length,
      interview: mockApplications.filter(app => app.pipeline.currentStage === 'interview').length,
      assessment: mockApplications.filter(app => app.pipeline.currentStage === 'assessment').length,
      offer: mockApplications.filter(app => app.pipeline.currentStage === 'offer').length,
      hired: mockApplications.filter(app => app.pipeline.currentStage === 'hired').length
    };

    res.json({
      success: true,
      data: {
        applications: filteredApplications,
        stageStats,
        summary: {
          total: mockApplications.length,
          active: mockApplications.length - stageStats.hired,
          inProgress: stageStats.screening + stageStats.interview + stageStats.assessment,
          offers: stageStats.offer
        }
      }
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch applications',
        code: 'FETCH_APPLICATIONS_ERROR'
      }
    });
  }
});

// @route   GET /api/applications/:id
// @desc    Get application by ID
// @access  Private
router.get('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const application = mockApplications.find(app => app._id === req.params.id);

    if (!application) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Application not found',
          code: 'APPLICATION_NOT_FOUND'
        }
      });
      return;
    }

    res.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch application',
        code: 'FETCH_APPLICATION_ERROR'
      }
    });
  }
});

// @route   PUT /api/applications/:id/stage
// @desc    Move application to different pipeline stage
// @access  Private
router.put('/:id/stage', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { stage, notes } = req.body;

    if (!stage) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Stage is required',
          code: 'MISSING_STAGE'
        }
      });
      return;
    }

    const applicationIndex = mockApplications.findIndex(app => app._id === req.params.id);

    if (applicationIndex === -1) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Application not found',
          code: 'APPLICATION_NOT_FOUND'
        }
      });
      return;
    }

    // Update the application stage
    mockApplications[applicationIndex].pipeline.currentStage = stage;

    res.json({
      success: true,
      data: mockApplications[applicationIndex],
      message: `Application moved to ${stage} stage`
    });

  } catch (error) {
    console.error('Error updating application stage:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update application stage',
        code: 'UPDATE_STAGE_ERROR'
      }
    });
  }
});

// @route   POST /api/applications/:id/ai-analysis
// @desc    Generate AI analysis for application
// @access  Private
router.post('/:id/ai-analysis', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const application = mockApplications.find(app => app._id === req.params.id);

    if (!application) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Application not found',
          code: 'APPLICATION_NOT_FOUND'
        }
      });
      return;
    }

    const mockAnalysis = {
      candidateJobMatch: {
        overallScore: Math.floor(Math.random() * 40) + 60,
        skillsAlignment: Math.floor(Math.random() * 30) + 70,
        experienceRelevance: Math.floor(Math.random() * 30) + 65,
        culturalFit: Math.floor(Math.random() * 25) + 75
      },
      hiringRecommendation: {
        recommendation: Math.random() > 0.3 ? 'hire' : 'maybe',
        confidence: Math.floor(Math.random() * 20) + 80,
        reasoning: [
          'Strong technical skills match job requirements',
          'Relevant industry experience',
          'Good cultural fit based on values alignment'
        ]
      },
      predictedSuccess: {
        score: Math.floor(Math.random() * 30) + 70,
        factors: [
          'Technical competency',
          'Communication skills',
          'Team collaboration'
        ]
      },
      concerns: [
        'Limited experience with specific technology stack',
        'May require onboarding time for domain knowledge'
      ],
      strengths: [
        'Strong problem-solving abilities',
        'Excellent communication skills',
        'Proven track record in similar roles'
      ]
    };

    res.json({
      success: true,
      data: mockAnalysis,
      message: 'AI analysis completed'
    });

  } catch (error) {
    console.error('Error generating AI analysis:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate AI analysis',
        code: 'AI_ANALYSIS_ERROR'
      }
    });
  }
});

export default router;
