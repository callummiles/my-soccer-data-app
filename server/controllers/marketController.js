/* eslint-disable no-undef */
import { insertDataInDB } from '../models/MarketModel.js';
import { fetchData } from '../utils/fetch.js';
import { queryPagedData } from '../utils/query.js';
import marketDataCache from '../utils/marketDataCache.js';

export const fetchOnce = async (req, res) => {
  try {
    const data = await fetchData();

    if (!marketDataCache.isMarketDataCached()) {
      marketDataCache.setMarketData(data.result.markets);
    }

    const filteredMarkets = data.result.markets.filter(
      (market) => market.status !== 'CLOSED'
    );

    if (filteredMarkets.length > 0) {
      await insertDataInDB({ result: { markets: filteredMarkets } });
      res.status(200).send('Data fetched and stored.');
    } else {
      res.status(200).send('No open markets to store.');
    }
  } catch (e) {
    res.status(500).send(`Error fetching or storing data: ${e.message}`);
  }
};

const intervalMap = new Map();

export const fetchInterval = (req, res) => {
  if (!marketDataCache.isMarketDataCached()) {
    return res
      .status(400)
      .send('Market data not yet cached. Fetch & cache the data first.');
  }

  const interval = parseInt(req.query.interval, 10) || 10000;
  console.log(`Interval set to ${interval} milliseconds.`);

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

      await insertDataInDB(data);
      mockRes.status(200).send('Data fetched and stored.');
    } catch (e) {
      console.error('[Market Processing] Error processing markets:', e.message);
    }
  };

  // Initial process
  processMarkets();

  // Set up single interval
  const intervalId = setInterval(processMarkets, interval);
  intervalMap.set('globalInterval', intervalId);

  res.send('Global interval scheduled for market processing.');
};

export const endIntervalFetch = (req, res) => {
  intervalMap.forEach((intID, key) => {
    clearInterval(intID);
    console.log(`Interval ${key} stopped.`);
  });

  intervalMap.clear();
  res.send('All intervals ended.');
};

export const queryMarketData = async (req, res) => {
  const { eventId, marketId } = req.body;
  if (!eventId || !marketId) {
    return res.status(400).json({ error: 'eventId and marketId are required' });
  }

  let allDataRows = [];
  let lastTimestamp = null;
  let hasMoreData = true;

  try {
    while (hasMoreData) {
      const { dataRows, lastTimestamp: newLastTimestamp } =
        await queryPagedData(eventId, marketId, lastTimestamp);

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
