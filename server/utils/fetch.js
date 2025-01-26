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

// Helper to get size of object in MB
const getObjectSize = (obj) => {
  const size = new TextEncoder().encode(JSON.stringify(obj)).length;
  return (size / (1024 * 1024)).toFixed(2);
};

export const fetchData = async (marketIds = null) => {
  const startTime = Date.now();

  try {
    if (!BA_PRICES_ENDPOINT) {
      throw new Error('BA_PRICES_ENDPOINT environment variable is not set');
    }

    const pricesRequestBody = { ...rawPricesReq };
    if (marketIds) {
      pricesRequestBody.marketIds = marketIds;
    }

    const pricesResponse = await fetch(BA_PRICES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pricesRequestBody),
    }).catch((error) => {
      console.error('[Fetch] Error making prices request:', error.message);
      throw error;
    });

    if (!pricesResponse.ok) {
      const errorText = await pricesResponse
        .text()
        .catch(() => 'Could not read error response');
      console.error('[Fetch] Prices request failed:', {
        status: pricesResponse.status,
        statusText: pricesResponse.statusText,
        error: errorText,
      });
      throw new Error(
        `Network response not ok: ${pricesResponse.status} : ${pricesResponse.statusText} - ${errorText}`
      );
    }

    // Parse prices data
    const priceData = await pricesResponse.json().catch((error) => {
      console.error('[Fetch] Error parsing prices response:', error);
      throw error;
    });

    // Markets API call
    if (!BA_MARKETS_ENDPOINT) {
      throw new Error('BA_MARKETS_ENDPOINT environment variable is not set');
    }

    const marketsRequestBody = { ...rawMarketsReq };
    if (marketIds) {
      marketsRequestBody.marketIds = marketIds;
    }

    const marketsResponse = await fetch(BA_MARKETS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(marketsRequestBody),
    }).catch((error) => {
      console.error('[Fetch] Error making markets request:', error.message);
      throw error;
    });

    if (!marketsResponse.ok) {
      const errorText = await marketsResponse
        .text()
        .catch(() => 'Could not read error response');
      console.error('[Fetch] Markets request failed:', {
        status: marketsResponse.status,
        statusText: marketsResponse.statusText,
        error: errorText,
      });
      throw new Error(
        `Network response not ok: ${marketsResponse.status} : ${marketsResponse.statusText} - ${errorText}`
      );
    }

    const marketData = await marketsResponse.json().catch((error) => {
      console.error('[Fetch] Error parsing markets response:', error);
      throw error;
    });

    const mergedData = mergeData(priceData, marketData);
    console.log(
      `[Fetch] Completed in ${Date.now() - startTime}ms: ${
        priceData.result.markets.length
      } markets fetched and merged. Size: ${getObjectSize(mergedData)}MB`
    );
    return mergedData;
  } catch (error) {
    console.error('[Fetch] Error in fetchData:', error);
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
