import { Router, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import Candidate from '../models/Candidate';
import AIJobDescriptionService from '../services/aiJobService';

const router = Router();

// =================== CANDIDATE MANAGEMENT ROUTES ===================

// @route   GET /api/candidates
// @desc    Get all candidates with filtering and search
// @access  Private
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('📋 Fetching candidates for:', req.dbUser?.email);
    
    const { 
      search, 
      status, 
      experience, 
      location, 
      skills,
      page = 1, 
      limit = 20 
    } = req.query;

    // Build filter object
    const filter: any = {
      organizationId: req.dbUser?.organizationId
    };

    // Search filter
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'experience.jobTitle': { $regex: search, $options: 'i' } },
        { 'experience.company': { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Experience level filter
    if (experience && experience !== 'all') {
      filter.experienceLevel = experience;
    }

    // Location filter
    if (location && location !== 'all') {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Skills filter
    if (skills) {
      const skillArray = Array.isArray(skills) ? skills : [skills];
      filter['skills.name'] = { $in: skillArray.map(skill => new RegExp(skill as string, 'i')) };
    }

    // Execute query with pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [candidates, total] = await Promise.all([
      Candidate.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Candidate.countDocuments(filter)
    ]);

    // Calculate summary stats
    const stats = await Candidate.aggregate([
      { $match: { organizationId: req.dbUser?.organizationId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          interviewed: { $sum: { $cond: [{ $eq: ['$status', 'interviewed'] }, 1, 0] } },
          hired: { $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } }
        }
      }
    ]);

    const summary = stats[0] || { total: 0, active: 0, interviewed: 0, hired: 0 };

    res.json({
      success: true,
      data: {
        candidates,
        pagination: {
          current: pageNum,
          total: Math.ceil(total / limitNum),
          count: candidates.length,
          totalRecords: total
        },
        summary
      }
    });

  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch candidates',
        code: 'FETCH_CANDIDATES_ERROR'
      }
    });
  }
});

// @route   GET /api/candidates/:id
// @desc    Get candidate by ID with detailed information
// @access  Private
router.get('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const candidate = await Candidate.findOne({
      _id: req.params.id,
      organizationId: req.dbUser?.organizationId
    }).lean();

    if (!candidate) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Candidate not found',
          code: 'CANDIDATE_NOT_FOUND'
        }
      });
      return;
    }

    res.json({
      success: true,
      data: candidate
    });

  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch candidate',
        code: 'FETCH_CANDIDATE_ERROR'
      }
    });
  }
});

// @route   POST /api/candidates
// @desc    Create new candidate
// @access  Private
router.post('/', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('➕ Creating new candidate for:', req.dbUser?.email);
    
    const candidateData = {
      ...req.body,
      organizationId: req.dbUser?.organizationId,
      createdBy: req.dbUser?._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const candidate = new Candidate(candidateData);
    await candidate.save();

    res.status(201).json({
      success: true,
      data: candidate,
      message: 'Candidate created successfully'
    });

  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create candidate',
        code: 'CREATE_CANDIDATE_ERROR'
      }
    });
  }
});

// @route   PUT /api/candidates/:id
// @desc    Update candidate
// @access  Private
router.put('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const candidate = await Candidate.findOneAndUpdate(
      {
        _id: req.params.id,
        organizationId: req.dbUser?.organizationId
      },
      {
        ...req.body,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!candidate) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Candidate not found',
          code: 'CANDIDATE_NOT_FOUND'
        }
      });
      return;
    }

    res.json({
      success: true,
      data: candidate,
      message: 'Candidate updated successfully'
    });

  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update candidate',
        code: 'UPDATE_CANDIDATE_ERROR'
      }
    });
  }
});

// @route   DELETE /api/candidates/:id
// @desc    Delete candidate
// @access  Private
router.delete('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const candidate = await Candidate.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.dbUser?.organizationId
    });

    if (!candidate) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Candidate not found',
          code: 'CANDIDATE_NOT_FOUND'
        }
      });
      return;
    }

    res.json({
      success: true,
      message: 'Candidate deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete candidate',
        code: 'DELETE_CANDIDATE_ERROR'
      }
    });
  }
});

// @route   POST /api/candidates/:id/ai-analysis
// @desc    Generate AI analysis for candidate
// @access  Private
router.post('/:id/ai-analysis', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { jobDescriptionId } = req.body;
    
    const candidate = await Candidate.findOne({
      _id: req.params.id,
      organizationId: req.dbUser?.organizationId
    });

    if (!candidate) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Candidate not found',
          code: 'CANDIDATE_NOT_FOUND'
        }
      });
      return;
    }

    // TODO: Implement AI analysis using AIJobDescriptionService
    // This would analyze candidate skills, experience, and fit for the job
    
    const mockAnalysis = {
      overallScore: Math.floor(Math.random() * 40) + 60, // 60-100%
      skillsMatch: Math.floor(Math.random() * 30) + 70, // 70-100%
      experienceMatch: Math.floor(Math.random() * 30) + 65, // 65-95%
      culturalFit: Math.floor(Math.random() * 25) + 75, // 75-100%
      strengths: [
        'Strong technical background',
        'Relevant industry experience',
        'Good communication skills'
      ],
      concerns: [
        'Limited experience with specific technology',
        'May require additional training'
      ],
      recommendation: Math.random() > 0.3 ? 'hire' : 'maybe',
      confidence: Math.floor(Math.random() * 20) + 80 // 80-100%
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

// @route   POST /api/candidates/bulk-actions
// @desc    Perform bulk actions on candidates
// @access  Private
router.post('/bulk-actions', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { action, candidateIds } = req.body;

    if (!action || !candidateIds || !Array.isArray(candidateIds)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Action and candidate IDs are required',
          code: 'INVALID_BULK_ACTION'
        }
      });
      return;
    }

    let updateData: any = { updatedAt: new Date() };

    switch (action) {
      case 'archive':
        updateData.status = 'archived';
        break;
      case 'activate':
        updateData.status = 'active';
        break;
      case 'delete':
        await Candidate.deleteMany({
          _id: { $in: candidateIds },
          organizationId: req.dbUser?.organizationId
        });
        
        res.json({
          success: true,
          message: `${candidateIds.length} candidates deleted successfully`
        });
        return;
      default:
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid action',
            code: 'INVALID_ACTION'
          }
        });
        return;
    }

    const result = await Candidate.updateMany(
      {
        _id: { $in: candidateIds },
        organizationId: req.dbUser?.organizationId
      },
      updateData
    );

    res.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      },
      message: `Bulk action '${action}' completed successfully`
    });

  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to perform bulk action',
        code: 'BULK_ACTION_ERROR'
      }
    });
  }
});

export default router;
