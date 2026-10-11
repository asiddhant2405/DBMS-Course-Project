import express from 'express';
import {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule
} from '../controllers/moduleController.js';

const router = express.Router();

router.get('/', getAllModules);
router.get('/:id', getModuleById);
router.post('/', createModule);
router.put('/:id', updateModule);
router.delete('/:id', deleteModule);

export default router;
