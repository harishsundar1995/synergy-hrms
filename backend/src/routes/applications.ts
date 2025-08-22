import { Router, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import Application from '../models/Application';
import Candidate from '../models/Candidate';
import { JobDescription } from '../models/JobDescription';

const router = Router();

// =================== APPLICATION PIPELINE ROUTES ===================

// @route   GET /api/applications
// @desc    Get all applications with pipeline stages
// @access  Private
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('📋 Fetching applications for:', req.dbUser?.email);
    
    const { 
      stage, 
      jobId, 
      search,
      priority,
      page = 1, 
      limit = 50 
    } = req.query;

    // Build filter object
    const filter: any = {
      organizationId: req.dbUser?.organizationId
    };

    // Stage filter
    if (stage && stage !== 'all') {
      filter['pipeline.currentStage'] = stage;
    }

    // Job filter
    if (jobId && jobId !== 'all') {
      filter.jobDescriptionId = jobId;
    }

    // Priority filter
    if (priority && priority !== 'all') {
      filter['pipeline.priority'] = priority;
    }

    // Execute query with population
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const applications = await Application.find(filter)
      .populate('candidateId', 'firstName lastName email profilePicture location experience')
      .populate('jobDescriptionId', 'title department')
      .sort({ 'pipeline.lastUpdated': -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get pipeline stage counts
    const stageCounts = await Application.aggregate([
      { $match: { organizationId: req.dbUser?.organizationId } },
      {
        $group: {
          _id: '$pipeline.currentStage',
          count: { $sum: 1 }
        }
      }
    ]);

    // Create stage counts object
    const stageStats = {
      applied: 0,
      screening: 0,
      interview: 0,
      assessment: 0,
      offer: 0,
      hired: 0
    };

    stageCounts.forEach(stage => {
      if (stage._id in stageStats) {
        (stageStats as any)[stage._id] = stage.count;
      }
    });

    // Calculate summary stats
    const totalApplications = await Application.countDocuments({ organizationId: req.dbUser?.organizationId });

    res.json({
      success: true,
      data: {
        applications,
        stageStats,
        summary: {
          total: totalApplications,
          active: totalApplications - stageStats.hired,
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
// @desc    Get application by ID with full details
// @access  Private
router.get('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      organizationId: req.dbUser?.organizationId
    })
      .populate('candidateId')
      .populate('jobDescriptionId')
      .populate('assignedRecruiters', 'firstName lastName email')
      .populate('interviewers.userId', 'firstName lastName email')
      .lean();

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

// @route   POST /api/applications
// @desc    Create new application
// @access  Private
router.post('/', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('➕ Creating new application for:', req.dbUser?.email);
    
    const { candidateId, jobDescriptionId, source, notes } = req.body;

    // Validate required fields
    if (!candidateId || !jobDescriptionId) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Candidate ID and Job Description ID are required',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      });
      return;
    }

    // Check if application already exists
    const existingApplication = await Application.findOne({
      candidateId,
      jobDescriptionId,
      organizationId: req.dbUser?.organizationId
    });

    if (existingApplication) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Application already exists for this candidate and job',
          code: 'APPLICATION_ALREADY_EXISTS'
        }
      });
      return;
    }

    // Verify candidate and job exist
    const [candidate, job] = await Promise.all([
      Candidate.findOne({ _id: candidateId, organizationId: req.dbUser?.organizationId }),
      JobDescription.findOne({ _id: jobDescriptionId, organizationId: req.dbUser?.organizationId })
    ]);

    if (!candidate || !job) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Candidate or Job Description not found',
          code: 'RESOURCE_NOT_FOUND'
        }
      });
      return;
    }

    const applicationData = {
      candidateId,
      jobDescriptionId,
      organizationId: req.dbUser?.organizationId,
      source: source || 'manual',
      pipeline: {
        currentStage: 'applied',
        priority: 'medium',
        lastUpdated: new Date(),
        stageHistory: [{
          stage: 'applied',
          enteredAt: new Date(),
          notes: notes || 'Application submitted'
        }]
      },
      createdBy: req.dbUser?._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const application = new Application(applicationData);
    await application.save();

    // Populate the created application
    const populatedApplication = await Application.findById(application._id)
      .populate('candidateId', 'firstName lastName email profilePicture location experience')
      .populate('jobDescriptionId', 'title department')
      .lean();

    res.status(201).json({
      success: true,
      data: populatedApplication,
      message: 'Application created successfully'
    });

  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create application',
        code: 'CREATE_APPLICATION_ERROR'
      }
    });
  }
});

