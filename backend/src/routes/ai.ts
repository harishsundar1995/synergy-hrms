import express, { Request, Response } from 'express';
import aiService, { SentimentAnalysisResult, BurnoutPredictionResult } from '../services/aiService';

const router = express.Router();

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

// Middleware to get user ID
const getUserId = (req: AuthenticatedRequest): string => {
  return req.user?.id || 'anonymous';
};

/**
 * POST /api/ai/sentiment-analysis
 * Analyze sentiment of text content
 */
router.post('/sentiment-analysis', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { text, context } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Text content is required'
      });
      return;
    }

    if (text.length > 10000) {
      res.status(400).json({
        success: false,
        error: 'Text content too long (max 10,000 characters)'
      });
      return;
    }

    const userId = getUserId(req);
    const result = await aiService.analyzeSentiment(text, userId);

    res.json({
      success: true,
      data: {
        ...result,
        context: context || 'general'
      }
    });

  } catch (error: any) {
    console.error('Error in sentiment analysis:', error);
    
    if (error.message.includes('Rate limit exceeded')) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to analyze sentiment'
    });
  }
});

/**
 * POST /api/ai/burnout-prediction
 * Predict burnout risk for an employee
 */
router.post('/burnout-prediction', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId, employeeData } = req.body;

    if (!employeeId || !employeeData) {
      res.status(400).json({
        success: false,
        error: 'Employee ID and data are required'
      });
      return;
    }

    const userId = getUserId(req);
    const result = await aiService.predictBurnout(employeeData, userId);

    // Log the prediction for audit purposes
    console.log(`Burnout prediction for employee ${employeeId}:`, {
      riskLevel: result.riskLevel,
      score: result.score,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        employeeId,
        prediction: result,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error in burnout prediction:', error);
    
    if (error.message.includes('Rate limit exceeded')) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to predict burnout risk'
    });
  }
});

/**
 * POST /api/ai/turnover-prediction
 * Predict turnover risk for an employee
 */
router.post('/turnover-prediction', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId, employeeData } = req.body;

    if (!employeeId || !employeeData) {
      res.status(400).json({
        success: false,
        error: 'Employee ID and data are required'
      });
      return;
    }

    const userId = getUserId(req);
    const result = await aiService.predictTurnover(employeeData, userId);

    res.json({
      success: true,
      data: {
        employeeId,
        prediction: result,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error in turnover prediction:', error);
    
    if (error.message.includes('Rate limit exceeded')) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to predict turnover risk'
    });
  }
});

/**
 * POST /api/ai/manager-insights
 * Generate insights and conversation starters for managers
 */
router.post('/manager-insights', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { teamData } = req.body;

    if (!teamData) {
      res.status(400).json({
        success: false,
        error: 'Team data is required'
      });
      return;
    }

    const userId = getUserId(req);
    const result = await aiService.generateManagerInsights(teamData, userId);

    res.json({
      success: true,
      data: {
        insights: result,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error generating manager insights:', error);
    
    if (error.message.includes('Rate limit exceeded')) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate manager insights'
    });
  }
});

/**
 * GET /api/ai/rate-limit-status
 * Get current rate limit status for the user
 */
router.get('/rate-limit-status', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const status = aiService.getRateLimitStatus(userId);

    res.json({
      success: true,
      data: {
        remaining: status.remaining,
        resetTime: status.resetTime,
        resetIn: Math.max(0, status.resetTime - Date.now())
      }
    });

  } catch (error) {
    console.error('Error getting rate limit status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get rate limit status'
    });
  }
});

/**
 * POST /api/ai/batch-sentiment-analysis
 * Analyze sentiment for multiple texts at once
 */
router.post('/batch-sentiment-analysis', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { texts, context } = req.body;

    if (!Array.isArray(texts) || texts.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Array of texts is required'
      });
      return;
    }

    if (texts.length > 10) {
      res.status(400).json({
        success: false,
        error: 'Maximum 10 texts per batch request'
      });
      return;
    }

    const userId = getUserId(req);
    const results: (SentimentAnalysisResult & { index: number })[] = [];

    // Process texts sequentially to respect rate limits
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      if (typeof text === 'string' && text.length <= 10000) {
        try {
          const result = await aiService.analyzeSentiment(text, userId);
          results.push({ ...result, index: i });
        } catch (error: any) {
          if (error.message.includes('Rate limit exceeded')) {
            res.status(429).json({
              success: false,
              error: 'Rate limit exceeded during batch processing',
              processedCount: i
            });
            return;
          }
          // Skip invalid texts but continue processing
          console.warn(`Skipped text at index ${i}:`, error.message);
        }
      }
    }

    res.json({
      success: true,
      data: {
        results,
        context: context || 'general',
        processedCount: results.length,
        totalCount: texts.length
      }
    });

  } catch (error) {
    console.error('Error in batch sentiment analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process batch sentiment analysis'
    });
  }
});

export default router;
