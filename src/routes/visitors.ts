import { Router } from 'express';
import {
  recordVisit,
  getVisitorCount,
  getVisitAnalytics,
  getTrendingCollections,
  getUserVisitedCollections
} from '../controllers/visitorController';
import { auth, optionalAuth } from '../middleware/auth';

const router = Router();

// Record a visit to a collection (supports both authenticated and anonymous users)
router.post('/collections/:id/visit', optionalAuth, recordVisit);

// Get visitor count for a collection
router.get('/collections/:id/visitor-count', getVisitorCount);

// Get visit analytics for a collection (curator only)
router.get('/collections/:id/analytics', getVisitAnalytics);

// Get trending collections
router.get('/trending', getTrendingCollections);

// Get collections visited by authenticated user
router.get('/user/visited-collections', auth, getUserVisitedCollections);

export default router;