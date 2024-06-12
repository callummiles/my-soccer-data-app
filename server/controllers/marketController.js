/* eslint-disable no-undef */
import { scheduleJob } from 'node-schedule';
import { insertDataInDB } from '../models/MarketModel.js';
import { fetchData } from '../utils/fetch.js';
import marketDataCache from '../utils/marketDataCache.js';

export const fetchOnce = async (req, res) => {
  try {
    const data = await fetchData();

    if (!marketDataCache.isMarketDataCached()) {
      marketDataCache.setMarketData(data.result.markets);
      console.log('Market data fetched and cached.');
    } else {
      console.log('Market data already cached.');
    }

    await insertDataInDB(data);
    res.status(200).send('Data fetched and stored.');
  } catch (e) {
    res.status(500).send(`Error fetching or storing data: ${e.message}`);
  }
};

// const intervalHandler = () => {
//   let intID = null;

//   return (req, res) => {
//     const interval = parseInt(req.query.interval, 10) || 10000;

//     if (intID) {
//       clearInterval(intID);
//     }

//     intID = setInterval(async () => {
//       try {
//         const data = await fetchData();
//         await insertDataInDB(data);
//         console.log('Data fetched successfully.');
//       } catch (e) {
//         console.error('Error fetching data: ', e.message);
//       }
//     }, interval);

//     res.send(`Interval started with ${interval / 1000} seconds.`);
//   };
// };

// export const fetchInterval = intervalHandler();

const intervalMap = new Map();

export const fetchInterval = (req, res) => {
  console.log('fetchInterval called.');
  if (!marketDataCache.isMarketDataCached()) {
    console.log('Market data is not cached');
    return res
      .status(400)
      .send('MArket data not yet cached. Fetch & cache the data first.');
  }

  const interval = parseInt(req.query.interval, 10) || 10000;
  console.log(`Interval set to ${interval} milliseconds.`);
  const markets = marketDataCache.getMarketData();
  console.log(`Markets to schedule intervals for: ${markets.length}`);

  const now = new Date();

  markets.forEach((market) => {
    const startTime = new Date(market.startTime);
    const fetchStartTime = new Date(startTime.getTime() - 5 * 60 * 1000);
    console.log(
      `Scheduling interval for market ${market.id}, start time: ${startTime}, fetch start: ${fetchStartTime}, current: ${now}`
    );

    const fetchMarketData = async () => {
      try {
        console.log(`Fetching data for market ${market.id} at ${new Date()}`);
        const data = await fetchData();
        const marketData = data.result.markets.find((m) => m.id === market.id);
        if (marketData) {
          await insertDataInDB({ result: { markets: [marketData] } });
          console.log(
            `Data fetched and stored successfully for market ${market.id}.`
          );
        } else {
          console.log(`No data found for market ${market.id}`);
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
      // const intID = setInterval(async () => {
      //   try {
      //     console.log(`Fetching data for market ${market.id} at ${now}`);
      //     const data = await fetchData();
      //     await insertDataInDB(data);
      //     console.log(`Data fetched successfully for market ${market.id}`);
      //   } catch (e) {
      //     console.error(
      //       `Error fetching data for market ${market.id}: `,
      //       e.message
      //     );
      //   }
      // }, interval);
      const intID = setInterval(fetchMarketData, interval);

      intervalMap.set(market.id, intID);

      console.log(`Interval started immediately for market ${market.id}`);
    } else {
      scheduleJob(fetchStartTime, () => {
        console.log(`Job started for market ${market.id} at ${new Date()}`);
        // const intID = setInterval(async () => {
        //   try {
        //     console.log(`Fetching data for market ${market.id}`);
        //     const data = await fetchData();
        //     await insertDataInDB(data);
        //     console.log(`Data fetched successfully for market ${market.id}`);
        //   } catch (e) {
        //     console.error(
        //       `Error fetching data for market ${market.id}: `,
        //       e.message
        //     );
        //   }
        // }, interval);
        const intID = setInterval(fetchMarketData, interval);

        intervalMap.set(market.id, intID);

        console.log(
          `Interval scheduled to start at ${fetchStartTime} for market ${market.id}`
        );
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
