import express from 'express';
import {
  fetchOnce,
  fetchInterval,
  endIntervalFetch,
  queryMarketData,
} from '../controllers/marketController.js';

const router = express.Router();

router.get('/fetchOnce', fetchOnce);
router.get('/fetchInterval', fetchInterval);
router.get('/endIntervalFetch', endIntervalFetch);
router.post('/query', queryMarketData);

export default router;
