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
  const now = new Date();

  // Filter markets that are within 5 minutes before start time or have started but not closed
  const relevantMarkets = data.result.markets.filter((market) => {
    const startTime = new Date(market.startTime);
    const fetchStartTime = new Date(startTime.getTime() - 5 * 60 * 1000);
    const isWithinWindow = fetchStartTime <= now;
    const isNotClosed = market.status !== 'CLOSED';

    if (isWithinWindow && isNotClosed) {
      console.log(
        `[Market ${
          market.id
        }] Start time: ${startTime.toISOString()}, Status: ${market.status}`
      );
      return true;
    }
    return false;
  });

  console.log(
    '[MarketModel] Processing',
    relevantMarkets.length,
    'markets within time window'
  );

  if (relevantMarkets.length === 0) {
    console.log(
      '[MarketModel] No markets within time window or all markets closed'
    );
    return;
  }

  try {
    const promises = relevantMarkets.map((market) => insertMarketInDB(market));
    await Promise.all(promises);
    console.log('[MarketModel] All markets processed successfully');
  } catch (error) {
    console.error('[MarketModel] Error processing markets:', error);
    throw error;
  }
};
