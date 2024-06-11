/* eslint-disable no-undef */
// import dotenv from 'dotenv';
// dotenv.config();

// import { createClient } from '@astrajs/rest';

// const { ASTRA_DB_ID, ASTRA_DB_REGION, ASTRA_DB_APP_TOKEN } = process.env;

// const baseUrl = `https://${ASTRA_DB_ID}-${ASTRA_DB_REGION}.apps.astra.datastax.com`;

// export const astraClient = createClient({
//   baseUrl,
//   astraDatabaseId: ASTRA_DB_ID,
//   astraDatabaseRegion: ASTRA_DB_REGION,
//   applicationToken: ASTRA_DB_APP_TOKEN,
// });

import cassandra from 'cassandra-driver';
import dotenv from 'dotenv';
dotenv.config();

const { ASTRA_DB_SECURE_BUNDLE_PATH, ASTRA_DB_APP_TOKEN } = process.env;

const cloud = { secureConnectBundle: ASTRA_DB_SECURE_BUNDLE_PATH };
const authProvider = new cassandra.auth.PlainTextAuthProvider(
  'token',
  ASTRA_DB_APP_TOKEN
);

const client = new cassandra.Client({
  cloud,
  authProvider,
  keyspace: 'testks',
});

export default client;
