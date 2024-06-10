/* eslint-disable no-undef */
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@astrajs/rest';

const { ASTRA_DB_ID, ASTRA_DB_REGION, ASTRA_DB_APP_TOKEN } = process.env;

const baseUrl = `https://${ASTRA_DB_ID}-${ASTRA_DB_REGION}.apps.astra.datastax.com`;

export const astraClient = createClient({
  baseUrl,
  astraDatabaseId: ASTRA_DB_ID,
  astraDatabaseRegion: ASTRA_DB_REGION,
  applicationToken: ASTRA_DB_APP_TOKEN,
});
