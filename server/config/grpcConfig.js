/* eslint-disable no-undef */
import dotenv from 'dotenv';
import {
  StargateBearerToken,
  StargateClient,
  promisifyStargateClient,
} from '@stargate-oss/stargate-grpc-node-client';

dotenv.config();

const astra_uri = `${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com:443`;
const bearer_token = process.env.ASTRA_DB_APP_TOKEN;

const bearerToken = new StargateBearerToken(bearer_token);
const credentials = grpc.credentials.combineChannelCredentials(
  grpc.credentials.createSsl(),
  bearerToken
);

console.log(credentials);

// const stargateClient = new StargateClient(astra_uri, grpc.credentials.createInsecure());

// console.log("made client");

// const promisedClient = promisifyStargateClient(stargateClient);

// console.log("promised client");

const stargateClient = new StargateClient(astra_uri, credentials);
const promisedClient = promisifyStargateClient(stargateClient);

export default promisedClient;
