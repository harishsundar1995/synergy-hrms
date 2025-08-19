import { Router, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { User } from '../models/User';

const router = Router();

// @route   GET /api/users/me
// @desc    Get current user info
// @access  Private
router.get('/me', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('🔍 Getting current user info for:', req.userId);
    
    if (!req.dbUser) {
      console.log('❌ No database user found in request');
      res.status(404).json({
        success: false,
        error: {
          message: 'User not found in database',
          code: 'USER_NOT_FOUND'
        }
      });
      return;
    }

    console.log('✅ Found user:', req.dbUser.email);
    
    res.json({
      success: true,
      data: {
        id: req.dbUser._id,
        clerkId: req.dbUser.clerkId,
        email: req.dbUser.email,
        firstName: req.dbUser.firstName,
        lastName: req.dbUser.lastName,
        fullName: req.dbUser.fullName,
        imageUrl: req.dbUser.imageUrl,
        role: req.dbUser.role,
        permissions: req.dbUser.permissions,
        status: req.dbUser.status,
        lastLoginAt: req.dbUser.lastLoginAt,
        createdAt: req.dbUser.createdAt,
        updatedAt: req.dbUser.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get user information',
        code: 'GET_USER_ERROR'
      }
    });
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // TODO: Fetch additional user data from MongoDB
    res.json({
      success: true,
      data: {
        user: req.user,
        profile: {
          // Additional profile data will go here
          role: 'employee', // Default role
          department: null,
          manager: null,
          directReports: [],
          preferences: {
            notifications: true,
            theme: 'light',
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch user profile',
        code: 'PROFILE_FETCH_ERROR',
      },
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // TODO: Update user profile in MongoDB
    const updates = req.body;
    
    res.json({
      success: true,
      data: {
        message: 'Profile updated successfully',
        updates,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update user profile',
        code: 'PROFILE_UPDATE_ERROR',
      },
    });
  }
});

// @route   GET /api/users
// @desc    Get all users with pagination and filters
// @access  Private (Admin only)
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', status = '' } = req.query;
    
    // Build filter query
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      filter.role = role;
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const users = await User.find(filter)
      .select('-__v') // Exclude version field
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch users',
        code: 'FETCH_USERS_ERROR'
      }
    });
  }
});

// @route   PUT /api/users/:userId/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/:userId/role', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    // Check if current user has permission to update roles
    const currentUser = await User.findOne({ clerkId: req.userId });
    if (!currentUser || !['super_admin', 'org_admin'].includes(currentUser.role)) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions to update user roles',
          code: 'INSUFFICIENT_PERMISSIONS'
        }
      });
      return;
    }
    
    const validRoles = ['super_admin', 'org_admin', 'hr_manager', 'manager', 'employee'];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid role specified',
          code: 'INVALID_ROLE'
        }
      });
      return;
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-__v');
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
      return;
    }
    
    res.json({
      success: true,
      data: user,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update user role',
        code: 'UPDATE_ROLE_ERROR'
      }
    });
  }
});

// @route   PUT /api/users/:userId/status
// @desc    Update user status
// @access  Private (Admin/HR only)
router.put('/:userId/status', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    // Check if current user has permission to update status
    const currentUser = await User.findOne({ clerkId: req.userId });
    if (!currentUser || !['super_admin', 'org_admin', 'hr_manager'].includes(currentUser.role)) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions to update user status',
          code: 'INSUFFICIENT_PERMISSIONS'
        }
      });
      return;
    }
    
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid status specified',
          code: 'INVALID_STATUS'
        }
      });
      return;
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select('-__v');
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
      return;
    }
    
    res.json({
      success: true,
      data: user,
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update user status',
        code: 'UPDATE_STATUS_ERROR'
      }
    });
  }
});

export default router;
