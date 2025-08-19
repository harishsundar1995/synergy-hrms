import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { User } from '../models/User';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
  dbUser?: any;
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('🔍 Authentication middleware called');
  
  try {
    const authHeader = req.headers.authorization;
    console.log('📋 Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header found');
      res.status(401).json({
        success: false,
        error: {
          message: 'Access token is required',
          code: 'MISSING_TOKEN',
        },
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🎫 Token received, length:', token.length);
    
    try {
      // Verify the session token with Clerk
      console.log('🔐 Verifying token with Clerk...');
      const sessionToken = await clerkClient.verifyToken(token);
      console.log('✅ Token verified:', sessionToken ? 'Success' : 'Failed');
      
      if (!sessionToken || !sessionToken.sub) {
        console.log('❌ Invalid session token');
        res.status(401).json({
          success: false,
          error: {
            message: 'Invalid or expired token',
            code: 'INVALID_TOKEN',
          },
        });
        return;
      }

      // Get user details from Clerk
      console.log('👤 Getting user from Clerk, ID:', sessionToken.sub);
      const clerkUser = await clerkClient.users.getUser(sessionToken.sub);
      console.log('👤 Clerk user found:', clerkUser ? 'Yes' : 'No');
      
      if (!clerkUser) {
        console.log('❌ Clerk user not found');
        res.status(401).json({
          success: false,
          error: {
            message: 'User not found in Clerk',
            code: 'CLERK_USER_NOT_FOUND',
          },
        });
        return;
      }

      // Check if user exists in our database, if not create them
      console.log('🔍 Checking if user exists in database...');
      let dbUser = await User.findOne({ clerkId: clerkUser.id });
      console.log('💾 Database user found:', dbUser ? 'Yes' : 'No');
      
      if (!dbUser) {
        console.log('🆕 Creating new user in database...');
        // Auto-create user with default permissions
        dbUser = new User({
          _id: clerkUser.id, // Use Clerk ID as MongoDB _id
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          imageUrl: clerkUser.imageUrl || '',
          role: 'super_admin', // TEMPORARY: Full privileges for development
          permissions: [
            'view:employees',
            'manage:employees',
            'view:analytics',
            'manage:analytics',
            'view:teams',
            'manage:teams',
            'view:users',
            'manage:users',
            'manage:organizations',
            'manage:settings',
            'admin:full_access'
          ],
          profile: {
            directReports: [],
          },
          preferences: {
            notifications: {
              email: true,
              push: true,
              weekly_reports: false,
              burnout_alerts: true,
            },
            privacy: {
              anonymousFeedback: true,
              shareData: false,
            },
            ui: {
              theme: 'auto',
              language: 'en',
            },
          },
          status: 'active',
          lastLoginAt: new Date(),
        });
        
        try {
          await dbUser.save();
          console.log(`✅ Auto-created user: ${clerkUser.emailAddresses[0]?.emailAddress}`);
        } catch (saveError) {
          console.error('❌ Error saving user:', saveError);
          // If user creation fails, deny access
          res.status(403).json({
            success: false,
            error: {
              message: 'Unable to create user account. Access denied.',
              code: 'USER_CREATION_FAILED',
              details: saveError instanceof Error ? saveError.message : 'Unknown error'
            },
          });
          return;
        }
      } else {
        console.log('🔄 Updating existing user login time...');
        // Update last login time for existing user
        dbUser.lastLoginAt = new Date();
        await dbUser.save();
      }

      // Final verification: Ensure user exists in database
      if (!dbUser || !dbUser._id) {
        console.log('❌ Final check failed: User not properly created or retrieved');
        res.status(403).json({
          success: false,
          error: {
            message: 'User account not found in system. Access denied.',
            code: 'DATABASE_USER_NOT_FOUND',
          },
        });
        return;
      }

      // Attach user info to request object
      req.userId = clerkUser.id;
      req.user = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        imageUrl: clerkUser.imageUrl,
        createdAt: clerkUser.createdAt,
        updatedAt: clerkUser.updatedAt,
      };
      req.dbUser = dbUser;

      next();
    } catch (verificationError) {
      console.error('Token verification error:', verificationError);
      res.status(401).json({
        success: false,
        error: {
          message: 'Token verification failed',
          code: 'TOKEN_VERIFICATION_FAILED',
        },
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Authentication service error',
        code: 'AUTH_SERVICE_ERROR',
      },
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TEMPORARY: Skip authentication for development/testing
  console.log('🚨 WARNING: Optional authentication is temporarily disabled for development');
  next();
  return;

  // ORIGINAL OPTIONAL AUTH CODE (commented out for development)
  /*
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without authentication
    next();
    return;
  }

  // If token is provided, validate it
  await authenticateUser(req, res, next);
  */
};
