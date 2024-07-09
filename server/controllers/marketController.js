/* eslint-disable no-undef */
import promisedClient from '../config/grpcConfig.js';
import { Query } from '@stargate-oss/stargate-grpc-node-client';

import { scheduleJob } from 'node-schedule';
import { insertDataInDB } from '../models/MarketModel.js';
import { fetchData } from '../utils/fetch.js';
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
    // console.log(
    //   `Scheduling interval for market ${market.id}, start time: ${startTime}, fetch start: ${fetchStartTime}, current: ${now}`
    // );

    const fetchMarketData = async () => {
      try {
        //console.log(`Fetching data for market ${market.id} at ${new Date()}`);
        const data = await fetchData();
        const marketData = data.result.markets.find((m) => m.id === market.id);
        if (marketData && marketData.status !== 'CLOSED') {
          await insertDataInDB({ result: { markets: [marketData] } });
          // console.log(
          //   `Data fetched and stored successfully for market ${market.id}.`
          // );
          // } else {
          //   console.log(`No data found for market ${market.id}`);
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

      // console.log(`Interval started immediately for market ${market.id}`);
    } else {
      scheduleJob(fetchStartTime, () => {
        console.log(`Job started for market ${market.id} at ${new Date()}`);
        fetchMarketData(market);
        const intID = setInterval(fetchMarketData, interval);

        intervalMap.set(market.id, intID);

        // console.log(
        //   `Interval scheduled to start at ${fetchStartTime} for market ${market.id}`
        // );
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
  //const { eventId, marketId } = req.body;
  const queryStr =
    "SELECT * FROM bfex_data.markets WHERE event_id = '33374056' AND market_id = '1.230148216'";
  const query = new Query();
  query.setCql(queryStr);

  //query.bind([eventId, marketId]);

  try {
    const result = await promisedClient.executeQuery(query);

    // Extract column headers
    const columnHeaders = result.array[0][0].map((col) => col[1]);

    console.log('Columns: ', columnHeaders);

    console.log(
      'Result Array[0][1]:',
      JSON.stringify(result.array[0][1], null, 2)
    );

    // Extract data rows
    const dataRows = result.array[0][1].map((row) => {
      const rowData = {};
      if (row && row[0]) {
        row[0].forEach((colData, index) => {
          if (colData && Array.isArray(colData)) {
            // Find the last non-null value in the array
            const nonNullValues = colData.filter((val) => val !== null);
            rowData[columnHeaders[index]] =
              nonNullValues.length > 0
                ? nonNullValues[nonNullValues.length - 1]
                : null;
          }
        });
      }
      return rowData;
    });

    console.log('Data Rows:', dataRows);

    res.json(dataRows);
  } catch (error) {
    console.error('Failed to fetch data: ', error);
    res.status(500).json({ error: 'Failed to fetch data.' });
  }
};
