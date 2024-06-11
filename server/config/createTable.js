/* eslint-disable no-undef */
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const { ASTRA_DB_ID, ASTRA_DB_REGION, ASTRA_DB_APP_TOKEN } = process.env;

export const createTable = async () => {
  const url = `https://${ASTRA_DB_ID}-${ASTRA_DB_REGION}.apps.astra.datastax.com//api/rest/v2/schemas/keyspaces/testks/tables`;

  const tableDef = {
    name: 'markets',
    ifNotExists: true,
    columnDefinitions: [
      { name: 'eventId', typeDefinition: 'uuid' },
      { name: 'marketId', typeDefinition: 'uuid' },
      { name: 'status', typeDefinition: 'text' },
      { name: 'lastUpdate', typeDefinition: 'timestamp' },
      { name: 'inPlay', typeDefinition: 'boolean' },
      { name: 'inPlayTime', typeDefinition: 'int' },
      { name: 'volume', typeDefinition: 'decimal' },
      { name: 'name', typeDefinition: 'text' },
      { name: 'marketType', typeDefinition: 'text' },
      { name: 'eventTypeId', typeDefinition: 'int' },
      { name: 'startTime', typeDefinition: 'timestamp' },
      { name: 'currentTime', typeDefinition: 'timestamp' },
    ],
    primaryKey: {
      partitionKey: ['eventId', 'marketId'],
      clusteringKey: ['currentTime'],
    },
    tableOptions: {
      clusteringExpression: [{ column: 'currentTime', order: 'DESC' }],
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Cassandra-Token': ASTRA_DB_APP_TOKEN,
    },
    body: JSON.stringify(tableDef),
  });

  if (response.ok) {
    const jsonResponse = await response.json();
    console.log('Table created successfully: ', jsonResponse);
  } else {
    const errorResponse = await response.json();
    console.log('Error creating table: ', errorResponse);
  }
};
