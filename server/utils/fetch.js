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

export const fetchData = async () => {
  const startTime = Date.now();
  console.log('[Fetch] Starting data fetch at:', new Date().toISOString());

  try {
    if (!BA_PRICES_ENDPOINT) {
      throw new Error('BA_PRICES_ENDPOINT environment variable is not set');
    }
    console.log('[Fetch] Using prices endpoint:', BA_PRICES_ENDPOINT);

    // Prices API call
    console.log('[Fetch] Requesting prices data...');
    const pricesStartTime = Date.now();
    console.log('[Fetch] Price request payload:', JSON.stringify(rawPricesReq));

    const pricesResponse = await fetch(BA_PRICES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rawPricesReq),
    }).catch((error) => {
      console.error('[Fetch] Error making prices request:', error.message);
      throw error;
    });

    console.log('[Fetch] Prices response status:', pricesResponse.status);

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
    console.log(
      `[Fetch] Prices data received in ${
        Date.now() - pricesStartTime
      }ms. Size: ${getObjectSize(priceData)}MB`
    );

    // Markets API call
    if (!BA_MARKETS_ENDPOINT) {
      throw new Error('BA_MARKETS_ENDPOINT environment variable is not set');
    }
    console.log('[Fetch] Using markets endpoint:', BA_MARKETS_ENDPOINT);

    // Markets API call
    console.log('[Fetch] Requesting markets data...');
    const marketsStartTime = Date.now();
    console.log(
      '[Fetch] Markets request payload:',
      JSON.stringify(rawMarketsReq)
    );

    const marketsResponse = await fetch(BA_MARKETS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rawMarketsReq),
    }).catch((error) => {
      console.error('[Fetch] Error making markets request:', error.message);
      throw error;
    });

    console.log('[Fetch] Markets response status:', marketsResponse.status);

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
    console.log(
      `[Fetch] Markets data received in ${
        Date.now() - marketsStartTime
      }ms. Size: ${getObjectSize(marketData)}MB`
    );

    const mergedData = mergeData(priceData, marketData);
    console.log(`[Fetch] Data fetch completed in ${Date.now() - startTime}ms`);
    return mergedData;
  } catch (error) {
    console.error('[Fetch] Error in fetchData:', error);
    throw error;
  }
};

const mergeData = (priceData, marketData) => {
  const mergeStartTime = Date.now();
  console.log(
    `[Fetch] Merging ${priceData.result.markets.length} price markets with ${marketData.result.markets.length} market details`
  );

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

  console.log(
    `[Fetch] Merged ${markets.length} markets in ${
      Date.now() - mergeStartTime
    }ms`
  );
  return { result: { markets } };
};
