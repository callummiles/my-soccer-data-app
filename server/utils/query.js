import promisedClient from '../config/grpcConfig.js';
import { Query } from '@stargate-oss/stargate-grpc-node-client';

export const queryPagedData = async (
  eventId,
  lastTimestamp,
  fetchEventIds = false
) => {
  if (fetchEventIds) {
    const query = new Query();
    query.setCql('SELECT DISTINCT eventid FROM bfex_data.markets');

    const result = await promisedClient.executeQuery(query);

    const distinctEventIds = result.array[0][1]
      .map((row) => {
        if (row && row[0] && row[0][0] && row[0][0][1]) {
          return row[0][0][1];
        }
        return null;
      })
      .filter((id) => id !== null);

    return { distinctEventIds };
  }

  const timestampISO = lastTimestamp
    ? new Date(lastTimestamp).toISOString()
    : null;

  let queryStr = `SELECT * FROM bfex_data.markets WHERE eventid = '${eventId}'`;
  if (timestampISO) {
    queryStr += ` AND current_time < '${timestampISO}'`;
  }
  queryStr += ' LIMIT 100';
  const query = new Query();
  query.setCql(queryStr);

  const result = await promisedClient.executeQuery(query);

  const columnHeaders = result.array[0][0].map((col) => col[1]);

  const dataRows = result.array[0][1].map((row) => {
    const rowData = {};
    if (row && row[0]) {
      row[0].forEach((colData, index) => {
        if (colData && Array.isArray(colData)) {
          const nonNullValues = colData.filter((val) => val !== null);
          rowData[columnHeaders[index]] =
            nonNullValues.length > 0
              ? nonNullValues[nonNullValues.length - 1]
              : null;
        }
      });
    }
    if (rowData.selections) {
      try {
        rowData.selections = JSON.parse(rowData.selections);
      } catch (error) {
        console.error('Error parsing selections JSON:', error);
      }
    }
    return rowData;
  });

  const newLastTimestamp =
    dataRows.length > 0 ? dataRows[dataRows.length - 1].current_time : null;

  const newLastTimestampISO = newLastTimestamp
    ? new Date(newLastTimestamp).toISOString()
    : null;

  return { dataRows, lastTimestamp: newLastTimestampISO };
};
