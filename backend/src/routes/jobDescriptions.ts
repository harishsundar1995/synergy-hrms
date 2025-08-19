import { Router, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { JobDescription } from '../models/JobDescription';
import { v4 as uuidv4 } from 'uuid';
import AIJobDescriptionService, { JobGenerationPrompt } from '../services/aiJobService';

const router = Router();

// =================== AI-POWERED ROUTES (PHASE 6) ===================

// @route   POST /api/job-descriptions/generate
// @desc    AI-powered job description generation
// @access  Private
router.post('/generate', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('🤖 Generating AI job description for:', req.dbUser?.email);
    
    const prompt: JobGenerationPrompt = req.body;
    
    // Validate required fields
    if (!prompt.jobTitle || !prompt.department || !prompt.experienceLevel) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Job title, department, and experience level are required',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      });
      return;
    }

    // Generate job description using AI
    const generatedContent = await AIJobDescriptionService.generateJobDescription(prompt);
    
    // Generate market analysis
    const marketAnalysis = await AIJobDescriptionService.generateMarketAnalysis(
      prompt.jobTitle,
      prompt.location,
      prompt.experienceLevel
    );

    // Analyze for bias
    const fullDescription = `${generatedContent.overview}\n\nResponsibilities:\n${generatedContent.responsibilities.join('\n')}\n\nRequirements:\n${generatedContent.requirements.essential.join('\n')}`;
    const biasAnalysis = await AIJobDescriptionService.analyzeBias(fullDescription);

    // Generate SEO tags
    const allSkills = [...generatedContent.skills.technical, ...generatedContent.skills.soft];
    const seoTags = await AIJobDescriptionService.generateTags(prompt.jobTitle, allSkills, prompt.industryType);

    // Create job description document
    const jobId = uuidv4();
    const jobDescription = new JobDescription({
      _id: jobId,
      title: prompt.jobTitle,
      department: prompt.department,
      jobType: 'full-time', // Default, can be updated
      workMode: prompt.workMode,
      location: prompt.location,
      salaryRange: {
        min: Math.round(marketAnalysis.averageSalary * 0.8),
        max: Math.round(marketAnalysis.averageSalary * 1.2),
        currency: 'USD'
      },
      experienceLevel: prompt.experienceLevel,
      overview: generatedContent.overview,
      responsibilities: generatedContent.responsibilities,
      requirements: generatedContent.requirements,
      skills: generatedContent.skills,
      benefits: generatedContent.benefits,
      teamSize: prompt.teamSize,
      // AI-generated fields
      aiGenerated: {
        isGenerated: true,
        prompt: JSON.stringify(prompt),
        model: 'gpt-4',
        generatedAt: new Date(),
        humanEdited: false,
        confidence: generatedContent.confidence
      },
      marketAnalysis: {
        ...marketAnalysis,
        analysisDate: new Date(),
        source: 'ai-generated'
      },
      biasCheck: {
        score: biasAnalysis.overallScore,
        issues: biasAnalysis.biases.map(bias => bias.description),
        suggestions: biasAnalysis.suggestions,
        lastChecked: new Date(),
        checkedBy: 'ai'
      },
      optimization: {
        seoScore: 85,
        readabilityScore: 90,
        diversityScore: biasAnalysis.inclusivityScore,
        suggestions: biasAnalysis.suggestions,
        lastOptimized: new Date()
      },
      posting: {
        isActive: false,
        platforms: [],
        applicantCount: 0,
        viewCount: 0
      },
      status: 'draft',
      createdBy: req.dbUser!._id,
      updatedBy: req.dbUser!._id,
      version: 1,
      tags: [...generatedContent.tags, ...seoTags]
    });

    await jobDescription.save();

    console.log(`✅ AI-generated job description created: ${jobDescription.title}`);

    res.status(201).json({
      success: true,
      data: {
        jobDescription,
        aiMetrics: {
          confidence: generatedContent.confidence,
          biasScore: biasAnalysis.overallScore,
          marketData: marketAnalysis
        }
      }
    });

  } catch (error) {
    console.error('Error generating job description:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate job description',
        code: 'AI_GENERATION_ERROR'
      }
    });
  }
});

