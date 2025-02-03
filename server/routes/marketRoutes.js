import express from 'express';
import {
  // fetchOnce,
  fetchInterval,
  endIntervalFetch,
  queryMarketData,
  applyCoupon,
  getEventIds,
} from '../controllers/marketController.js';

const router = express.Router();

// router.get('/fetchOnce', fetchOnce);
router.get('/fetchInterval', fetchInterval);
router.get('/endIntervalFetch', endIntervalFetch);
router.post('/query', queryMarketData);
router.post('/applyCoupon', applyCoupon);
router.get('/eventIds', getEventIds);

export default router;
