/* eslint-disable no-undef */
import { insertData } from '../models/MarketModel.js';
import fetch from 'node-fetch';

import dotenv from 'dotenv';
dotenv.config();

const { BA_PRICES_ENDPOINT, BA_MARKETS_ENDPOINT } = process.env;

export const fetchAndStoreData = async (req, res) => {
  try {
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

    console.log('Attempting to contact prices endpoint...');
    const pricesResponse = await fetch(BA_PRICES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rawPricesReq),
    });
    if (!pricesResponse.ok) {
      throw new Error(
        `Network response not ok: ${pricesResponse.status} : ${pricesResponse.statusText}`
      );
    }
    const priceData = await pricesResponse.json();
    console.log('Data fetched from BA_PRICES_ENDPOINT.');

    console.log('Attempting to contact markets endpoint...');
    const marketsResponse = await fetch(BA_MARKETS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rawMarketsReq),
    });
    if (!marketsResponse.ok) {
      throw new Error(
        `Network response not ok: ${marketsResponse.status} : ${marketsResponse.statusText}`
      );
    }
    const marketData = await marketsResponse.json();
    console.log('Data fetched from BA_MARKETS_ENDPOINT.');

    const data = mergeData(priceData, marketData);

    await insertData(data);
    res.status(200).send('Data fetched and stored.');
  } catch (e) {
    res.status(500).send(`Error fetching or storing data: ${e.message}`);
  }
};

const mergeData = (priceData, marketData) => {
  const data = priceData.result.markets.map((market) => {
    const additionalData = marketData.result.markets.find(
      (m) => m.id === market.id
    );

    if (additionalData) {
      return {
        ...market,
        name: additionalData.name,
        marketType: additionalData.marketType,
        eventId: additionalData.eventId,
        eventTypeId: additionalData.eventTypeId,
        startTime: additionalData.startTime,
      };
    }
    return market;
  });
  return { result: { data } };
};