// @route   POST /api/job-descriptions/:id/analyze-bias
// @desc    Re-analyze job description for bias
// @access  Private
router.post('/:id/analyze-bias', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log('🔍 Analyzing bias for job description:', id);

    const jobDescription = await JobDescription.findById(id);
    if (!jobDescription) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Job description not found',
          code: 'JOB_NOT_FOUND'
        }
      });
      return;
    }

    // Create full description text for analysis
    const fullDescription = `${jobDescription.overview}\n\nResponsibilities:\n${jobDescription.responsibilities.join('\n')}\n\nRequirements:\n${jobDescription.requirements.essential.join('\n')}`;
    
    // Analyze for bias
    const biasAnalysis = await AIJobDescriptionService.analyzeBias(fullDescription);

    // Update job description with new bias analysis
    jobDescription.biasCheck = {
      score: biasAnalysis.overallScore,
      issues: biasAnalysis.biases.map(bias => bias.description),
      suggestions: biasAnalysis.suggestions,
      lastChecked: new Date(),
      checkedBy: 'ai'
    };
    
    jobDescription.optimization.diversityScore = biasAnalysis.inclusivityScore;
    jobDescription.updatedBy = req.dbUser!._id;
    
    await jobDescription.save();

    console.log(`✅ Bias analysis completed for: ${jobDescription.title}, Score: ${biasAnalysis.overallScore}`);

    res.json({
      success: true,
      data: {
        biasAnalysis,
        updatedJob: jobDescription
      }
    });

  } catch (error) {
    console.error('Error analyzing bias:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to analyze bias',
        code: 'BIAS_ANALYSIS_ERROR'
      }
    });
  }
});

// @route   GET /api/job-descriptions/market-analysis/:title
// @desc    Get market analysis for a job title
// @access  Private
router.get('/market-analysis/:title', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title } = req.params;
    const { location = 'Remote', experienceLevel = 'mid' } = req.query;
    
    console.log('📊 Generating market analysis for:', title);

    const marketAnalysis = await AIJobDescriptionService.generateMarketAnalysis(
      title,
      location as string,
      experienceLevel as string
    );

    console.log(`✅ Market analysis generated for: ${title}`);

    res.json({
      success: true,
      data: {
        marketAnalysis,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error generating market analysis:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate market analysis',
        code: 'MARKET_ANALYSIS_ERROR'
      }
    });
  }
});

// =================== EXISTING ROUTES ===================

// @route   GET /api/job-descriptions
// @desc    Get all job descriptions with filtering
// @access  Private
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      department = '', 
      status = '', 
      jobType = '',
      workMode = '',
      experienceLevel = ''
    } = req.query;

    console.log('🔍 Fetching job descriptions with filters:', { department, status, jobType });

    // Build filter object
    const filter: any = {};
    
    if (search) {
      filter.$text = { $search: search as string };
    }
    
    if (department && department !== 'all') {
      filter.department = department;
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (jobType && jobType !== 'all') {
      filter.jobType = jobType;
    }
    
    if (workMode && workMode !== 'all') {
      filter.workMode = workMode;
    }
    
    if (experienceLevel && experienceLevel !== 'all') {
      filter.experienceLevel = experienceLevel;
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Fetch job descriptions
    const jobDescriptions = await JobDescription.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await JobDescription.countDocuments(filter);

    console.log(`✅ Found ${jobDescriptions.length} job descriptions (${total} total)`);

    res.json({
      success: true,
      data: {
        jobDescriptions,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
          hasNext: skip + limitNum < total,
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch job descriptions',
        code: 'FETCH_JD_ERROR'
      }
    });
  }
});

// @route   GET /api/job-descriptions/stats
// @desc    Get job description statistics
// @access  Private
router.get('/stats', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('📊 Generating job description statistics');

    const totalJDs = await JobDescription.countDocuments();
    const activeJDs = await JobDescription.countDocuments({ status: 'active' });
    const draftJDs = await JobDescription.countDocuments({ status: 'draft' });
    const pausedJDs = await JobDescription.countDocuments({ status: 'paused' });

    // Department-wise breakdown
    const departmentStats = await JobDescription.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Job type breakdown
    const jobTypeStats = await JobDescription.aggregate([
      {
        $group: {
          _id: '$jobType',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('✅ Statistics generated successfully');

    res.json({
      success: true,
      data: {
        overview: {
          total: totalJDs,
          active: activeJDs,
          draft: draftJDs,
          paused: pausedJDs,
          closed: totalJDs - activeJDs - draftJDs - pausedJDs
        },
        departments: departmentStats,
        jobTypes: jobTypeStats
      }
    });
  } catch (error) {
    console.error('Error generating statistics:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate statistics',
        code: 'STATS_ERROR'
      }
    });
  }
});

// @route   GET /api/job-descriptions/:id
// @desc    Get single job description
// @access  Private
router.get('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching job description:', id);

    const jobDescription = await JobDescription.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!jobDescription) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Job description not found',
          code: 'JD_NOT_FOUND'
        }
      });
      return;
    }

    console.log('✅ Job description found:', jobDescription.title);

    res.json({
      success: true,
      data: jobDescription
    });
  } catch (error) {
    console.error('Error fetching job description:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch job description',
        code: 'FETCH_JD_ERROR'
      }
    });
  }
});

