/* eslint-disable no-undef */
import cassandra from 'cassandra-driver';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const {
  ASTRA_DB_SECURE_BUNDLE_PATH,
  ASTRA_DB_APP_TOKEN,
  ASTRA_DB_SECURE_BUNDLE_B64,
} = process.env;
const bundlePath = ASTRA_DB_SECURE_BUNDLE_PATH;

if (ASTRA_DB_SECURE_BUNDLE_B64 && !fs.existsSync(bundlePath)) {
  const bundle = Buffer.from(ASTRA_DB_SECURE_BUNDLE_B64, 'base64');
  fs.writeFileSync(bundlePath, bundle);
}

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
