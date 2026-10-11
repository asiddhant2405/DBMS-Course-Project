import express from 'express';
import {
  getDatabaseOverview,
  resetAndSeedDatabase
} from '../controllers/databaseController.js';

const router = express.Router();

router.get('/overview', getDatabaseOverview);
router.post('/seed', resetAndSeedDatabase);

export default router;
