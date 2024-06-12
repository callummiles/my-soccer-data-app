const marketDataCache = {
  cachedMarketData: null,
  setMarketData(data) {
    this.cachedMarketData = data;
  },
  getMarketData() {
    return this.cachedMarketData;
  },
  isMarketDataCached() {
    return this.cachedMarketData !== null;
  },
};

export default marketDataCache;
