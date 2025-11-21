import { Router } from 'express';
import {
  getCollection,
  getCollectionComments,
  addComment,
  getAiSummary,
  likeCollection
} from '../controllers/collectionController';

const router = Router();

router.get('/:id', getCollection);
router.get('/:id/comments', getCollectionComments);
router.post('/:id/comments', addComment);
router.put('/:id/like', likeCollection);
router.get('/:id/ai-summary', getAiSummary);

export default router;