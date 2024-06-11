import { astraClient } from '../config/astraClient.js';

const basePath = `/api/rest/v2/namespaces/testks/collections/markets`;

export const insertMarket = async (market) => {
  try {
    const client = await astraClient;
    const marketData = {
      marketId: market.id,
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
      //eventId: market.eventId,
      eventTypeId: market.eventTypeId,
      startTime: market.startTime,
      currentTime: new Date(),
    };
    console.log('Attempting to post market data to db...');
    const response = await client.post(
      `${basePath}/${market.eventId}`,
      marketData
    );
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
