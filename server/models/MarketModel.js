import { astraClient } from '../config/astraClient.js';

const basePath = `/api/rest/v2/namespaces/testks/collections/markets`;

export const insertMarket = async (market) => {
  try {
    const client = await astraClient;
    const marketData = {
      id: market.id,
      status: market.status,
      lastUpdated: new Date(market.lastUpdated).toISOString(),
      inPlay: market.inPlay,
      inPlayTime: market.inPlayTime,
      volume: market.volume,
      selections: market.selections.map((selection) => ({
        [selection.id]: {
          lay1: selection.lay1
            ? { prc: selection.lay1.prc, sz: selection.lay1.sz }
            : null,
          back1: selection.back1
            ? { prc: selection.back1.prc, sz: selection.back1.sz }
            : null,
          LTP: selection.LTP,
          vol: selection.vol,
        },
      })),
    };

    console.log('Market Data: ', JSON.stringify(marketData, null, 2));
    ('Attempting to post market data to db...');
    const response = await client.post(basePath, marketData);
    ('Data posted to db.');
    return response.data;
  } catch (e) {
    if (e.response) {
      console.error('Error response data: ', e.response.data);
      console.error('Error response status: ', e.response.status);
      console.error('Error response headers: ', e.response.headers);
    } else {
      console.error('Error message: ', e.message);
    }
  }
};

export const insertData = async (data) => {
  const markets = data.result.markets;
  for (const market of markets) {
    await insertMarket(market);
  }
};
