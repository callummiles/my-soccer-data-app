/* eslint-disable no-undef */
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
  keyspace: 'bfex_data',
});

export default client;
