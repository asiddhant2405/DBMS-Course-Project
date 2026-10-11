import express from 'express';
import {
  listPredefinedQueries,
  executePredefinedQuery
} from '../controllers/queryController.js';

const router = express.Router();

router.get('/', listPredefinedQueries);
router.get('/:queryKey', executePredefinedQuery);

export default router;
