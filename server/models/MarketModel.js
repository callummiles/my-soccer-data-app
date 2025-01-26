import promisedClient from '../config/grpcConfig.js';
import { Query } from '@stargate-oss/stargate-grpc-node-client';

export const insertMarketInDB = async (market) => {
  console.log('[MarketModel] Inserting market:', market.id);

  try {
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
    return response;
  } catch (error) {
    console.error('[MarketModel] Error inserting market:', error);
    throw error;
  }
};

export const insertDataInDB = async (data) => {
  console.log('[MarketModel] Processing', data.result.markets.length, 'markets');

  const markets = data.result.markets;
  try {
    for (const market of markets) {
      await insertMarketInDB(market);
    }
    console.log('[MarketModel] Successfully processed all markets');
  } catch (error) {
    console.error('[MarketModel] Error processing markets:', error);
    throw error;
  }
};
