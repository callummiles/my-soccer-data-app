/* eslint-disable no-undef */
import fetch from 'node-fetch';
import { insertDataInDB } from '../models/MarketModel.js';
import { fetchData } from '../utils/fetch.js';
import { listAllEvents, getEventData } from '../utils/query.js';
import marketDataCache from '../utils/marketDataCache.js';

const intervalMap = new Map();

export const fetchInterval = async (req, res) => {
  const interval = parseInt(req.query.interval, 10) || 10000;
  console.log(`Interval set to ${interval} milliseconds.`);

  try {
    // Initial fetch and cache
    const initialData = await fetchData();

    if (!marketDataCache.isMarketDataCached()) {
      marketDataCache.setMarketData(initialData.result.markets);
    }

    // Process initial data without time window filtering
    if (initialData.result.markets.length > 0) {
      await insertDataInDB(initialData, true);
      console.log('[Initial Fetch] Data stored without time window filtering');
    }

    // Single interval function that processes all relevant markets
    const processMarkets = async () => {
      const markets = marketDataCache.getMarketData();

      try {
        const mockRes = {
          status: function (code) {
            console.log(`[Scheduled Fetch] Status code: ${code}`);
            return this;
          },
          send: function (message) {
            console.log(`[Scheduled Fetch] Response: ${message}`);
            return this;
          },
        };

        // Fetch data for all markets
        const marketIds = markets.map((market) => market.id);
        const data = await fetchData(marketIds);

        if (
          !data.result ||
          !data.result.markets ||
          data.result.markets.length === 0
        ) {
          console.log('[Market Processing] No market data returned from fetch');
          return;
        }

        // Add the startTime from cached data if it's missing in fetched data
        data.result.markets = data.result.markets.map((market) => {
          const cachedMarket = markets.find((m) => m.id === market.id);
          if (cachedMarket && !market.startTime) {
            market.startTime = cachedMarket.startTime;
          }
          return market;
        });

        // Process subsequent fetches with time window filtering
        await insertDataInDB(data, false);
        mockRes.status(200).send('Data fetched and stored.');
      } catch (e) {
        console.error(
          '[Market Processing] Error processing markets:',
          e.message
        );
      }
    };

    // Start the interval after initial fetch
    const intervalId = setInterval(processMarkets, interval);
    intervalMap.set('globalInterval', intervalId);

    res.status(200).send('Market data interval fetching started.');
  } catch (e) {
    res.status(500).send(`Error starting interval: ${e.message}`);
  }
};

export const endIntervalFetch = (req, res) => {
  const intervalId = intervalMap.get('globalInterval');
  if (intervalId) {
    clearInterval(intervalId);
    intervalMap.delete('globalInterval');
    console.log('Interval globalInterval stopped.');
    res.status(200).send('Interval stopped.');
  } else {
    res.status(400).send('No interval running.');
  }
};

export const queryMarketData = async (req, res) => {
  const { eventId } = req.body;
  if (!eventId) {
    return res.status(400).json({ error: 'eventId is required' });
  }

  let allDataRows = [];
  let pagingState = null;
  let hasMorePages = true;

  try {
    while (hasMorePages) {
      const {
        dataRows,
        pagingState: nextPagingState,
        hasMorePages: morePages,
      } = await getEventData(eventId, pagingState);

      allDataRows = allDataRows.concat(dataRows);
      pagingState = nextPagingState;
      hasMorePages = morePages;

      console.log('Query batch:', {
        dataRowsLength: dataRows.length,
        hasMorePages: morePages,
      });
    }

    console.log('All Data Rows:', allDataRows.length);
    console.log('Data rows generated: ', new Date().toLocaleString());

    res.json(allDataRows);
  } catch (error) {
    console.error('Failed to fetch data: ', error);
    res.status(500).json({ error: 'Failed to fetch data.' });
  }
};

export const getEventIds = async (req, res) => {
  try {
    console.log('Fetching event IDs...');
    let allEventIds = [];
    let pagingState = null;
    let hasMorePages = true;

    while (hasMorePages) {
      const {
        eventIds,
        pagingState: nextPagingState,
        hasMorePages: morePages,
      } = await listAllEvents(pagingState);

      allEventIds = allEventIds.concat(eventIds);
      pagingState = nextPagingState;
      hasMorePages = morePages;
    }

    console.log('Total distinct event IDs:', allEventIds.length);
    res.json(allEventIds.sort()); // Sort the event IDs for better UX
  } catch (error) {
    console.error('Failed to fetch event IDs: ', error);
    res.status(500).json({ error: 'Failed to fetch event IDs.' });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { couponName } = req.body;
    const token = req.headers.authorization;

    if (!token) {
      console.log('No authorization token provided');
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    console.log('Making request to external API...');
    const response = await fetch(
      'https://api.cwm18.com/api/guardian/v1.0/applyCoupon',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          couponName,
          clearOption: 'DONT_CLEAR',
          watchListNumber: 1,
        }),
      }
    );

    console.log('External API response status:', response.status);
    const data = await response.json();
    console.log('External API response data:', data);

    if (!response.ok) {
      const errorMessage = data.message || 'Failed to apply coupon';
      console.error('API Error:', errorMessage, {
        status: response.status,
        data,
      });
      return res.status(response.status).json({
        success: false,
        message: errorMessage,
      });
    }

    console.log('Successfully applied coupon');
    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data,
    });
  } catch (error) {
    console.error('Server error in coupon controller:', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to apply coupon',
    });
  }
};
