/* eslint-disable no-undef */
import express from 'express';
import ViteExpress from 'vite-express';
import marketRoutes from './routes/marketRoutes.js';
// import client from './config/astraClient.js';
import promisedClient from './config/grpcConfig.js';
import { Query } from '@stargate-oss/stargate-grpc-node-client';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(express.json());

app.use('/api', marketRoutes);

app.get('/message', (_, res) => {
  // res.send('Hello from express!')
  res.json({ message: 'Hello from express!' });
});

ViteExpress.listen(app, 3000, async () => {
  try {
    //await client.connect();
    const query = new Query();
    const queryString = 'SELECT * FROM bfex_data.markets LIMIT 1;';
    query.setCql(queryString);
    const result = await promisedClient.executeQuery(query);
    console.log(
      'Astra DB client initialized. Data: ',
      result.array[0][0][0][0][0]
    );
    console.log('Server is listening...');
  } catch (e) {
    console.error('Failed to initialize Astra DB client: ', e);
    process.exit(1);
  }
});
