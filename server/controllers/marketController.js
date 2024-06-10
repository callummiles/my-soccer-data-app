/* eslint-disable no-undef */
import { insertData } from '../models/MarketModel.js';
import fetch from 'node-fetch';

import dotenv from 'dotenv';
dotenv.config();

const { BA_PRICES_ENDPOINT } = process.env;

export const fetchAndStoreData = async (req, res) => {
  try {
    const rawReq = {
      dataRequired: [
        'BEST_PRICE_ONLY',
        'INPLAY_INFO',
        'LAST_TRADED_PRICE',
        'VOLUME',
      ],
    };

    console.log('Attempting to contact endpoint...');
    const response = await fetch(BA_PRICES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rawReq),
    });
    console.log('Endpoint contacted.');
    console.log(response);
    if (!response.ok) {
      throw new Error(
        `Network response not ok: ${response.status} : ${response.statusText}`
      );
    }
    const data = await response.json();
    console.log('Data fetched: ', JSON.stringify(data, null, 2));
    await insertData(data);
    res.status(200).send('Data fetched and stored.');
  } catch (e) {
    res.status(500).send(`Error fetching or storing data: ${e.message}`);
  }
};
