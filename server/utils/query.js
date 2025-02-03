import promisedClient from '../config/grpcConfig.js';
import { Query } from '@stargate-oss/stargate-grpc-node-client';

export const queryPagedData = async (
  eventId,
  lastTimestamp,
  fetchEventIds = false,
  // page = 1,
  pageSize = 100
) => {
  if (fetchEventIds) {
    console.log('Executing distinct eventid query...');
    const distinctEventIds = new Set(); // Use Set to avoid duplicates
    let hasMorePages = true;
    let pagingState = null;

    while (hasMorePages) {
      const query = new Query();
      query.setCql('SELECT DISTINCT eventid FROM bfex_data.markets LIMIT 1000');

      if (pagingState) {
        query.setPagingState(pagingState);
      }

      const result = await promisedClient.executeQuery(query);
      const rows = result.array[0][1];
      pagingState = result.pagingState;

      console.log(`Processing batch, got ${rows.length} rows`);

      if (rows.length === 0) {
        hasMorePages = false;
        break;
      }

      for (const row of rows) {
        try {
          if (row && row[0] && row[0][0]) {
            const values = row[0][0];
            const eventId = values[values.length - 1];
            if (eventId) {
              distinctEventIds.add(eventId);
            }
          }
        } catch (err) {
          console.error('Error processing row:', err);
        }
      }

      // If no paging state is returned, we've reached the end
      if (!pagingState) {
        hasMorePages = false;
      }
    }

    const sortedEventIds = Array.from(distinctEventIds).sort();
    console.log('Total distinct event IDs found:', sortedEventIds.length);
    return { distinctEventIds: sortedEventIds };
  }

  const timestampISO = lastTimestamp
    ? new Date(lastTimestamp).toISOString()
    : null;

  let queryStr = `SELECT * FROM bfex_data.markets WHERE eventid = '${eventId}'`;
  if (timestampISO) {
    queryStr += ` AND current_time < '${timestampISO}'`;
  }
  queryStr += ` LIMIT ${pageSize}`;
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
