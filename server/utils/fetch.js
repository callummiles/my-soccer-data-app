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
    console.log('[Fetch] Starting data fetch operation');
    console.log('[Fetch:Prices] Endpoint:', BA_PRICES_ENDPOINT);
    console.log('[Fetch:Prices] Request body:', JSON.stringify(rawPricesReq, null, 2));
    
    if (!BA_PRICES_ENDPOINT) {
      throw new Error('BA_PRICES_ENDPOINT environment variable is not set');
    }
    
    const pricesResponse = await fetch(BA_PRICES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rawPricesReq),
    }).catch(error => {
      console.error('[Fetch:Prices] Network error:', error.message);
      throw error;
    });
    
    console.log('[Fetch:Prices] Response received - Status:', pricesResponse.status);
    console.log('[Fetch:Prices] Response headers:', JSON.stringify(Object.fromEntries([...pricesResponse.headers]), null, 2));
    
    if (!pricesResponse.ok) {
      const errorText = await pricesResponse.text().catch(() => 'Could not read error response');
      console.error('[Fetch:Prices] Request failed:', {
        status: pricesResponse.status,
        statusText: pricesResponse.statusText,
        body: errorText
      });
      throw new Error(
        `Network response not ok: ${pricesResponse.status} : ${pricesResponse.statusText} - ${errorText}`
      );
    }
    
    const priceData = await pricesResponse.json().catch(error => {
      console.error('[Fetch:Prices] Failed to parse JSON response:', error.message);
      throw error;
    });
    
    console.log('[Fetch:Prices] Response data structure:', 
      JSON.stringify({
        hasResult: !!priceData.result,
        hasMarkets: !!(priceData.result?.markets),
        marketsCount: priceData.result?.markets?.length || 0
      }, null, 2)
    );

    if (!BA_MARKETS_ENDPOINT) {
      throw new Error('BA_MARKETS_ENDPOINT environment variable is not set');
    }

    console.log('[Fetch:Markets] Endpoint:', BA_MARKETS_ENDPOINT);
    console.log('[Fetch:Markets] Request body:', JSON.stringify(rawMarketsReq, null, 2));
    
    const marketsResponse = await fetch(BA_MARKETS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rawMarketsReq),
    }).catch(error => {
      console.error('[Fetch:Markets] Network error:', error.message);
      throw error;
    });
    
    console.log('[Fetch:Markets] Response received - Status:', marketsResponse.status);
    console.log('[Fetch:Markets] Response headers:', JSON.stringify(Object.fromEntries([...marketsResponse.headers]), null, 2));
    
    if (!marketsResponse.ok) {
      const errorText = await marketsResponse.text().catch(() => 'Could not read error response');
      console.error('[Fetch:Markets] Request failed:', {
        status: marketsResponse.status,
        statusText: marketsResponse.statusText,
        body: errorText
      });
      throw new Error(
        `Network response not ok: ${marketsResponse.status} : ${marketsResponse.statusText} - ${errorText}`
      );
    }
    
    const marketData = await marketsResponse.json().catch(error => {
      console.error('[Fetch:Markets] Failed to parse JSON response:', error.message);
      throw error;
    });
    
    console.log('[Fetch:Markets] Response data structure:', 
      JSON.stringify({
        hasResult: !!marketData.result,
        hasMarkets: !!(marketData.result?.markets),
        marketsCount: marketData.result?.markets?.length || 0
      }, null, 2)
    );

    console.log('[Fetch] Merging price and market data');
    const data = mergeData(priceData, marketData);
    console.log('[Fetch] Successfully merged data. Total markets:', data.result?.markets?.length || 0);

    return data;
  } catch (error) {
    console.error('[Fetch] Fatal error:', error);
    throw error;
  }
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
