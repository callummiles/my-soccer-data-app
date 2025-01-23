/* eslint-disable no-undef */
import dotenv from 'dotenv';
import grpc from '@grpc/grpc-js';
import {
  StargateBearerToken,
  StargateClient,
  promisifyStargateClient,
  Query,
} from '@stargate-oss/stargate-grpc-node-client';

dotenv.config();

console.log('[gRPC Config] Starting gRPC client initialization...');

const astra_uri = `${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com:443`;
console.log('[gRPC Config] Astra URI:', astra_uri);

const bearer_token = process.env.ASTRA_DB_APP_TOKEN;
console.log('[gRPC Config] Bearer token exists:', !!bearer_token);

console.log('[gRPC Config] Creating bearer token instance...');
const bearerToken = new StargateBearerToken(bearer_token);

console.log('[gRPC Config] Creating SSL credentials...');
const credentials = grpc.credentials.combineChannelCredentials(
  grpc.credentials.createSsl(),
  bearerToken
);
console.log('[gRPC Config] Credentials created:', !!credentials);

console.log('[gRPC Config] Creating Stargate client...');
const stargateClient = new StargateClient(astra_uri, credentials);
console.log('[gRPC Config] Stargate client created:', !!stargateClient);
console.log('[gRPC Config] Stargate client methods:', Object.keys(stargateClient));

console.log('[gRPC Config] Promisifying client...');
const promisedClient = promisifyStargateClient(stargateClient);
console.log('[gRPC Config] Promised client created:', !!promisedClient);
console.log('[gRPC Config] Promised client methods:', Object.keys(promisedClient));

// Add connection status check
const checkConnection = async () => {
  try {
    const query = new Query();
    query.setCql('SELECT release_version FROM system.local');
    const response = await promisedClient.executeQuery(query);
    console.log('[gRPC Config] Database connection test successful:', response);
  } catch (error) {
    console.error('[gRPC Config] Database connection test failed:', error);
    console.error('[gRPC Config] Error details:', JSON.stringify(error, null, 2));
  }
};

checkConnection();

export default promisedClient;
