/* eslint-disable no-undef */
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const { BA_PRICES_ENDPOINT, BA_MARKETS_ENDPOINT } = process.env;

const rawPricesReq = {
  dataRequired: [
    'BEST_PRICE_ONLY',
    'INPLAY_INFO',
    'LAST_TRADED_PRICE',
    'VOLUME',
  ],
};

const rawMarketsReq = {
  dataRequired: [
    'ID',
    'NAME',
    'MARKET_START_TIME',
    'MARKET_INPLAY_STATUS',
    'EVENT_ID',
    'EVENT_TYPE_ID',
    'MARKET_TYPE',
  ],
};

export const fetchData = async () => {
  try {
    if (!BA_PRICES_ENDPOINT) {
      throw new Error('BA_PRICES_ENDPOINT environment variable is not set');
    }

    const pricesResponse = await fetch(BA_PRICES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rawPricesReq),
    });

    if (!pricesResponse.ok) {
      const errorText = await pricesResponse.text().catch(() => 'Could not read error response');
      throw new Error(
        `Network response not ok: ${pricesResponse.status} : ${pricesResponse.statusText} - ${errorText}`
      );
    }

    const priceData = await pricesResponse.json();

    if (!BA_MARKETS_ENDPOINT) {
      throw new Error('BA_MARKETS_ENDPOINT environment variable is not set');
    }

    const marketsResponse = await fetch(BA_MARKETS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rawMarketsReq),
    });

    if (!marketsResponse.ok) {
      const errorText = await marketsResponse.text().catch(() => 'Could not read error response');
      throw new Error(
        `Network response not ok: ${marketsResponse.status} : ${marketsResponse.statusText} - ${errorText}`
      );
    }

    const marketData = await marketsResponse.json();
    return mergeData(priceData, marketData);
  } catch (error) {
    console.error('[Fetch] Fatal error:', error);
    throw error;
  }
};

const mergeData = (priceData, marketData) => {
  const markets = priceData.result.markets.map((market) => {
    const additionalData = marketData.result.markets.find(
      (m) => m.id === market.id
    );

    if (additionalData) {
      return {
        ...market,
        name: additionalData.name,
        marketType: additionalData.marketType,
        eventId: additionalData.eventId,
        eventTypeId: additionalData.eventTypeId,
        startTime: additionalData.startTime,
      };
    }
    return market;
  });

  return { result: { markets } };
};
