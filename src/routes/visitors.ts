import { Router } from 'express';
import {
  recordVisit,
  getVisitorCount,
  getVisitAnalytics,
  getTrendingCollections
} from '../controllers/visitorController';

const router = Router();

// Record a visit to a collection
router.post('/collections/:id/visit', recordVisit);

// Get visitor count for a collection
router.get('/collections/:id/visitor-count', getVisitorCount);

// Get visit analytics for a collection (curator only)
router.get('/collections/:id/analytics', getVisitAnalytics);

// Get trending collections
router.get('/trending', getTrendingCollections);

export default router;