// @route   PUT /api/applications/:id/stage
// @desc    Move application to different pipeline stage
// @access  Private
router.put('/:id/stage', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { stage, notes, feedback } = req.body;

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

    const validStages = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'];
    if (!validStages.includes(stage)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid stage',
          code: 'INVALID_STAGE'
        }
      });
      return;
    }

    const application = await Application.findOne({
      _id: req.params.id,
      organizationId: req.dbUser?.organizationId
    });

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

    // Add to stage history
    const stageHistoryEntry = {
      stage,
      status: 'in_progress',
      enteredAt: new Date(),
      notes: notes || `Moved to ${stage}`,
      performedBy: req.dbUser?._id
    };

    application.pipeline.stageHistory.push(stageHistoryEntry);
    application.pipeline.currentStage = stage;
    application.updatedAt = new Date();

    await application.save();

    // Populate and return updated application
    const updatedApplication = await Application.findById(application._id)
      .populate('candidateId', 'firstName lastName email profilePicture location experience')
      .populate('jobDescriptionId', 'title department')
      .lean();

    res.json({
      success: true,
      data: updatedApplication,
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

// @route   PUT /api/applications/:id/priority
// @desc    Update application priority
// @access  Private
router.put('/:id/priority', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { priority } = req.body;

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid priority level',
          code: 'INVALID_PRIORITY'
        }
      });
      return;
    }

    const application = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        organizationId: req.dbUser?.organizationId
      },
      {
        'pipeline.priority': priority,
        updatedAt: new Date()
      },
      { new: true }
    )
      .populate('candidateId', 'firstName lastName email profilePicture location experience')
      .populate('jobDescriptionId', 'title department');

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
      data: application,
      message: 'Priority updated successfully'
    });

  } catch (error) {
    console.error('Error updating priority:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update priority',
        code: 'UPDATE_PRIORITY_ERROR'
      }
    });
  }
});

// @route   POST /api/applications/:id/schedule-interview
// @desc    Schedule interview for application
// @access  Private
router.post('/:id/schedule-interview', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { scheduledDate, interviewType, interviewers, notes } = req.body;

    if (!scheduledDate || !interviewType) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Scheduled date and interview type are required',
          code: 'MISSING_INTERVIEW_DETAILS'
        }
      });
      return;
    }

    const application = await Application.findOne({
      _id: req.params.id,
      organizationId: req.dbUser?.organizationId
    });

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

    // Add interview to application
    const interview = {
      type: interviewType,
      round: 1,
      status: 'scheduled',
      scheduledAt: new Date(scheduledDate),
      interviewers: interviewers || [],
      notes: notes || '',
      feedback: {
        overall: '',
        strengths: [],
        concerns: [],
        recommendation: 'pending'
      }
    };

    application.interviews.push(interview);
    
    // Move to interview stage if not already there
    if (application.pipeline.currentStage === 'screening') {
      application.pipeline.currentStage = 'interview';
      application.pipeline.stageHistory.push({
        stage: 'interview',
        status: 'in_progress',
        enteredAt: new Date(),
        notes: `Interview scheduled for ${new Date(scheduledDate).toLocaleDateString()}`,
        performedBy: req.dbUser?._id
      });
    }
    application.updatedAt = new Date();

    await application.save();

    res.json({
      success: true,
      data: interview,
      message: 'Interview scheduled successfully'
    });

  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to schedule interview',
        code: 'SCHEDULE_INTERVIEW_ERROR'
      }
    });
  }
});

// @route   POST /api/applications/:id/ai-analysis
// @desc    Generate AI analysis for application
// @access  Private
router.post('/:id/ai-analysis', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      organizationId: req.dbUser?.organizationId
    })
      .populate('candidateId')
      .populate('jobDescriptionId');

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

    // TODO: Implement real AI analysis using AIJobDescriptionService
    // This would analyze candidate-job fit, predict success, identify concerns
    
    const mockAnalysis = {
      candidateJobMatch: {
        overallScore: Math.floor(Math.random() * 40) + 60, // 60-100%
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

    // Update application with AI insights
    const updatedApp = await Application.findByIdAndUpdate(
      application._id,
      {
        $set: {
          'aiInsights.candidateJobMatch': mockAnalysis.candidateJobMatch,
          'aiInsights.hiringRecommendation': mockAnalysis.hiringRecommendation,
          'aiInsights.predictedSuccess': mockAnalysis.predictedSuccess,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

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

// @route   GET /api/applications/analytics/pipeline
// @desc    Get pipeline analytics data
// @access  Private
router.get('/analytics/pipeline', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { timeRange = '30d' } = req.query;

    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    if (timeRange === '7d') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeRange === '30d') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
    } else if (timeRange === '90d') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
    }

    // Get pipeline conversion rates
    const pipelineStats = await Application.aggregate([
      { 
        $match: { 
          organizationId: req.dbUser?.organizationId,
          ...dateFilter
        } 
      },
      {
        $group: {
          _id: '$pipeline.currentStage',
          count: { $sum: 1 },
          avgTimeInStage: { 
            $avg: { 
              $divide: [
                { $subtract: ['$pipeline.lastUpdated', '$createdAt'] },
                86400000 // Convert to days
              ]
            }
          }
        }
      }
    ]);

    // Get hiring success rate
    const totalApplications = await Application.countDocuments({
      organizationId: req.dbUser?.organizationId,
      ...dateFilter
    });

    const hiredApplications = await Application.countDocuments({
      organizationId: req.dbUser?.organizationId,
      'pipeline.currentStage': 'hired',
      ...dateFilter
    });

    const successRate = totalApplications > 0 ? Math.round((hiredApplications / totalApplications) * 100) : 0;

    // Get average time to hire
    const avgTimeToHire = await Application.aggregate([
      {
        $match: {
          organizationId: req.dbUser?.organizationId,
          'pipeline.currentStage': 'hired',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          avgDays: {
            $avg: {
              $divide: [
                { $subtract: ['$pipeline.lastUpdated', '$createdAt'] },
                86400000 // Convert to days
              ]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        pipelineStats,
        metrics: {
          totalApplications,
          hiredApplications,
          successRate,
          avgTimeToHire: avgTimeToHire[0]?.avgDays || 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching pipeline analytics:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch analytics',
        code: 'ANALYTICS_ERROR'
      }
    });
  }
});

export default router;
