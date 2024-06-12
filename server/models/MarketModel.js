import client from '../config/astraClient.js';

// const basePath = `/api/rest/v2/namespaces/testks/collections/markets`;

// export const insertMarket = async (market) => {
//   try {
//     await client.connect();
//     const marketData = {
//       marketId: market.id,
//       status: market.status,
//       lastUpdated: new Date(market.lastUpdated).toISOString(),
//       inPlay: market.inPlay,
//       inPlayTime: market.inPlayTime,
//       volume: market.volume,
//       // selections: market.selections.map((selection) => ({
//       //   [selection.id]: {
//       //     'lay1.prc': selection.lay1 ? selection.lay1.prc : null,
//       //     'lay1.sz': selection.lay1 ? selection.lay1.sz : null,
//       //     'back1.prc': selection.back1 ? selection.back1.prc : null,
//       //     'back1.sz': selection.back1 ? selection.back1.sz : null,
//       //     LTP: selection.LTP,
//       //     vol: selection.vol,
//       //   },
//       // })),
//       name: market.name,
//       marketType: market.marketType,
//       eventId: market.eventId,
//       eventTypeId: market.eventTypeId,
//       startTime: market.startTime,
//       currentTime: new Date(),
//     };
//     console.log('Attempting to post market data to db...');
//     console.log('Market Data to insert: ', JSON.stringify(marketData, null, 2));
//     const response = await client.post(`${basePath}`, marketData);
//     console.log('Response: ', JSON.stringify(response, null, 2));
//     console.log('Data posted to db.');
//     return response.data;
//   } catch (e) {
//     console.error(e);
//   }
// };

// export const insertData = async (data) => {
//   const markets = data.result.markets;
//   for (const market of markets) {
//     await insertMarket(market);
//   }
// };

export const insertMarketInDB = async (market) => {
  const query = `
    INSERT INTO markets (market_id, status, last_updated, in_play, in_play_time, volume, name, market_type, event_id, event_type_id, selections, start_time, current_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  console.log(market);

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
    market.selections,
    new Date(market.startTime),
    new Date(),
  ];

  try {
    console.log('Attempting to insert markets to db...');
    await client.execute(query, params, { prepare: true });
    console.log('Market data inserted successfully.');
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
    console.log('All market data inserted.');
  } catch (error) {
    console.error('Failed to insert all data: ', error);
  }
};
