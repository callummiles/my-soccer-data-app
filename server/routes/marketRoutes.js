import express from 'express';
import {
  // fetchOnce,
  fetchInterval,
  endIntervalFetch,
  queryMarketData,
  applyCoupon,
} from '../controllers/marketController.js';

const router = express.Router();

// router.get('/fetchOnce', fetchOnce);
router.get('/fetchInterval', fetchInterval);
router.get('/endIntervalFetch', endIntervalFetch);
router.post('/query', queryMarketData);
router.post('/applyCoupon', applyCoupon);

export default router;
