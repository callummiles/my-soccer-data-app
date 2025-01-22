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

    // Prices API call
    console.log('[Fetch] Requesting prices data...');
    const pricesStartTime = Date.now();
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
    console.log(`[Fetch] Prices data received in ${Date.now() - pricesStartTime}ms. Size: ${getObjectSize(priceData)}MB`);

    if (!BA_MARKETS_ENDPOINT) {
      throw new Error('BA_MARKETS_ENDPOINT environment variable is not set');
    }

    // Markets API call
    console.log('[Fetch] Requesting markets data...');
    const marketsStartTime = Date.now();
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
    console.log(`[Fetch] Markets data received in ${Date.now() - marketsStartTime}ms. Size: ${getObjectSize(marketData)}MB`);

    // Merge data
    console.log('[Fetch] Starting data merge...');
    const mergeStartTime = Date.now();
    const mergedData = mergeData(priceData, marketData);
    console.log(`[Fetch] Data merged in ${Date.now() - mergeStartTime}ms. Final size: ${getObjectSize(mergedData)}MB`);
    
    const totalTime = Date.now() - startTime;
    console.log(`[Fetch] Total operation completed in ${totalTime}ms`);
    
    return mergedData;
  } catch (error) {
    console.error('[Fetch] Fatal error:', error);
    console.error(`[Fetch] Failed after ${Date.now() - startTime}ms`);
    throw error;
  }
};

const mergeData = (priceData, marketData) => {
  const mergeStartTime = Date.now();
  console.log(`[Fetch] Merging ${priceData.result.markets.length} price markets with ${marketData.result.markets.length} market details`);
  
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

  console.log(`[Fetch] Merged ${markets.length} markets in ${Date.now() - mergeStartTime}ms`);
  return { result: { markets } };
};
