import express from 'express';
import { fetchAndStoreData } from '../controllers/marketController.js';

const router = express.Router();

router.get('/fetchAndStore', fetchAndStoreData);

export default router;
