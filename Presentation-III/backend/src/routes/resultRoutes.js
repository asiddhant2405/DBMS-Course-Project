import express from 'express';
import {
  getAllResults,
  getResultById,
  createResult,
  updateResult,
  deleteResult
} from '../controllers/resultController.js';

const router = express.Router();

router.get('/', getAllResults);
router.get('/:id', getResultById);
router.post('/', createResult);
router.put('/:id', updateResult);
router.delete('/:id', deleteResult);

export default router;
