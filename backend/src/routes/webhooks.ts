import { Router, Request, Response } from 'express';
import { Webhook } from 'svix';

const router = Router();

// @route   POST /api/webhooks/clerk
// @desc    Handle Clerk webhooks for user events
// @access  Public (but verified)
router.post('/clerk', async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET is not configured');
      res.status(500).json({
        success: false,
        error: 'Webhook secret not configured',
      });
      return;
    }

    // Get the headers
    const headers = req.headers;
    const payload = JSON.stringify(req.body);

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(webhookSecret);

    let evt;
    try {
      evt = wh.verify(payload, headers as any);
    } catch (err) {
      console.error('Webhook verification failed:', err);
      res.status(400).json({
        success: false,
        error: 'Webhook verification failed',
      });
      return;
    }

    // Handle the webhook event
    const eventType = (evt as any).type;
    
    switch (eventType) {
      case 'user.created':
        console.log('🆕 User created:', (evt as any).data);
        // TODO: Create user profile in MongoDB
        break;
        
      case 'user.updated':
        console.log('✏️  User updated:', (evt as any).data);
        // TODO: Update user profile in MongoDB
        break;
        
      case 'user.deleted':
        console.log('🗑️  User deleted:', (evt as any).data);
        // TODO: Handle user deletion (soft delete or cleanup)
        break;
        
      case 'session.created':
        console.log('🔐 Session created:', (evt as any).data);
        // TODO: Track user sessions if needed
        break;
        
      default:
        console.log(`🔔 Unhandled webhook event: ${eventType}`);
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed',
    });
  }
});

export default router;
