import promisedClient from '../config/grpcConfig.js';
import { Query } from '@stargate-oss/stargate-grpc-node-client';

export const listAllEvents = async (pagingState = null, pageSize = 1000) => {
  const query = new Query();
  const queryStr = 'SELECT DISTINCT eventid FROM bfex_data.markets';
  query.setCql(queryStr);

  // Set the page size and paging state if provided
  query.setPageSize(pageSize);
  if (pagingState) {
    query.setPagingState(pagingState);
  }

  const result = await promisedClient.executeQuery(query);
  const rows = result.array[0][1];

  // Extract event IDs from the result
  const eventIds = rows
    .filter((row) => row && row[0] && row[0][0])
    .map((row) => {
      const values = row[0][0];
      return values[values.length - 1];
    })
    .filter(Boolean);

  // Get the paging state for the next query
  const nextPagingState = result.getPagingState();

  return {
    eventIds,
    pagingState: nextPagingState,
    hasMorePages: nextPagingState !== null,
  };
};

export const getEventData = async (
  eventId,
  pagingState = null,
  pageSize = 100
) => {
  const query = new Query();
  const queryStr = `SELECT * FROM bfex_data.markets WHERE eventid = '${eventId}'`;
  query.setCql(queryStr);

  // Set the page size and paging state if provided
  query.setPageSize(pageSize);
  if (pagingState) {
    query.setPagingState(pagingState);
  }

  const result = await promisedClient.executeQuery(query);

  // Get column headers and data rows
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

  // Get the paging state for the next query
  const nextPagingState = result.getPagingState();

  return {
    dataRows,
    pagingState: nextPagingState,
    hasMorePages: nextPagingState !== null,
  };
};
