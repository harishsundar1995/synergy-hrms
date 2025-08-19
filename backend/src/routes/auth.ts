import { Router, Request, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch user information',
        code: 'USER_FETCH_ERROR',
      },
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh user session
// @access  Private
router.post('/refresh', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        message: 'Session refreshed successfully',
        user: req.user,
      },
    });
  } catch (error) {
    console.error('Error refreshing session:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to refresh session',
        code: 'SESSION_REFRESH_ERROR',
      },
    });
  }
});

export default router;