// @route   POST /api/job-descriptions
// @desc    Create new job description
// @access  Private (HR Manager+)
router.post('/', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.dbUser?._id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'USER_NOT_AUTHENTICATED'
        }
      });
      return;
    }

    // Check permissions
    const hasPermission = req.dbUser?.permissions?.includes('manage:jobs') || 
                         req.dbUser?.permissions?.includes('admin:full_access') ||
                         ['hr_manager', 'org_admin', 'super_admin'].includes(req.dbUser?.role || '');

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions to create job descriptions',
          code: 'INSUFFICIENT_PERMISSIONS'
        }
      });
      return;
    }

    const jobData = {
      ...req.body,
      _id: uuidv4(),
      createdBy: userId,
      updatedBy: userId
    };

    console.log('🆕 Creating new job description:', jobData.title);

    const jobDescription = new JobDescription(jobData);
    await jobDescription.save();

    console.log('✅ Job description created successfully');

    res.status(201).json({
      success: true,
      data: jobDescription,
      message: 'Job description created successfully'
    });
  } catch (error) {
    console.error('Error creating job description:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create job description',
        code: 'CREATE_JD_ERROR'
      }
    });
  }
});

// @route   PUT /api/job-descriptions/:id
// @desc    Update job description
// @access  Private (HR Manager+)
router.put('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.dbUser?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'USER_NOT_AUTHENTICATED'
        }
      });
      return;
    }

    // Check permissions
    const hasPermission = req.dbUser?.permissions?.includes('manage:jobs') || 
                         req.dbUser?.permissions?.includes('admin:full_access') ||
                         ['hr_manager', 'org_admin', 'super_admin'].includes(req.dbUser?.role || '');

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions to update job descriptions',
          code: 'INSUFFICIENT_PERMISSIONS'
        }
      });
      return;
    }

    console.log('🔄 Updating job description:', id);

    const updateData = {
      ...req.body,
      updatedBy: userId,
      updatedAt: new Date()
    };

    const jobDescription = await JobDescription.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!jobDescription) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Job description not found',
          code: 'JD_NOT_FOUND'
        }
      });
      return;
    }

    console.log('✅ Job description updated successfully');

    res.json({
      success: true,
      data: jobDescription,
      message: 'Job description updated successfully'
    });
  } catch (error) {
    console.error('Error updating job description:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update job description',
        code: 'UPDATE_JD_ERROR'
      }
    });
  }
});

// @route   DELETE /api/job-descriptions/:id
// @desc    Delete job description
// @access  Private (HR Manager+)
router.delete('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check permissions
    const hasPermission = req.dbUser?.permissions?.includes('manage:jobs') || 
                         req.dbUser?.permissions?.includes('admin:full_access') ||
                         ['hr_manager', 'org_admin', 'super_admin'].includes(req.dbUser?.role || '');

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions to delete job descriptions',
          code: 'INSUFFICIENT_PERMISSIONS'
        }
      });
      return;
    }

    console.log('🗑️ Deleting job description:', id);

    const jobDescription = await JobDescription.findByIdAndDelete(id);

    if (!jobDescription) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Job description not found',
          code: 'JD_NOT_FOUND'
        }
      });
      return;
    }

    console.log('✅ Job description deleted successfully');

    res.json({
      success: true,
      message: 'Job description deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job description:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete job description',
        code: 'DELETE_JD_ERROR'
      }
    });
  }
});

// @route   PATCH /api/job-descriptions/:id/status
// @desc    Update job description status
// @access  Private (HR Manager+)
router.patch('/:id/status', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.dbUser?._id;

    const validStatuses = ['draft', 'active', 'paused', 'closed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid status',
          code: 'INVALID_STATUS'
        }
      });
      return;
    }

    console.log('🔄 Updating job description status:', id, 'to', status);

    const updateData: any = {
      status,
      updatedBy: userId,
      updatedAt: new Date()
    };

    if (status === 'active') {
      updateData.postedDate = new Date();
    }

    const jobDescription = await JobDescription.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!jobDescription) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Job description not found',
          code: 'JD_NOT_FOUND'
        }
      });
      return;
    }

    console.log('✅ Status updated successfully');

    res.json({
      success: true,
      data: jobDescription,
      message: `Job description ${status === 'active' ? 'published' : 'status updated'} successfully`
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update status',
        code: 'STATUS_UPDATE_ERROR'
      }
    });
  }
});

export default router;
