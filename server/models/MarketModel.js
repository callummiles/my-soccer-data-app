import promisedClient from '../config/grpcConfig.js';
import { Query } from '@stargate-oss/stargate-grpc-node-client';

export const insertMarketInDB = async (market) => {
  // console.log('[MarketModel] Starting insertMarketInDB...');
  // console.log('[MarketModel] Market data:', JSON.stringify(market, null, 2));

  // try {
  //   console.log('[MarketModel] Preparing values...');
  //   const selectionsJSON = JSON.stringify(market.selections);

  //   // Create a query builder for insertion
  //   const query = {
  //     query: {
  //       value: `INSERT INTO markets (
  //         market_id, status, last_updated, in_play, in_play_time,
  //         volume, name, market_type, event_id, event_type_id,
  //         selections, start_time, current_time, first_half_started,
  //         first_half_ended, second_half_started, second_half_ended
  //       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  //       parameters: {
  //         values: [
  //           { string: market.id },
  //           { string: market.status },
  //           { timestamp: new Date(market.lastUpdated).getTime() },
  //           { boolean: market.inPlay },
  //           { int: market.inPlayTime || 0 },
  //           { double: market.volume || 0.0 },
  //           { string: market.name },
  //           { string: market.marketType },
  //           { string: market.eventId },
  //           { string: market.eventTypeId },
  //           { string: selectionsJSON },
  //           { timestamp: new Date(market.startTime).getTime() },
  //           { timestamp: new Date().getTime() },
  //           { boolean: null },
  //           { boolean: null },
  //           { boolean: null },
  //           { boolean: null }
  //         ]
  //       }
  //     }
  //   };

  //   console.log('[MarketModel] Executing query...');
  //   const response = await promisedClient.executeQuery(query);
  //   console.log('[MarketModel] Query executed successfully:', response);
  //   return response;

  // } catch (error) {
  //   console.error('[MarketModel] Failed to insert market data:', error);
  //   console.error('[MarketModel] Error stack:', error.stack);
  //   throw error;
  // }

  const query = new Query();
  const queryString = 'SELECT * FROM bfex_data.markets;';
  // Set the CQL statement using the string defined in the last line
  query.setCql(queryString);

  // For Stargate OSS: execute the query statement
  const response = await promisedClient.executeQuery(query);

  console.log('[MarketModel] select executed:', response);
};

export const insertDataInDB = async (data) => {
  console.log('[MarketModel] Starting insertDataInDB...');
  console.log('[MarketModel] Data structure:', Object.keys(data));
  console.log('[MarketModel] Number of markets:', data.result.markets.length);

  const markets = data.result.markets;
  try {
    console.log('[MarketModel] Starting market insertion loop...');
    for (const market of markets) {
      console.log('[MarketModel] Processing market:', market.id);
      await insertMarketInDB(market);
      console.log('[MarketModel] Successfully inserted market:', market.id);
    }
    console.log('[MarketModel] All markets inserted successfully');
  } catch (error) {
    console.error('[MarketModel] Failed to insert all data:', error);
    console.error('[MarketModel] Error stack:', error.stack);
    throw error;
  }
};
