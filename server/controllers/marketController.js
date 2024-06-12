/* eslint-disable no-undef */
import { insertDataInDB } from '../models/MarketModel.js';
import { fetchData } from '../utils/fetch.js';

export const fetchOnce = async (req, res) => {
  try {
    const data = await fetchData();
    await insertDataInDB(data);
    res.status(200).send('Data fetched and stored.');
  } catch (e) {
    res.status(500).send(`Error fetching or storing data: ${e.message}`);
  }
};

const intervalHandler = () => {
  let intID = null;

  return (req, res) => {
    const interval = parseInt(req.query.interval, 10) || 10000;

    if (intID) {
      clearInterval(intID);
    }

    intID = setInterval(async () => {
      try {
        const data = await fetchData();
        await insertDataInDB(data);
        console.log('Data fetched successfully.');
      } catch (e) {
        console.error('Error fetching data: ', e.message);
      }
    }, interval);

    res.send(`Interval started with ${interval / 1000} seconds.`);
  };
};

export const fetchInterval = intervalHandler();
