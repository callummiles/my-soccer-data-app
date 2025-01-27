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

export const insertDataInDB = async (data, skipTimeFilter = false) => {
  // Always filter out closed markets
  const openMarkets = data.result.markets.filter((market) => {
    const isNotClosed = market.status !== 'CLOSED';
    if (!isNotClosed) {
      console.log(`[MarketModel] Skipping closed market ${market.id}`);
    }
    return isNotClosed;
  });

  if (openMarkets.length === 0) {
    console.log('[MarketModel] No open markets to process');
    return;
  }

  if (skipTimeFilter) {
    console.log(
      '[MarketModel] Skipping time window filter, processing all',
      openMarkets.length,
      'open markets'
    );
    try {
      const promises = openMarkets.map((market) => insertMarketInDB(market));
      await Promise.all(promises);
      console.log('[MarketModel] Successfully processed all open markets');
      return;
    } catch (error) {
      console.error('[MarketModel] Error processing markets:', error);
      throw error;
    }
  }

  const now = new Date();

  // Filter markets that are within 5 minutes before start time or have started
  const relevantMarkets = openMarkets.filter((market) => {
    const startTime = new Date(market.startTime);
    const fetchStartTime = new Date(startTime.getTime() - 5 * 60 * 1000);
    const isWithinWindow = fetchStartTime <= now;

    if (isWithinWindow) {
      console.log(
        `[MarketModel] Market ${
          market.id
        } within time window - Start time: ${startTime.toISOString()}, Status: ${
          market.status
        }`
      );
      return true;
    }
    console.log(
      `[MarketModel] Market ${
        market.id
      } outside time window - Start time: ${startTime.toISOString()}, Status: ${
        market.status
      }`
    );
    return false;
  });

  console.log(
    '[MarketModel] Found',
    relevantMarkets.length,
    'markets within time window out of',
    openMarkets.length,
    'open markets'
  );

  if (relevantMarkets.length === 0) {
    console.log('[MarketModel] No markets within time window');
    return;
  }

  try {
    const promises = relevantMarkets.map((market) => insertMarketInDB(market));
    await Promise.all(promises);
    console.log('[MarketModel] Successfully processed all relevant markets');
  } catch (error) {
    console.error('[MarketModel] Error processing markets:', error);
    throw error;
  }
};
