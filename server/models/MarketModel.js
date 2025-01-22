//import client from '../config/astraClient.js';
import promisedClient from '../config/grpcConfig.js';

export const insertMarketInDB = async (market) => {
  console.log('[MarketModel] Starting insertMarketInDB...');
  console.log('[MarketModel] Market data:', JSON.stringify(market, null, 2));
  
  const query = `
    INSERT INTO markets (market_id, status, last_updated, in_play, in_play_time, volume, name, market_type, event_id, event_type_id, selections, start_time, current_time, first_half_started, first_half_ended, second_half_started, second_half_ended)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  console.log('[MarketModel] Query:', query);

  console.log('[MarketModel] Processing selections...');
  const selectionsJSON = JSON.stringify(market.selections);
  console.log('[MarketModel] Selections JSON:', selectionsJSON);

  console.log('[MarketModel] Preparing parameters...');
  const params = [
    market.id,
    market.status,
    new Date(market.lastUpdated),
    market.inPlay,
    market.inPlayTime,
    market.volume,
    market.name,
    market.marketType,
    market.eventId,
    market.eventTypeId,
    selectionsJSON,
    new Date(market.startTime),
    new Date(),
    null,
    null,
    null,
    null,
  ];
  console.log('[MarketModel] Parameters:', params);
  console.log('[MarketModel] Parameter types:', params.map(p => `${p === null ? 'null' : typeof p}${p instanceof Date ? ' (Date)' : ''}`));

  try {
    console.log('[MarketModel] Checking promisedClient:', !!promisedClient);
    console.log('[MarketModel] Available methods:', Object.keys(promisedClient));
    
    console.log('[MarketModel] Executing query...');
    await promisedClient.execute(query, params, { prepare: true });
    console.log('[MarketModel] Query executed successfully');
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
