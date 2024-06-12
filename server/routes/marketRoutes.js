import express from 'express';
import {
  fetchAndStoreData,
  fetchInterval,
} from '../controllers/marketController.js';

const router = express.Router();

router.get('/fetchAndStore', fetchAndStoreData);
router.get('/fetchInterval', fetchInterval);

export default router;
