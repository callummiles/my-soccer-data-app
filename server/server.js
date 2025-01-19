/* eslint-disable no-undef */
import express from 'express';
import ViteExpress from 'vite-express';
import marketRoutes from './routes/marketRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { auth } from './middleware/auth.js';
import promisedClient from './config/grpcConfig.js';
import { Query } from '@stargate-oss/stargate-grpc-node-client';

import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Auth routes (unprotected)
app.use('/auth', authRoutes);

// Protected routes
app.use('/api', auth, marketRoutes);

app.get('/message', (_, res) => {
  res.json({ message: 'Hello from express!' });
});

const port = process.env.PORT || 3000;

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server is listening on port ${port}...`);
});

ViteExpress.bind(app, server);

// Try to initialize DB connection
(async () => {
  try {
    const query = new Query();
    const queryStr = 'SELECT * FROM bfex_data.markets LIMIT 1;';
    query.setCql(queryStr);

    const result = await promisedClient.executeQuery(query);
    console.log('Astra DB initialized. Data: ', result.array[0][0][0]);
  } catch (e) {
    console.error('Warning: Failed to init Astra DB: ', e);
  }
})();
