import { Router } from 'express';
import {
  getExhibitions,
  getExhibition,
  getExhibitionCollections
} from '../controllers/exhibitionController';

const router = Router();

router.get('/', getExhibitions);
router.get('/:id', getExhibition);
router.get('/:id/collections', getExhibitionCollections);

export default router;