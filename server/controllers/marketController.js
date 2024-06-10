/* eslint-disable no-undef */
import { insertData } from '../models/MarketModel.js';
import fetch from 'node-fetch';

import dotenv from 'dotenv';
dotenv.config();

const { BA_PRICES_ENDPOINT } = process.env;

export const fetchAndStoreData = async (req, res) => {
  try {
    console.log('Attempting to contact endpoint...');
    const response = await fetch(BA_PRICES_ENDPOINT);
    console.log('Endpoint contacted.');
    if (!response.ok) {
      throw new Error('Network response not ok.');
    }
    const data = await response.json();
    await insertData(data);
    res.status(200).send('Data fetched and stored.');
  } catch (e) {
    res.status(500).send(`Error fetching or storing data: ${e.message}`);
  }
};
