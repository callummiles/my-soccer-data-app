/* eslint-disable no-undef */
import { scheduleJob } from 'node-schedule';
import { insertDataInDB } from '../models/MarketModel.js';
import { fetchData } from '../utils/fetch.js';
import { queryPagedData } from '../utils/query.js';
import marketDataCache from '../utils/marketDataCache.js';

export const fetchOnce = async (req, res) => {
  try {
    console.log(`Fetching initial data for market at ${new Date()}`);
    const data = await fetchData();

    if (!marketDataCache.isMarketDataCached()) {
      marketDataCache.setMarketData(data.result.markets);
    } else {
      console.log('Market data already cached.');
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
  const markets = marketDataCache.getMarketData();

  const now = new Date();

  markets.forEach((market) => {
    const startTime = new Date(market.startTime);
    const fetchStartTime = new Date(startTime.getTime() - 5 * 60 * 1000);

    const fetchMarketData = async () => {
      try {
        const data = await fetchData();
        const marketData = data.result.markets.find((m) => m.id === market.id);
        if (marketData && marketData.status !== 'CLOSED') {
          await insertDataInDB({ result: { markets: [marketData] } });
        }
      } catch (e) {
        console.error(
          `Error fetching data for market ${market.id}: `,
          e.message
        );
      }
    };

    if (fetchStartTime <= now) {
      console.log(
        `Fetch start time for market ${market.id} is in the past. Starting interval immediately.`
      );
      fetchMarketData(market);
      const intID = setInterval(fetchMarketData, interval);

      intervalMap.set(market.id, intID);
    } else {
      scheduleJob(fetchStartTime, () => {
        console.log(`Job started for market ${market.id} at ${new Date()}`);
        fetchMarketData(market);
        const intID = setInterval(fetchMarketData, interval);

        intervalMap.set(market.id, intID);
      });
    }
  });

  res.send('Intervals scheduled for all markets.');
};

export const endIntervalFetch = (req, res) => {
  intervalMap.forEach((intID, marketId) => {
    clearInterval(intID);
    console.log(`Interval for market ${marketId} stopped.`);
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
