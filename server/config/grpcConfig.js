/* eslint-disable no-undef */
import dotenv from 'dotenv';
import grpc from '@grpc/grpc-js';
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

const stargateClient = new StargateClient(astra_uri, credentials);
const promisedClient = promisifyStargateClient(stargateClient);

export default promisedClient;
