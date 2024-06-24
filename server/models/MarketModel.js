//import client from '../config/astraClient.js';
import promisedClient from '../config/grpcConfig.js';

export const insertMarketInDB = async (market) => {
  const query = `
    INSERT INTO markets (market_id, status, last_updated, in_play, in_play_time, volume, name, market_type, event_id, event_type_id, selections, start_time, current_time, first_half_started, first_half_ended, second_half_started, second_half_ended)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const selectionsJSON = JSON.stringify(market.selections);

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

  try {
    await promisedClient.execute(query, params, { prepare: true });
  } catch (error) {
    console.error('Failed to insert market data: ', error);
  }
};

export const insertDataInDB = async (data) => {
  const markets = data.result.markets;
  try {
    for (const market of markets) {
      await insertMarketInDB(market);
    }
  } catch (error) {
    console.error('Failed to insert all data: ', error);
  }
};
