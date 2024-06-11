/* eslint-disable no-undef */
import express from 'express';
import ViteExpress from 'vite-express';
import marketRoutes from './routes/marketRoutes.js';
import { astraClient } from './config/astraClient.js';
import { createTable } from './config/createTable.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

createTable()
  .then(() => {
    console.log('Table creation complete.');
  })
  .catch((err) => {
    console.log('Error creating table: ', err);
  });

app.use('/api', marketRoutes);

app.get('/message', (_, res) => res.send('Hello from express!'));

ViteExpress.listen(app, 3000, async () => {
  try {
    const client = await astraClient;
    console.log('Astra DB client initialized: ', client.baseUrl);
    console.log('Server is listening...');
  } catch (e) {
    console.error('Failed to initialize Astra DB client: ', e);
    process.exit(1);
  }
});
