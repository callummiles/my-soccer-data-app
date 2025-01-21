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
  console.log('[Fetch] Starting data fetch operation');
  console.log('[Fetch:Prices] Sending request to:', BA_PRICES_ENDPOINT);
  console.log('[Fetch:Prices] Request body:', JSON.stringify(rawPricesReq, null, 2));
  
  const pricesResponse = await fetch(BA_PRICES_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rawPricesReq),
  });
  
  if (!pricesResponse.ok) {
    console.error('[Fetch:Prices] Request failed:', {
      status: pricesResponse.status,
      statusText: pricesResponse.statusText,
    });
    throw new Error(
      `Network response not ok: ${pricesResponse.status} : ${pricesResponse.statusText}`
    );
  }
  
  console.log('[Fetch:Prices] Response status:', pricesResponse.status);
  const priceData = await pricesResponse.json();
  console.log('[Fetch:Prices] Received data for', priceData.result?.markets?.length || 0, 'markets');

  console.log('[Fetch:Markets] Sending request to:', BA_MARKETS_ENDPOINT);
  console.log('[Fetch:Markets] Request body:', JSON.stringify(rawMarketsReq, null, 2));
  
  const marketsResponse = await fetch(BA_MARKETS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rawMarketsReq),
  });
  
  if (!marketsResponse.ok) {
    console.error('[Fetch:Markets] Request failed:', {
      status: marketsResponse.status,
      statusText: marketsResponse.statusText,
    });
    throw new Error(
      `Network response not ok: ${marketsResponse.status} : ${marketsResponse.statusText}`
    );
  }
  
  console.log('[Fetch:Markets] Response status:', marketsResponse.status);
  const marketData = await marketsResponse.json();
  console.log('[Fetch:Markets] Received data for', marketData.result?.markets?.length || 0, 'markets');

  console.log('[Fetch] Merging price and market data');
  const data = mergeData(priceData, marketData);
  console.log('[Fetch] Successfully merged data. Total markets:', data.result?.markets?.length || 0);

  return data;
};

const mergeData = (priceData, marketData) => {
  console.log('[Merge] Starting data merge process');
  console.log('[Merge] Input markets - Prices:', priceData.result?.markets?.length || 0, 'Markets:', marketData.result?.markets?.length || 0);
  
  const markets = priceData.result.markets.map((market) => {
    const additionalData = marketData.result.markets.find(
      (m) => m.id === market.id
    );

    if (additionalData) {
      console.log('[Merge] Found matching market data for ID:', market.id);
      return {
        ...market,
        name: additionalData.name,
        marketType: additionalData.marketType,
        eventId: additionalData.eventId,
        eventTypeId: additionalData.eventTypeId,
        startTime: additionalData.startTime,
      };
    }
    console.warn('[Merge] No matching market data found for ID:', market.id);
    return market;
  });
  
  console.log('[Merge] Completed merging data. Total merged markets:', markets.length);
  return { result: { markets } };
};
