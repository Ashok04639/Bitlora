import { markets } from "../data/marketData";

function buildUsdMarketMetadata() {
  const metadata = new Map();

  markets.forEach((market) => {
    const [symbol, quoteAsset] = market.pair.split("/");

    if (quoteAsset !== "USDT" && quoteAsset !== "USDC") {
      return;
    }

    const existing = metadata.get(symbol);

    if (!existing || quoteAsset === "USDT") {
      metadata.set(symbol, {
        coin: market.coinClass,
        symbol,
        name: market.name,
        price: Number(market.price) || 0,
        valuationMarket: market.pair,
      });
    }
  });

  metadata.set("USDT", {
    coin: "usdt",
    symbol: "USDT",
    name: "Tether",
    price: 1,
    valuationMarket: "USD",
  });

  metadata.set("USDC", {
    coin: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    price: 1,
    valuationMarket: "USD",
  });

  return metadata;
}

function buildWalletAssets(balances, metadata) {
  return Array.from(metadata.values()).map((asset) => ({
    ...asset,
    balance: Number(balances?.[asset.symbol] ?? 0),
  }));
}

function calculateAssetValue(assets) {
  return assets.reduce(
    (total, asset) =>
      total + Number(asset.balance || 0) * Number(asset.price || 0),
    0
  );
}

export function calculateWalletValuation(walletBalances, tradeOrders) {
  const metadata = buildUsdMarketMetadata();

  const spotAssets = buildWalletAssets(
    walletBalances?.["Spot Wallet"] ?? {},
    metadata
  );

  const futuresAssets = buildWalletAssets(
    walletBalances?.["Futures Wallet"] ?? {},
    metadata
  );

  const spotAvailableBalance = calculateAssetValue(spotAssets);
  const futuresBalance = calculateAssetValue(futuresAssets);

  const assetPrices = new Map(
    Array.from(metadata.values()).map((asset) => [
      asset.symbol,
      Number(asset.price) || 0,
    ])
  );

  const spotInOrders = (
    Array.isArray(tradeOrders) ? tradeOrders : []
  ).reduce((total, order) => {
    let reservedValue = 0;

    if (order?.isOpen && order.reservedAsset) {
      const reservedAmount = Number(
        order.reservedAmount ?? 0
      );

      const assetPrice = Number(
        assetPrices.get(order.reservedAsset) ?? 0
      );

      if (
        Number.isFinite(reservedAmount) &&
        reservedAmount > 0 &&
        Number.isFinite(assetPrice) &&
        assetPrice > 0
      ) {
        reservedValue += reservedAmount * assetPrice;
      }
    }

    const tpSlReserveAsset = order?.tpSl?.reserveAsset;
    const tpSlReserveAmount = Number(
      order?.tpSl?.reserveAmount ?? 0
    );

    if (
      tpSlReserveAsset &&
      Number.isFinite(tpSlReserveAmount) &&
      tpSlReserveAmount > 0
    ) {
      const tpSlAssetPrice = Number(
        assetPrices.get(tpSlReserveAsset) ?? 0
      );

      if (
        Number.isFinite(tpSlAssetPrice) &&
        tpSlAssetPrice > 0
      ) {
        reservedValue +=
          tpSlReserveAmount * tpSlAssetPrice;
      }
    }

    return total + reservedValue;
  }, 0);

  const spotTotalBalance =
    spotAvailableBalance + spotInOrders;

  const totalAvailableBalance =
    spotAvailableBalance + futuresBalance;

  const totalBalance =
    spotTotalBalance + futuresBalance;

  return {
    spotAssets,
    futuresAssets,
    spotAvailableBalance,
    spotInOrders,
    spotTotalBalance,
    futuresBalance,
    totalAvailableBalance,
    totalBalance,
  };
}
