export function getUniqueCoins(markets) {
  return Array.from(
    new Map(markets.map((market) => [market.coinClass, market])).values()
  );
}

export function getTotalCoins(markets) {
  return getUniqueCoins(markets).length;
}
