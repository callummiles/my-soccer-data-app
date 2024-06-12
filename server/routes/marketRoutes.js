import express from 'express';
import { fetchOnce, fetchInterval } from '../controllers/marketController.js';

const router = express.Router();

router.get('/fetchOnce', fetchOnce);
router.get('/fetchInterval', fetchInterval);

export default router;
