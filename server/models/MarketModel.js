import { astraClient } from '../config/astraClient.js';

const basePath = `/api/rest/v2/namespaces/testks/collections/markets`;

export const insertMarket = async (market) => {
  try {
    const client = await astraClient;
    // console.log('Market ID;', typeof market.id);
    // console.log('Market Status;', typeof market.status);
    // console.log('Market Timestamp:', typeof market.lastUpdated);
    // console.log('Market inPlay:', typeof market.inPlay);
    // console.log('Market inPlayTime:', market.inPlayTime);
    // console.log('Market Volume:', typeof market.volume);
    const marketData = {
      //id: market.id,
      status: market.status,
      lastUpdated: new Date(market.lastUpdated).toISOString(),
      inPlay: market.inPlay,
      inPlayTime: market.inPlayTime,
      volume: market.volume,
      // selections: market.selections.map((selection) => ({
      //   [selection.id]: {
      //     'lay1.prc': selection.lay1 ? selection.lay1.prc : null,
      //     'lay1.sz': selection.lay1 ? selection.lay1.sz : null,
      //     'back1.prc': selection.back1 ? selection.back1.prc : null,
      //     'back1.sz': selection.back1 ? selection.back1.sz : null,
      //     LTP: selection.LTP,
      //     vol: selection.vol,
      //   },
      // })),
      name: market.name,
      marketType: market.marketType,
      eventId: market.eventId,
      eventTypeId: market.eventTypeId,
      startTime: market.startTime,
      currentTime: new Date(),
    };

    //console.log('Market Data: ', JSON.stringify(marketData, null, 2));
    console.log('Attempting to post market data to db...');
    // console.log(client);
    // console.log(basePath);
    // console.log(marketData);
    const response = await client.put(`${basePath}/${market.id}`, marketData);
    console.log('Data posted to db.');
    return response.data;
  } catch (e) {
    console.error(e);
  }
};

export const insertData = async (data) => {
  const markets = data.result.markets;
  for (const market of markets) {
    await insertMarket(market);
  }
};
