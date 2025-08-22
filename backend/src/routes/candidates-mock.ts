import { Router, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Mock candidate data
const mockCandidates = [
  {
    _id: '1',
    firstName: 'Emily',
    lastName: 'Watson',
    email: 'emily.watson@email.com',
    location: 'New York, NY',
    experience: 5,
    status: 'active',
    skills: ['React', 'TypeScript', 'Node.js'],
    appliedDate: '2024-01-12T11:45:00Z'
  },
  {
    _id: '2',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@email.com',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b193?w=150&h=150&fit=crop&crop=face',
    location: 'San Francisco, CA',
    experience: 6,
    status: 'active',
    skills: ['Python', 'Django', 'PostgreSQL'],
    appliedDate: '2024-01-15T10:30:00Z'
  },
  {
    _id: '3',
    firstName: 'Michael',
    lastName: 'Rodriguez',
    email: 'michael.rodriguez@email.com',
    location: 'Austin, TX',
    experience: 8,
    status: 'interviewed',
    skills: ['Product Management', 'Analytics', 'Strategy'],
    appliedDate: '2024-01-10T09:15:00Z'
  }
];

// @route   GET /api/candidates
// @desc    Get all candidates with filtering and search
// @access  Private
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('📋 Fetching candidates for:', req.dbUser?.email);
    
    const { search, status, page = 1, limit = 20 } = req.query;

    let filteredCandidates = [...mockCandidates];

    // Apply search filter
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredCandidates = filteredCandidates.filter(candidate =>
        candidate.firstName.toLowerCase().includes(searchTerm) ||
        candidate.lastName.toLowerCase().includes(searchTerm) ||
        candidate.email.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (status && status !== 'all') {
      filteredCandidates = filteredCandidates.filter(candidate => candidate.status === status);
    }

    // Summary stats
    const summary = {
      total: mockCandidates.length,
      active: mockCandidates.filter(c => c.status === 'active').length,
      interviewed: mockCandidates.filter(c => c.status === 'interviewed').length,
      hired: mockCandidates.filter(c => c.status === 'hired').length
    };

    res.json({
      success: true,
      data: {
        candidates: filteredCandidates,
        pagination: {
          current: parseInt(page as string),
          total: 1,
          count: filteredCandidates.length,
          totalRecords: filteredCandidates.length
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
// @desc    Get candidate by ID
// @access  Private
router.get('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const candidate = mockCandidates.find(c => c._id === req.params.id);

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
    
    const newCandidate = {
      _id: (mockCandidates.length + 1).toString(),
      ...req.body,
      status: 'active',
      appliedDate: new Date().toISOString()
    };

    mockCandidates.push(newCandidate);

    res.status(201).json({
      success: true,
      data: newCandidate,
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

// @route   POST /api/candidates/:id/ai-analysis
// @desc    Generate AI analysis for candidate
// @access  Private
router.post('/:id/ai-analysis', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const candidate = mockCandidates.find(c => c._id === req.params.id);

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

    const mockAnalysis = {
      overallScore: Math.floor(Math.random() * 40) + 60,
      skillsMatch: Math.floor(Math.random() * 30) + 70,
      experienceMatch: Math.floor(Math.random() * 30) + 65,
      culturalFit: Math.floor(Math.random() * 25) + 75,
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
      confidence: Math.floor(Math.random() * 20) + 80
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
