import client from '../config/astraClient.js';

export const insertMarketInDB = async (market) => {
  const query = `
    INSERT INTO markets (market_id, status, last_updated, in_play, in_play_time, volume, name, market_type, event_id, event_type_id, selections, start_time, current_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  //console.log(market);

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
  ];

  try {
    //console.log('Attempting to insert markets to db...');
    await client.execute(query, params, { prepare: true });
    //console.log('Market data inserted successfully.');
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
    //console.log('All market data inserted.');
  } catch (error) {
    console.error('Failed to insert all data: ', error);
  }
};
