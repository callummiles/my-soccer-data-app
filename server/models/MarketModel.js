import promisedClient from '../config/grpcConfig.js';
import { Query } from '@stargate-oss/stargate-grpc-node-client';

export const insertMarketInDB = async (market) => {
  console.log('[MarketModel] Starting insertMarketInDB...');
  console.log('[MarketModel] Market data:', JSON.stringify(market, null, 2));

  try {
    console.log('[MarketModel] Preparing values...');
    const selectionsJSON = JSON.stringify(market.selections);

    const query = new Query();
    const queryString = `INSERT INTO bfex_data.markets (
      marketid, status, lastupdate, inplay, inplaytime,
      volume, name, markettype, eventid, eventtypeid,
      selections, starttime, currenttime, firsthalfstart,
      firsthalfend, secondhalfstart, secondhalfend
    ) VALUES (
      '${market.id}', 
      '${market.status}', 
      ${new Date(market.lastUpdated).getTime()}, 
      ${market.inPlay}, 
      ${market.inPlayTime || 0}, 
      ${market.volume || 0.0}, 
      '${market.name}', 
      '${market.marketType}', 
      '${market.eventId}', 
      '${market.eventTypeId}', 
      '${selectionsJSON}', 
      ${new Date(market.startTime).getTime()}, 
      ${new Date().getTime()}, 
      null, 
      null, 
      null, 
      null
    );`;

    // Set the CQL statement
    query.setCql(queryString);

    // Execute the query statement
    const response = await promisedClient.executeQuery(query);
    console.log('[MarketModel] Insert executed:', response);
    return response;
  } catch (error) {
    console.error('[MarketModel] Failed to insert market data:', error);
    console.error('[MarketModel] Error stack:', error.stack);
    throw error;
  }
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
