import promisedClient from '../config/grpcConfig.js';
import { Query } from '@stargate-oss/stargate-grpc-node-client';

export const queryPagedData = async (eventId, marketId, lastTimestamp) => {
  const timestampISO = lastTimestamp
    ? new Date(lastTimestamp).toISOString()
    : null;

  let queryStr = `SELECT * FROM bfex_data.markets WHERE event_id = '${eventId}' AND market_id = '${marketId}'`;
  if (timestampISO) {
    queryStr += ` AND current_time < '${timestampISO}'`;
  }
  queryStr += ' LIMIT 100';
  const query = new Query();
  query.setCql(queryStr);

  console.log(`Querying with lastTimestamp: ${lastTimestamp}`);
  console.log(`Formatted timestampISO: ${timestampISO}`);
  console.log(`Query: ${queryStr}`);

  const result = await promisedClient.executeQuery(query);

  // Extract column headers
  const columnHeaders = result.array[0][0].map((col) => col[1]);

  // Extract data rows
  const dataRows = result.array[0][1].map((row) => {
    const rowData = {};
    if (row && row[0]) {
      row[0].forEach((colData, index) => {
        if (colData && Array.isArray(colData)) {
          // Find the last non-null value in the array
          const nonNullValues = colData.filter((val) => val !== null);
          rowData[columnHeaders[index]] =
            nonNullValues.length > 0
              ? nonNullValues[nonNullValues.length - 1]
              : null;
        }
      });
    }
    return rowData;
  });

  //   // Find the last timestamp in the current batch of data rows
  //   const newLastTimestamp =
  //     dataRows.length > 0 ? dataRows[dataRows.length - 1].current_time : null;

  //   let newLastTimestampISO = newLastTimestamp
  //     ? new Date(newLastTimestamp).toISOString()
  //     : null;

  //   if (newLastTimestampISO === timestampISO) {
  //     newLastTimestampISO = null;
  //   }

  const newLastTimestamp =
    dataRows.length > 0 ? dataRows[dataRows.length - 1].current_time : null;

  const newLastTimestampISO = newLastTimestamp
    ? new Date(newLastTimestamp).toISOString()
    : null;

  console.log(`Fetched ${dataRows.length} rows`);
  console.log(`New lastTimestamp: ${newLastTimestamp}`);

  return { dataRows, lastTimestamp: newLastTimestampISO };
};
