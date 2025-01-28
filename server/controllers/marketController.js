/* eslint-disable no-undef */
import { insertDataInDB } from '../models/MarketModel.js';
import { fetchData } from '../utils/fetch.js';
import { queryPagedData } from '../utils/query.js';
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
  let lastTimestamp = null;
  let hasMoreData = true;

  try {
    while (hasMoreData) {
      const { dataRows, lastTimestamp: newLastTimestamp } =
        await queryPagedData(eventId, lastTimestamp);

      if (dataRows.length === 0) {
        hasMoreData = false;
      } else {
        allDataRows = allDataRows.concat(dataRows);
        lastTimestamp = newLastTimestamp;
      }

      if (!newLastTimestamp) {
        hasMoreData = false;
      }

      console.log('Query batch:', {
        dataRowsLength: dataRows.length,
        newLastTimestamp,
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
