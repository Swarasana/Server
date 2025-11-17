import { Router } from 'express';
import {
  getCollection,
  getCollectionComments,
  addComment,
  getAiSummary
} from '../controllers/collectionController';

const router = Router();

router.get('/:id', getCollection);
router.get('/:id/comments', getCollectionComments);
router.post('/:id/comments', addComment);
router.get('/:id/ai-summary', getAiSummary);

export default router;