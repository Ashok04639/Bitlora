import { useState } from "react";
import { markets } from "../data/marketData";
import {
  BarChart3,
  ChevronDown,
  Check,
  Settings2,
  RefreshCw,
} from "lucide-react";

const pairs = markets.map((market) => market.pair);


const timeframes = ["1s", "1m", "5m", "15m", "30m", "1h", "4h", "1d", "1M"];

function clampMarketValue(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

const timeframeRangeScales = {
  "1s": 0.08,
  "1m": 0.12,
  "5m": 0.18,
  "15m": 0.26,
  "30m": 0.34,
  "1h": 0.44,
  "4h": 0.58,
  "1d": 0.76,
  "1M": 1,
};

function buildDemoCandles(market, timeframe = "1m") {
  const lastPrice = Number(market.price);
  const marketLow = Number(market.low);
  const marketHigh = Number(market.high);

  const fullLow =
    Number.isFinite(marketLow) && marketLow > 0
      ? marketLow
      : lastPrice * 0.98;

  const fullHigh =
    Number.isFinite(marketHigh) && marketHigh > fullLow
      ? marketHigh
      : lastPrice * 1.02;

  const rangeScale =
    timeframeRangeScales[timeframe] ??
    timeframeRangeScales["1m"];

  const low = clampMarketValue(
    lastPrice - (lastPrice - fullLow) * rangeScale,
    fullLow,
    fullHigh
  );

  const high = clampMarketValue(
    lastPrice + (fullHigh - lastPrice) * rangeScale,
    fullLow,
    fullHigh
  );

  const range = Math.max(high - low, Number.EPSILON);
  const timeframePhase =
    Array.from(String(timeframe)).reduce(
      (total, character) => total + character.charCodeAt(0),
      0
    ) * 0.01;

  let previousClose = clampMarketValue(
    low + range * 0.35,
    low,
    high
  );

  return Array.from({ length: 12 }, (_, index) => {
    const progress = (index + 1) / 12;
    const target = low + (lastPrice - low) * progress;
    const swing =
      Math.sin((index + 1) * 1.35 + timeframePhase) *
      range *
      0.08;

    const open = previousClose;
    const close = clampMarketValue(target + swing, low, high);
    const wickSize = range * (0.03 + (index % 3) * 0.01);

    const candleHigh = Math.min(
      high,
      Math.max(open, close) + wickSize
    );

    const candleLow = Math.max(
      low,
      Math.min(open, close) - wickSize
    );

    previousClose = close;

    return [open, candleHigh, candleLow, close];
  });
}

function buildDemoOrderBook(
  market,
  pricePrecision,
  snapshotRevision = 0
) {
  const price = Number(market.price);
  const low = Number(market.low);
  const high = Number(market.high);
  const tickSize = 10 ** -pricePrecision;

  const snapshotLow =
    Number.isFinite(low) && low > 0
      ? low
      : price * 0.98;

  const snapshotHigh =
    Number.isFinite(high) && high > snapshotLow
      ? high
      : price * 1.02;

  const marketRange = snapshotHigh - snapshotLow;

  const revision =
    Number.isFinite(snapshotRevision) ? snapshotRevision : 0;

  const priceWave = Math.sin(revision * 0.73);

  const upwardRoom = Math.max(
    0,
    snapshotHigh - price
  );

  const downwardRoom = Math.max(
    0,
    price - snapshotLow
  );

  const rawReferencePrice =
    revision === 0
      ? price
      : price +
        priceWave *
          (priceWave >= 0 ? upwardRoom : downwardRoom) *
          0.8;

  const referencePrice = Math.min(
    snapshotHigh,
    Math.max(
      snapshotLow,
      Math.round(rawReferencePrice / tickSize) * tickSize
    )
  );

  const priceStep = Math.max(
    marketRange / 100,
    referencePrice * 0.0001,
    tickSize,
    Number.EPSILON
  );

  const baseDepth = Math.max(
    0.00000001,
    1000 / Math.max(referencePrice, Number.EPSILON)
  );

  const snapshotPriceStep =
    priceStep * (1 + Math.sin(revision * 0.73) * 0.2);

  const snapshotBaseDepth =
    baseDepth * (1 + Math.sin(revision * 0.61) * 0.15);

  return {
    referencePrice,
    asks: Array.from({ length: 3 }, (_, index) => [
      referencePrice + snapshotPriceStep * (3 - index),
      (snapshotBaseDepth * (1 + index * 0.35)).toFixed(8),
    ]),
    bids: Array.from({ length: 3 }, (_, index) => [
      Math.max(
        Number.EPSILON,
        referencePrice - snapshotPriceStep * index
      ),
      (snapshotBaseDepth * (1.15 + index * 0.4)).toFixed(8),
    ]),
  };
}

const orderBookViewOptions = ["All", "Buy", "Sell"];

const tradeAccountTabs = ["Open Orders", "Order History", "Trade History"];

function getOrderBookPrecisionOptions(nativePrecision, marketPrice) {
  const numericPrice = Number(marketPrice);
  const options = [];

  for (let index = 0; index < 8 && options.length < 5; index += 1) {
    const decimals = nativePrecision - index;
    const step = 10 ** -decimals;

    if (
      index > 0 &&
      Number.isFinite(numericPrice) &&
      numericPrice > 0 &&
      step > numericPrice
    ) {
      break;
    }

    options.push({
      decimals,
      label:
        decimals > 0
          ? step.toFixed(decimals)
          : step.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            }),
    });
  }

  return options;
}

function getDefaultOrderBookPrecision(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return 2;
  }

  const normalized = numericValue
    .toFixed(8)
    .replace(/0+$/, "")
    .replace(/\.$/, "");

  const decimalPart = normalized.split(".")[1] || "";

  return Math.min(
    8,
    Math.max(2, decimalPart.length)
  );
}

function formatOrderBookPrice(value, decimals) {
  const numericValue = Number(String(value).replace(/,/g, ""));

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  const fractionDigits = Math.max(0, decimals);

  return numericValue.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function formatOrderBookAmount(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  return numericValue.toLocaleString("en-US", {
    minimumSignificantDigits: 1,
    maximumSignificantDigits: 8,
  });
}

function groupOrderBookLevels(levels, decimals, side) {
  const factor = 10 ** decimals;
  const grouped = new Map();

  levels.forEach(([rawPrice, rawAmount]) => {
    const numericPrice = Number(String(rawPrice).replace(/,/g, ""));
    const numericAmount = Number(rawAmount);

    if (!Number.isFinite(numericPrice) || !Number.isFinite(numericAmount)) {
      return;
    }

    const groupedPrice =
      side === "asks"
        ? Math.ceil(numericPrice * factor) / factor
        : Math.floor(numericPrice * factor) / factor;

    const fractionDigits = Math.max(0, decimals);
    const key = groupedPrice.toFixed(fractionDigits);
    grouped.set(key, (grouped.get(key) || 0) + numericAmount);
  });

  return [...grouped.entries()]
    .map(([groupedPrice, groupedAmount]) => [
      formatOrderBookPrice(groupedPrice, decimals),
      formatOrderBookAmount(groupedAmount),
    ])
    .sort(
      ([priceA], [priceB]) =>
        Number(String(priceB).replace(/,/g, "")) -
        Number(String(priceA).replace(/,/g, ""))
    );
}

function calculateMarketBuyAmount(levels, quoteBudget) {
  const normalizedLevels = levels
    .map(([rawPrice, rawAmount]) => ({
      price: Number(String(rawPrice).replace(/,/g, "")),
      amount: Number(rawAmount),
    }))
    .filter(
      (level) =>
        Number.isFinite(level.price) &&
        level.price > 0 &&
        Number.isFinite(level.amount) &&
        level.amount > 0
    )
    .sort((levelA, levelB) => levelA.price - levelB.price);

  let remainingQuoteBudget = quoteBudget;
  let baseAmount = 0;

  for (const level of normalizedLevels) {
    if (remainingQuoteBudget <= Number.EPSILON) {
      break;
    }

    const baseAmountAtLevel = Math.min(
      level.amount,
      remainingQuoteBudget / level.price
    );

    baseAmount += baseAmountAtLevel;
    remainingQuoteBudget -=
      baseAmountAtLevel * level.price;
  }

  return baseAmount;
}

function buildSpotExecutionPlan(
  levels,
  side,
  orderType,
  limitPrice,
  requestedAmount
) {
  const normalizedLevels = levels
    .map(([rawPrice, rawAmount]) => ({
      price: Number(String(rawPrice).replace(/,/g, "")),
      amount: Number(rawAmount),
    }))
    .filter(
      (level) =>
        Number.isFinite(level.price) &&
        level.price > 0 &&
        Number.isFinite(level.amount) &&
        level.amount > 0
    )
    .sort((levelA, levelB) =>
      side === "Buy"
        ? levelA.price - levelB.price
        : levelB.price - levelA.price
    );

  let remainingAmount = requestedAmount;
  const fills = [];

  for (const level of normalizedLevels) {
    if (remainingAmount <= Number.EPSILON) {
      break;
    }

    const priceIsEligible =
      orderType === "Market" ||
      (side === "Buy"
        ? level.price <= limitPrice
        : level.price >= limitPrice);

    if (!priceIsEligible) {
      break;
    }

    const fillAmount = Math.min(remainingAmount, level.amount);

    fills.push({
      price: level.price,
      amount: fillAmount,
      quoteAmount: level.price * fillAmount,
    });

    level.amount -= fillAmount;
    remainingAmount -= fillAmount;
  }

  if (remainingAmount <= Number.EPSILON) {
    remainingAmount = 0;
  }

  const filledAmount = fills.reduce(
    (total, fill) => total + fill.amount,
    0
  );

  const quoteAmount = fills.reduce(
    (total, fill) => total + fill.quoteAmount,
    0
  );

  const averagePrice =
    filledAmount > 0 ? quoteAmount / filledAmount : null;

  const remainingLevels = normalizedLevels
    .filter((level) => level.amount > Number.EPSILON)
    .map((level) => [level.price, level.amount]);

  return {
    fills,
    filledAmount,
    remainingAmount,
    quoteAmount,
    averagePrice,
    remainingLevels,
  };
}

function calculateTpSlReserve(
  side,
  baseAsset,
  quoteAsset,
  tpSl,
  protectedAmount,
  executedAmount = 0
) {
  if (!tpSl) {
    return {
      asset: null,
      amount: 0,
    };
  }

  const remainingProtectedAmount = Math.max(
    0,
    Number(protectedAmount ?? 0) -
      Number(executedAmount ?? 0)
  );

  if (remainingProtectedAmount <= Number.EPSILON) {
    return {
      asset: null,
      amount: 0,
    };
  }

  if (side === "Buy") {
    return {
      asset: baseAsset,
      amount: remainingProtectedAmount,
    };
  }

  const protectionPrice = Math.max(
    Number(tpSl.takeProfitPrice ?? 0),
    Number(tpSl.stopLossLimitPrice ?? 0)
  );

  return {
    asset: quoteAsset,
    amount: remainingProtectedAmount * protectionPrice,
  };
}

function detectTpSlTrigger(order, referencePrice) {
  const tpSl = order?.tpSl;

  if (!tpSl || tpSl.triggeredBy) {
    return null;
  }

  const protectedAmount = Number(
    tpSl.protectedAmount ?? 0
  );

  const executedAmount = Number(
    tpSl.executedAmount ?? 0
  );

  const numericReferencePrice = Number(referencePrice);
  const takeProfitPrice = Number(
    tpSl.takeProfitPrice
  );

  const stopLossTriggerPrice = Number(
    tpSl.stopLossTriggerPrice
  );

  if (
    !Number.isFinite(numericReferencePrice) ||
    numericReferencePrice <= 0 ||
    !Number.isFinite(takeProfitPrice) ||
    takeProfitPrice <= 0 ||
    !Number.isFinite(stopLossTriggerPrice) ||
    stopLossTriggerPrice <= 0 ||
    protectedAmount <= executedAmount + Number.EPSILON
  ) {
    return null;
  }

  if (order.side === "Buy") {
    if (numericReferencePrice >= takeProfitPrice) {
      return {
        triggeredBy: "Take Profit",
        triggerPrice: numericReferencePrice,
      };
    }

    if (numericReferencePrice <= stopLossTriggerPrice) {
      return {
        triggeredBy: "Stop Loss",
        triggerPrice: numericReferencePrice,
      };
    }

    return null;
  }

  if (order.side === "Sell") {
    if (numericReferencePrice <= takeProfitPrice) {
      return {
        triggeredBy: "Take Profit",
        triggerPrice: numericReferencePrice,
      };
    }

    if (numericReferencePrice >= stopLossTriggerPrice) {
      return {
        triggeredBy: "Stop Loss",
        triggerPrice: numericReferencePrice,
      };
    }
  }

  return null;
}

function buildOpenLimitRefreshPlan(
  orders,
  pair,
  orderBook,
  excludedOrderIds = new Set()
) {
  const openLimitOrders = (
    Array.isArray(orders) ? orders : []
  ).filter((order) => {
    const orderPrice = Number(order?.price);
    const remainingAmount = Number(order?.remainingAmount);

    return (
      order?.isOpen &&
      !excludedOrderIds.has(order?.id) &&
      order?.type === "Limit" &&
      order?.pair === pair &&
      Number.isFinite(orderPrice) &&
      orderPrice > 0 &&
      Number.isFinite(remainingAmount) &&
      remainingAmount > Number.EPSILON
    );
  });

  const compareCreatedAt = (orderA, orderB) =>
    String(orderA.createdAt || "").localeCompare(
      String(orderB.createdAt || "")
    );

  const buyOrders = openLimitOrders
    .filter((order) => order.side === "Buy")
    .sort(
      (orderA, orderB) =>
        Number(orderB.price) - Number(orderA.price) ||
        compareCreatedAt(orderA, orderB)
    );

  const sellOrders = openLimitOrders
    .filter((order) => order.side === "Sell")
    .sort(
      (orderA, orderB) =>
        Number(orderA.price) - Number(orderB.price) ||
        compareCreatedAt(orderA, orderB)
    );

  let askLevels = orderBook.asks;
  let bidLevels = orderBook.bids;
  const matches = [];

  for (const order of buyOrders) {
    const execution = buildSpotExecutionPlan(
      askLevels,
      "Buy",
      "Limit",
      Number(order.price),
      Number(order.remainingAmount)
    );

    askLevels = execution.remainingLevels;

    if (execution.filledAmount > Number.EPSILON) {
      matches.push({ order, execution });
    }
  }

  for (const order of sellOrders) {
    const execution = buildSpotExecutionPlan(
      bidLevels,
      "Sell",
      "Limit",
      Number(order.price),
      Number(order.remainingAmount)
    );

    bidLevels = execution.remainingLevels;

    if (execution.filledAmount > Number.EPSILON) {
      matches.push({ order, execution });
    }
  }

  return {
    matches,
    remainingAsks: askLevels,
    remainingBids: bidLevels,
  };
}

function buildTpSlExitRefreshPlan(
  orders,
  pair,
  orderBook,
  referencePrice,
  triggeredAt
) {
  const candidates = (
    Array.isArray(orders) ? orders : []
  )
    .filter((order) => {
      const protectedAmount = Number(
        order?.tpSl?.protectedAmount ?? 0
      );

      const executedAmount = Number(
        order?.tpSl?.executedAmount ?? 0
      );

      return (
        order?.pair === pair &&
        order?.tpSl &&
        protectedAmount >
          executedAmount + Number.EPSILON
      );
    })
    .map((order) => {
      const existingTriggeredBy =
        order.tpSl.triggeredBy;

      const detectedTrigger = existingTriggeredBy
        ? {
            triggeredBy: existingTriggeredBy,
            triggerPrice: Number(
              order.tpSl.triggerPrice ?? referencePrice
            ),
          }
        : detectTpSlTrigger(
            order,
            referencePrice
          );

      if (!detectedTrigger) {
        return null;
      }

      const isNewTrigger = !existingTriggeredBy;

      return {
        order,
        trigger: detectedTrigger,
        isNewTrigger,
        triggeredAt:
          order.tpSl.triggeredAt ??
          triggeredAt,
      };
    })
    .filter(Boolean)
    .sort((candidateA, candidateB) => {
      if (
        candidateA.isNewTrigger !==
        candidateB.isNewTrigger
      ) {
        return candidateA.isNewTrigger ? 1 : -1;
      }

      return String(
        candidateA.triggeredAt ||
          candidateA.order.createdAt ||
          ""
      ).localeCompare(
        String(
          candidateB.triggeredAt ||
            candidateB.order.createdAt ||
            ""
        )
      );
    });

  let askLevels = orderBook.asks;
  let bidLevels = orderBook.bids;
  const plans = [];

  for (const candidate of candidates) {
    const { order, trigger } = candidate;

    const protectedAmount = Number(
      order.tpSl.protectedAmount ?? 0
    );

    const executedAmount = Number(
      order.tpSl.executedAmount ?? 0
    );

    const remainingProtectedAmount = Math.max(
      0,
      protectedAmount - executedAmount
    );

    if (
      remainingProtectedAmount <= Number.EPSILON
    ) {
      continue;
    }

    const exitSide =
      order.side === "Buy" ? "Sell" : "Buy";

    const exitLimitPrice =
      trigger.triggeredBy === "Take Profit"
        ? Number(order.tpSl.takeProfitPrice)
        : Number(order.tpSl.stopLossLimitPrice);

    if (
      !Number.isFinite(exitLimitPrice) ||
      exitLimitPrice <= 0
    ) {
      continue;
    }

    const sourceLevels =
      exitSide === "Buy"
        ? askLevels
        : bidLevels;

    const execution = buildSpotExecutionPlan(
      sourceLevels,
      exitSide,
      "Limit",
      exitLimitPrice,
      remainingProtectedAmount
    );

    if (exitSide === "Buy") {
      askLevels = execution.remainingLevels;
    } else {
      bidLevels = execution.remainingLevels;
    }

    plans.push({
      ...candidate,
      exitSide,
      exitLimitPrice,
      execution,
    });
  }

  return {
    plans,
    remainingAsks: askLevels,
    remainingBids: bidLevels,
  };
}

function buildTradeTransactions(fillRecords) {
  return (Array.isArray(fillRecords) ? fillRecords : [])
    .filter((fill) => {
      const numericAmount = Number(fill?.amount ?? 0);

      return (
        Number.isFinite(numericAmount) &&
        numericAmount > Number.EPSILON
      );
    })
    .map((fill) => {
      const [baseAsset] = String(fill.pair ?? "").split("/");
      const numericAmount = Number(fill.amount);

      return {
        type: "Trade",
        asset: baseAsset || "-",
        amount: `${fill.side === "Sell" ? "-" : "+"}${numericAmount.toFixed(4)}`,
        status: "Completed",
        date: "Just now",
      };
    });
}

function TradeSurface({
  isLoggedIn,
  selectedTradePair,
  walletBalances,
  setWalletBalances,
  transactions,
  setTransactions,
  tradeOrders,
  setTradeOrders,
  tradeFills,
  setTradeFills,
}) {
  const initialPair =
    markets.some((market) => market.pair === selectedTradePair)
      ? selectedTradePair
      : markets[0].pair;

  const [pair, setPair] = useState(initialPair);
  const [pairMenuOpen, setPairMenuOpen] = useState(false);
  const [timeframe, setTimeframe] = useState("1m");

  const [side, setSide] = useState("Buy");
  const [orderType, setOrderType] = useState("Limit");
  const [orderTypeOpen, setOrderTypeOpen] = useState(false);

  const [price, setPrice] = useState(() => {
    const initialMarket =
      markets.find((market) => market.pair === initialPair) ?? markets[0];

    return String(initialMarket.price);
  });
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [tradeAccountTab, setTradeAccountTab] = useState("Open Orders");
  const [tpSlEnabled, setTpSlEnabled] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState("");
  const [stopLossTriggerPrice, setStopLossTriggerPrice] = useState("");
  const [stopLossLimitPrice, setStopLossLimitPrice] = useState("");
  const [orderBookView, setOrderBookView] = useState("All");
  const [orderBookRevision, setOrderBookRevision] = useState(0);
  const [orderBookViewOpen, setOrderBookViewOpen] = useState(false);
  const [orderBookPrecision, setOrderBookPrecision] = useState(() => {
    const initialMarket =
      markets.find((market) => market.pair === initialPair) ?? markets[0];

    return getDefaultOrderBookPrecision(initialMarket.price);
  });
  const [orderBookPrecisionOpen, setOrderBookPrecisionOpen] = useState(false);

  const activeMarketSource =
    markets.find((market) => market.pair === pair) ?? markets[0];

  const [baseAsset, quoteAsset] = activeMarketSource.pair.split("/");

  const activeMarket = {
    ...activeMarketSource,
    base: baseAsset,
    quote: quoteAsset,
  };

  const activeCandles = buildDemoCandles(activeMarket, timeframe);

  const chartMin = Math.min(
    Number(activeMarket.price),
    ...activeCandles.map(([, , low]) => low)
  );

  const chartMax = Math.max(
    Number(activeMarket.price),
    ...activeCandles.map(([, high]) => high)
  );

  const chartRange = Math.max(
    chartMax - chartMin,
    Number.EPSILON
  );

  const chartPriceAxis = [
    chartMax,
    (chartMax + activeMarket.price) / 2,
    Number(activeMarket.price),
    (activeMarket.price + chartMin) / 2,
    chartMin,
  ];

  const candleRanges = activeCandles.map(
    ([, high, low]) => high - low
  );

  const maximumCandleRange = Math.max(
    ...candleRanges,
    Number.EPSILON
  );

  const activeVolumeBars = candleRanges.map(
    (range) => 25 + (range / maximumCandleRange) * 65
  );

  const marketOrderBookPrecision =
    getDefaultOrderBookPrecision(activeMarket.price);

  const activeOrderBookPrecisionOptions =
    getOrderBookPrecisionOptions(
      marketOrderBookPrecision,
      activeMarket.price
    );

  const activeOrderBook = buildDemoOrderBook(
    activeMarket,
    marketOrderBookPrecision,
    orderBookRevision
  );

  const selectPair = (nextPair) => {
    const nextMarket = markets.find(
      (market) => market.pair === nextPair
    );

    if (!nextMarket) {
      return;
    }

    setPair(nextMarket.pair);
    setPrice(String(nextMarket.price));
    setOrderBookPrecision(
      getDefaultOrderBookPrecision(nextMarket.price)
    );
    setOrderBookPrecisionOpen(false);
    setOrderBookRevision(0);
    setAmount("");
    setMessage("");
    setTpSlEnabled(false);
    setTakeProfitPrice("");
    setStopLossTriggerPrice("");
    setStopLossLimitPrice("");
    setPairMenuOpen(false);
  };

  const selectOrderBookPrice = (bookPrice, nextSide) => {
    const normalizedPrice = String(bookPrice).replace(/,/g, "");
    const numericPrice = Number(normalizedPrice);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return;
    }

    setSide(nextSide);
    setOrderType("Limit");
    setPrice(normalizedPrice);
    setOrderTypeOpen(false);
    setMessage("");
  };

  const refreshOrderBook = () => {
    const nextRevision = orderBookRevision + 1;

    const nextOrderBook = buildDemoOrderBook(
      activeMarket,
      marketOrderBookPrecision,
      nextRevision
    );

    setOrderBookRevision(nextRevision);

    if (!isLoggedIn) {
      return;
    }

    const preTriggeredOrderIds = new Set(
      (Array.isArray(tradeOrders) ? tradeOrders : [])
        .filter((order) => {
          if (
            !order?.isOpen ||
            order?.pair !== pair
          ) {
            return false;
          }

          return Boolean(
            detectTpSlTrigger(
              order,
              nextOrderBook.referencePrice
            )
          );
        })
        .map((order) => order.id)
    );

    const openLimitPlan =
      buildOpenLimitRefreshPlan(
        tradeOrders,
        pair,
        nextOrderBook,
        preTriggeredOrderIds
      );

    const matches = openLimitPlan.matches;
    const updatedAt = new Date().toISOString();
    const orderUpdates = new Map();
    const fillRecords = [];

    let quoteBalanceCredit = 0;
    let baseBalanceCredit = 0;

    matches.forEach(({ order, execution }) => {
      const orderPrice = Number(order.price);

      const previousFilledAmount = Number(
        order.filledAmount ?? 0
      );

      const previousQuoteFilled = Number(
        order.quoteFilled ?? 0
      );

      const nextFilledAmount =
        previousFilledAmount +
        execution.filledAmount;

      const nextQuoteFilled =
        previousQuoteFilled +
        execution.quoteAmount;

      const nextRemainingAmount =
        execution.remainingAmount;

      const nextIsOpen =
        nextRemainingAmount > Number.EPSILON;

      const nextReservedAmount = nextIsOpen
        ? order.side === "Buy"
          ? nextRemainingAmount * orderPrice
          : nextRemainingAmount
        : 0;

      const [
        orderBaseAsset,
        orderQuoteAsset,
      ] = order.pair.split("/");

      const previousTpSlReserveAmount = Number(
        order.tpSl?.reserveAmount ?? 0
      );

      const nextTpSlReserve =
        calculateTpSlReserve(
          order.side,
          orderBaseAsset,
          orderQuoteAsset,
          order.tpSl,
          nextFilledAmount,
          Number(
            order.tpSl?.executedAmount ?? 0
          )
        );

      const tpSlReserveDelta =
        nextTpSlReserve.amount -
        previousTpSlReserveAmount;

      const nextTpSl = order.tpSl
        ? {
            ...order.tpSl,
            protectedAmount:
              nextFilledAmount,
            reserveAsset:
              nextTpSlReserve.asset,
            reserveAmount:
              nextTpSlReserve.amount,
            state:
              nextFilledAmount >
              Number(
                order.tpSl.executedAmount ?? 0
              ) +
                Number.EPSILON
                ? "Ready"
                : "Pending Entry Fill",
          }
        : null;

      if (order.side === "Buy") {
        const reservedQuoteForFill =
          execution.filledAmount * orderPrice;

        quoteBalanceCredit +=
          reservedQuoteForFill -
          execution.quoteAmount;

        baseBalanceCredit +=
          execution.filledAmount -
          tpSlReserveDelta;
      } else {
        quoteBalanceCredit +=
          execution.quoteAmount -
          tpSlReserveDelta;
      }

      orderUpdates.set(order.id, {
        ...order,
        status: nextIsOpen
          ? "Partially Filled"
          : "Filled",
        isOpen: nextIsOpen,
        filledAmount: nextFilledAmount,
        remainingAmount:
          nextRemainingAmount,
        averagePrice:
          nextFilledAmount > 0
            ? nextQuoteFilled /
              nextFilledAmount
            : null,
        quoteFilled: nextQuoteFilled,
        reservedAsset: nextIsOpen
          ? order.reservedAsset
          : null,
        reservedAmount:
          nextReservedAmount,
        tpSl: nextTpSl,
        updatedAt,
      });

      execution.fills.forEach((fill) => {
        fillRecords.push({
          id: crypto.randomUUID(),
          orderId: order.id,
          pair: order.pair,
          side: order.side,
          price: fill.price,
          amount: fill.amount,
          quoteAmount: fill.quoteAmount,
          createdAt: updatedAt,
        });
      });
    });

    const projectedOrders = (
      Array.isArray(tradeOrders)
        ? tradeOrders
        : []
    ).map(
      (order) =>
        orderUpdates.get(order.id) ?? order
    );

    const tpSlExitPlan =
      buildTpSlExitRefreshPlan(
        projectedOrders,
        pair,
        {
          asks: openLimitPlan.remainingAsks,
          bids: openLimitPlan.remainingBids,
        },
        nextOrderBook.referencePrice,
        updatedAt
      );

    const tpSlPlans = tpSlExitPlan.plans;

    if (
      matches.length === 0 &&
      tpSlPlans.length === 0
    ) {
      return;
    }

    tpSlPlans.forEach(
      ({
        order,
        trigger,
        isNewTrigger,
        triggeredAt,
        exitSide,
        exitLimitPrice,
        execution,
      }) => {
        const [
          orderBaseAsset,
          orderQuoteAsset,
        ] = order.pair.split("/");

        const entryReservedAsset =
          order.isOpen
            ? order.reservedAsset
            : null;

        const entryReservedAmount =
          order.isOpen
            ? Number(
                order.reservedAmount ?? 0
              )
            : 0;

        const cancelledEntryAmount =
          order.isOpen
            ? Number(
                order.remainingAmount ?? 0
              )
            : 0;

        if (
          entryReservedAsset &&
          Number.isFinite(
            entryReservedAmount
          ) &&
          entryReservedAmount > 0
        ) {
          if (
            entryReservedAsset ===
            orderQuoteAsset
          ) {
            quoteBalanceCredit +=
              entryReservedAmount;
          } else if (
            entryReservedAsset ===
            orderBaseAsset
          ) {
            baseBalanceCredit +=
              entryReservedAmount;
          }
        }

        const protectedAmount = Number(
          order.tpSl.protectedAmount ?? 0
        );

        const previousExecutedAmount = Number(
          order.tpSl.executedAmount ?? 0
        );

        const previousExitQuoteFilled = Number(
          order.tpSl.exitQuoteFilled ?? 0
        );

        const previousTpSlReserveAmount = Number(
          order.tpSl.reserveAmount ?? 0
        );

        const nextExecutedAmount =
          previousExecutedAmount +
          execution.filledAmount;

        const nextExitQuoteFilled =
          previousExitQuoteFilled +
          execution.quoteAmount;

        const nextTpSlReserve =
          calculateTpSlReserve(
            order.side,
            orderBaseAsset,
            orderQuoteAsset,
            order.tpSl,
            protectedAmount,
            nextExecutedAmount
          );

        const releasedTpSlReserve =
          previousTpSlReserveAmount -
          nextTpSlReserve.amount;

        if (order.side === "Buy") {
          quoteBalanceCredit +=
            execution.quoteAmount;
        } else {
          quoteBalanceCredit +=
            releasedTpSlReserve -
            execution.quoteAmount;

          baseBalanceCredit +=
            execution.filledAmount;
        }

        const remainingProtectedAmount =
          Math.max(
            0,
            protectedAmount -
              nextExecutedAmount
          );

        const protectionCompleted =
          remainingProtectedAmount <=
          Number.EPSILON;

        const nextTpSlState =
          protectionCompleted
            ? "Completed"
            : nextExecutedAmount >
                Number.EPSILON
              ? "Partially Executed"
              : "Triggered";

        const nextTpSl = {
          ...order.tpSl,
          triggeredBy:
            order.tpSl.triggeredBy ??
            trigger.triggeredBy,
          triggeredAt:
            order.tpSl.triggeredAt ??
            triggeredAt,
          triggerPrice:
            order.tpSl.triggerPrice ??
            trigger.triggerPrice,
          exitSide,
          exitLimitPrice,
          executedAmount:
            nextExecutedAmount,
          exitQuoteFilled:
            nextExitQuoteFilled,
          exitAveragePrice:
            nextExecutedAmount >
            Number.EPSILON
              ? nextExitQuoteFilled /
                nextExecutedAmount
              : null,
          reserveAsset:
            nextTpSlReserve.asset,
          reserveAmount:
            nextTpSlReserve.amount,
          state: nextTpSlState,
          completedAt:
            protectionCompleted
              ? updatedAt
              : null,
        };

        orderUpdates.set(order.id, {
          ...order,
          status: order.isOpen
            ? "Partially Filled"
            : order.status,
          isOpen: false,
          remainingAmount: order.isOpen
            ? 0
            : order.remainingAmount,
          cancelledAmount:
            Number(
              order.cancelledAmount ?? 0
            ) + cancelledEntryAmount,
          reservedAsset: null,
          reservedAmount: 0,
          tpSl: nextTpSl,
          updatedAt,
        });

        execution.fills.forEach((fill) => {
          fillRecords.push({
            id: crypto.randomUUID(),
            orderId: order.id,
            pair: order.pair,
            side: exitSide,
            price: fill.price,
            amount: fill.amount,
            quoteAmount: fill.quoteAmount,
            source: "TP/SL",
            triggeredBy:
              nextTpSl.triggeredBy,
            createdAt: updatedAt,
          });
        });
      }
    );

    if (
      availableQuoteBalance +
        quoteBalanceCredit <
      -Number.EPSILON
    ) {
      setMessage(
        `Insufficient ${quoteAsset} balance to complete TP/SL accounting.`
      );
      return;
    }

    setWalletBalances((current) => {
      const currentSpot =
        current?.["Spot Wallet"] ?? {};

      const currentQuoteBalance = Number(
        currentSpot[quoteAsset] ?? 0
      );

      const currentBaseBalance = Number(
        currentSpot[activeMarket.base] ?? 0
      );

      return {
        ...current,
        "Spot Wallet": {
          ...currentSpot,
          [quoteAsset]:
            currentQuoteBalance +
            quoteBalanceCredit,
          [activeMarket.base]:
            currentBaseBalance +
            baseBalanceCredit,
        },
      };
    });

    setTradeOrders((current) =>
      (
        Array.isArray(current)
          ? current
          : []
      ).map(
        (order) =>
          orderUpdates.get(order.id) ??
          order
      )
    );

    if (fillRecords.length > 0) {
      setTradeFills((current) => [
        ...fillRecords,
        ...(
          Array.isArray(current)
            ? current
            : []
        ),
      ]);

      const tradeTransactions =
        buildTradeTransactions(fillRecords);

      if (tradeTransactions.length > 0) {
        setTransactions((current) => [
          ...tradeTransactions,
          ...(Array.isArray(current) ? current : []),
        ]);
      }
    }

    const newTriggerCount =
      tpSlPlans.filter(
        (plan) => plan.isNewTrigger
      ).length;

    const tpSlFillCount =
      tpSlPlans.filter(
        (plan) =>
          plan.execution.filledAmount >
          Number.EPSILON
      ).length;

    if (newTriggerCount > 0) {
      setMessage(
        `${newTriggerCount} TP/SL protection${
          newTriggerCount === 1 ? "" : "s"
        } triggered; ${tpSlFillCount} exit${
          tpSlFillCount === 1 ? "" : "s"
        } matched.`
      );
      return;
    }

    if (tpSlPlans.length > 0) {
      setMessage(
        tpSlFillCount > 0
          ? `${tpSlFillCount} TP/SL exit${
              tpSlFillCount === 1
                ? ""
                : "s"
            } matched on Order Book refresh.`
          : "Triggered TP/SL exit remains pending."
      );
      return;
    }

    setMessage(
      `${matches.length} open Limit order${
        matches.length === 1 ? "" : "s"
      } matched on Order Book refresh.`
    );
  };

  const submitSpotOrder = () => {
    if (!isLoggedIn) {
      window.dispatchEvent(new CustomEvent("bitlora:login"));
      return;
    }

    const requestedAmount = Number(amount);
    const limitPrice = Number(price);

    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }

    if (
      orderType === "Limit" &&
      (!Number.isFinite(limitPrice) || limitPrice <= 0)
    ) {
      setMessage("Enter a valid limit price.");
      return;
    }

    let tpSlConfig = null;

    if (tpSlEnabled) {
      const takeProfit = Number(takeProfitPrice);
      const stopTrigger = Number(stopLossTriggerPrice);
      const stopLimit = Number(stopLossLimitPrice);

      if (
        !Number.isFinite(takeProfit) ||
        takeProfit <= 0 ||
        !Number.isFinite(stopTrigger) ||
        stopTrigger <= 0 ||
        !Number.isFinite(stopLimit) ||
        stopLimit <= 0
      ) {
        setMessage("Enter valid TP/SL prices.");
        return;
      }

      if (side === "Buy") {
        if (takeProfit <= limitPrice) {
          setMessage("Take Profit must be above the entry price.");
          return;
        }

        if (stopTrigger >= limitPrice) {
          setMessage("Stop Trigger must be below the entry price.");
          return;
        }

        if (stopLimit > stopTrigger) {
          setMessage("Stop Limit must be at or below the Stop Trigger.");
          return;
        }
      } else {
        if (takeProfit >= limitPrice) {
          setMessage("Take Profit must be below the entry price.");
          return;
        }

        if (stopTrigger <= limitPrice) {
          setMessage("Stop Trigger must be above the entry price.");
          return;
        }

        if (stopLimit < stopTrigger) {
          setMessage("Stop Limit must be at or above the Stop Trigger.");
          return;
        }
      }

      tpSlConfig = {
        enabled: true,
        takeProfitPrice: takeProfit,
        stopLossTriggerPrice: stopTrigger,
        stopLossLimitPrice: stopLimit,
      };
    }

    if (side === "Buy" && orderType === "Limit") {
      const maximumQuoteCommitment = limitPrice * requestedAmount;

      if (availableQuoteBalance < maximumQuoteCommitment) {
        setMessage(`Insufficient ${quoteAsset} balance.`);
        return;
      }
    }

    if (side === "Sell" && availableBaseBalance < requestedAmount) {
      setMessage(`Insufficient ${activeMarket.base} balance.`);
      return;
    }

    const sourceLevels =
      side === "Buy" ? activeOrderBook.asks : activeOrderBook.bids;

    const execution = buildSpotExecutionPlan(
      sourceLevels,
      side,
      orderType,
      limitPrice,
      requestedAmount
    );

    if (orderType === "Market" && execution.filledAmount <= 0) {
      setMessage("No executable market liquidity is available.");
      return;
    }

    if (
      side === "Buy" &&
      orderType === "Market" &&
      availableQuoteBalance < execution.quoteAmount
    ) {
      setMessage(`Insufficient ${quoteAsset} balance.`);
      return;
    }

    const initialTpSlReserve = calculateTpSlReserve(
      side,
      activeMarket.base,
      quoteAsset,
      tpSlConfig,
      execution.filledAmount
    );

    if (
      side === "Sell" &&
      initialTpSlReserve.amount >
        availableQuoteBalance + execution.quoteAmount
    ) {
      setMessage(
        `Insufficient ${quoteAsset} balance to reserve TP/SL protection.`
      );
      return;
    }

    const remainingAmount = execution.remainingAmount;

    const isOpen =
      orderType === "Limit" && remainingAmount > Number.EPSILON;

    const expiredAmount =
      orderType === "Market" ? remainingAmount : 0;

    const status = isOpen
      ? execution.filledAmount > 0
        ? "Partially Filled"
        : "Open"
      : execution.filledAmount >= requestedAmount
        ? "Filled"
        : "Partially Filled";

    const reservedAsset =
      isOpen
        ? side === "Buy"
          ? quoteAsset
          : activeMarket.base
        : null;

    const reservedAmount =
      isOpen
        ? side === "Buy"
          ? remainingAmount * limitPrice
          : remainingAmount
        : 0;

    const orderId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const order = {
      id: orderId,
      pair,
      side,
      type: orderType,
      status,
      isOpen,
      price: orderType === "Limit" ? limitPrice : null,
      amount: requestedAmount,
      filledAmount: execution.filledAmount,
      remainingAmount,
      expiredAmount,
      averagePrice: execution.averagePrice,
      quoteFilled: execution.quoteAmount,
      reservedAsset,
      reservedAmount,
      tpSl: tpSlConfig
        ? {
            ...tpSlConfig,
            protectedAmount: execution.filledAmount,
            executedAmount: 0,
            reserveAsset: initialTpSlReserve.asset,
            reserveAmount: initialTpSlReserve.amount,
            state:
              execution.filledAmount > Number.EPSILON
                ? "Ready"
                : "Pending Entry Fill",
            triggeredBy: null,
          }
        : null,
      createdAt,
      updatedAt: createdAt,
    };

    setWalletBalances((current) => {
      const currentSpot = current?.["Spot Wallet"] ?? {};
      const currentQuoteBalance = Number(currentSpot[quoteAsset] ?? 0);
      const currentBaseBalance = Number(
        currentSpot[activeMarket.base] ?? 0
      );

      if (side === "Buy") {
        const quoteDebit =
          execution.quoteAmount + reservedAmount;

        return {
          ...current,
          "Spot Wallet": {
            ...currentSpot,
            [quoteAsset]: currentQuoteBalance - quoteDebit,
            [activeMarket.base]:
              currentBaseBalance + execution.filledAmount - initialTpSlReserve.amount,
          },
        };
      }

      const baseDebit =
        execution.filledAmount + reservedAmount;

      return {
        ...current,
        "Spot Wallet": {
          ...currentSpot,
          [activeMarket.base]: currentBaseBalance - baseDebit,
          [quoteAsset]:
            currentQuoteBalance + execution.quoteAmount - initialTpSlReserve.amount,
        },
      };
    });

    setTradeOrders((current) => [
      order,
      ...(Array.isArray(current) ? current : []),
    ]);

    if (execution.fills.length > 0) {
      const fillRecords = execution.fills.map((fill) => ({
        id: crypto.randomUUID(),
        orderId,
        pair,
        side,
        price: fill.price,
        amount: fill.amount,
        quoteAmount: fill.quoteAmount,
        createdAt,
      }));

      setTradeFills((current) => [
        ...fillRecords,
        ...(Array.isArray(current) ? current : []),
      ]);

      const tradeTransactions =
        buildTradeTransactions(fillRecords);

      if (tradeTransactions.length > 0) {
        setTransactions((current) => [
          ...tradeTransactions,
          ...(Array.isArray(current) ? current : []),
        ]);
      }
    }

    setAmount("");

    if (isOpen && execution.filledAmount > 0) {
      setMessage(
        `${side} Limit order partially filled; remaining amount is open.`
      );
      return;
    }

    if (isOpen) {
      setMessage(`${side} Limit order placed in Open Orders.`);
      return;
    }

    if (execution.filledAmount < requestedAmount) {
      setMessage(
        `${side} Market order partially filled; unmatched amount expired.`
      );
      return;
    }

    setMessage(
      `${side} ${orderType} order filled at average ${formatTradePrice(
        execution.averagePrice
      )} ${quoteAsset}.`
    );
  };

  const formatTradePrice = (value) => {
    if (value >= 1000) {
      return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    if (value >= 1) {
      return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      });
    }

    if (value >= 0.01) return value.toFixed(4);
    if (value >= 0.0001) return value.toFixed(6);
    return value.toFixed(8);
  };

  const spotBalances = walletBalances?.["Spot Wallet"] ?? {};
  const availableQuoteBalance = Number(spotBalances[quoteAsset] ?? 0);
  const availableBaseBalance = Number(spotBalances[activeMarket.base] ?? 0);
  const effectiveOrderPrice =
    orderType === "Market"
      ? Number(activeOrderBook.referencePrice)
      : Number(price);

  const formatTradeAmount = (value) => {
    if (!Number.isFinite(value) || value <= 0) {
      return "";
    }

    return value.toFixed(8).replace(/\.?0+$/, "");
  };

  const handleBalancePercentage = (percent) => {
    if (!isLoggedIn) {
      window.dispatchEvent(new CustomEvent("bitlora:login"));
      return;
    }

      if (side === "Buy") {
        if (
          !Number.isFinite(availableQuoteBalance) ||
          availableQuoteBalance <= 0
        ) {
          setMessage(`No available ${quoteAsset} balance.`);
          return;
        }

        const quoteBudget =
          availableQuoteBalance * (percent / 100);

        if (orderType === "Market") {
          const baseAmount = calculateMarketBuyAmount(
            activeOrderBook.asks,
            quoteBudget
          );

          if (baseAmount <= Number.EPSILON) {
            setMessage("No executable market liquidity is available.");
            return;
          }

          setAmount(formatTradeAmount(baseAmount));
          setMessage("");
          return;
        }

        if (
          !Number.isFinite(effectiveOrderPrice) ||
          effectiveOrderPrice <= 0
        ) {
          setMessage("Enter a valid price.");
          return;
        }

        const baseAmount =
          quoteBudget / effectiveOrderPrice;

        setAmount(formatTradeAmount(baseAmount));
        setMessage("");
        return;
      }

    if (!Number.isFinite(availableBaseBalance) || availableBaseBalance <= 0) {
      setMessage(`No available ${activeMarket.base} balance.`);
      return;
    }

    const baseAmount = availableBaseBalance * (percent / 100);

    setAmount(formatTradeAmount(baseAmount));
    setMessage("");
  };

  const tradeBalanceAsset =
    side === "Buy" ? quoteAsset : activeMarket.base;

  const availableTradeBalance =
    side === "Buy" ? availableQuoteBalance : availableBaseBalance;

  const numericOrderAmount = Number(amount);
  const numericOrderPrice = Number(price);

  const orderTotal =
    Number.isFinite(numericOrderAmount) && numericOrderAmount > 0
      ? orderType === "Market"
        ? buildSpotExecutionPlan(
            side === "Buy"
              ? activeOrderBook.asks
              : activeOrderBook.bids,
            side,
            "Market",
            numericOrderPrice,
            numericOrderAmount
          ).quoteAmount
        : Number.isFinite(numericOrderPrice) &&
            numericOrderPrice > 0
          ? numericOrderAmount * numericOrderPrice
          : 0
      : 0;

  const groupedOrderBookAsks = groupOrderBookLevels(
    activeOrderBook.asks,
    orderBookPrecision,
    "asks"
  );
  const groupedOrderBookBids = groupOrderBookLevels(
    activeOrderBook.bids,
    orderBookPrecision,
    "bids"
  );


  const orderBookPrecisionLabel =
    activeOrderBookPrecisionOptions.find(
      (option) => option.decimals === orderBookPrecision
    )?.label ?? activeOrderBookPrecisionOptions[0]?.label;




  return (
    <section className="trade-page">
      <div className="trade-chart-card">
        <div className="trade-chart-toolbar">
          <div className="trade-pair-area">
            <button
              type="button"
              className={`trade-pair-trigger${
                pairMenuOpen ? " open" : ""
              }`}
              onClick={() => setPairMenuOpen((open) => !open)}
              aria-expanded={pairMenuOpen}
            >
              <strong>{pair}</strong>
              <ChevronDown size={14} />
            </button>

            <span className="trade-change">{activeMarket.change}</span>
          </div>

          <button
            type="button"
            className="trade-chart-settings"
            aria-label="Chart controls"
          >
            <Settings2 size={16} />
          </button>
        </div>

        {pairMenuOpen && (
          <div className="trade-inline-dropdown">
            <div className="trade-inline-dropdown-title">
              <span>Asset</span>
              <span>Select pair</span>
            </div>

            {pairs.map((item) => (
              <button
                type="button"
                key={item}
                className={item === pair ? "selected" : ""}
                onClick={() => selectPair(item)}
              >
                <span>{item}</span>
                {item === pair && <Check size={14} />}
              </button>
            ))}
          </div>
        )}

        <div className="trade-timeframe-row">
          {timeframes.map((item) => (
            <button
              type="button"
              key={item}
              className={timeframe === item ? "active" : ""}
              onClick={() => setTimeframe(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="trade-chart-area">
          <div className="trade-price-axis">
            {chartPriceAxis.map((axisPrice, index) => (
              <span
                key={`${pair}-${index}`}
                className={index === 2 ? "current" : ""}
              >
                {formatTradePrice(axisPrice)}
              </span>
            ))}
          </div>

          <div className="trade-chart-main">
            <div className="trade-chart-grid">
              {Array.from({ length: 5 }).map((_, index) => (
                <i className="horizontal" key={`h-${index}`} />
              ))}

              {Array.from({ length: 7 }).map((_, index) => (
                <i className="vertical" key={`v-${index}`} />
              ))}
            </div>

            <div className="trade-candle-area">
              {activeCandles.map(([open, high, low, close], index) => {
                const min = chartMin;
                const max = chartMax;
                const range = chartRange;

                const top = ((max - high) / range) * 100;
                const bottom = ((max - low) / range) * 100;
                const bodyTop =
                  ((max - Math.max(open, close)) / range) * 100;
                const bodyBottom =
                  ((max - Math.min(open, close)) / range) * 100;

                return (
                  <div className="trade-candle" key={index}>
                    <span
                      className="trade-wick"
                      style={{
                        top: `${top}%`,
                        height: `${Math.max(1, bottom - top)}%`,
                      }}
                    />

                    <span
                      className={`trade-candle-body ${
                        close >= open ? "up" : "down"
                      }`}
                      style={{
                        top: `${bodyTop}%`,
                        height: `${Math.max(
                          1.2,
                          bodyBottom - bodyTop
                        )}%`,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="trade-current-price">
              {formatTradePrice(activeOrderBook.referencePrice)} {quoteAsset}
            </div>

            <div className="trade-volume-area">
              {activeVolumeBars.map((height, index) => (
                <span
                  key={index}
                  style={{ height: `${height}%` }}
                  className={index % 3 === 0 ? "down" : "up"}
                />
              ))}
            </div>

            <div className="trade-time-axis">
              <span>12:00</span>
              <span>12:30</span>
              <span>13:00</span>
              <span>13:30</span>
            </div>
          </div>
        </div>
      </div>

      <div className="trade-bottom-grid">
        <div className="trade-order-card">
          <div className="trade-side-tabs">
            <button
              type="button"
              className={side === "Buy" ? "buy active" : "buy"}
              onClick={() => setSide("Buy")}
            >
              Buy
            </button>

            <button
              type="button"
              className={side === "Sell" ? "sell active" : "sell"}
              onClick={() => setSide("Sell")}
            >
              Sell
            </button>
          </div>

          <div className="trade-order-type-wrap">
            <button
              type="button"
              className={`trade-order-type${
                orderTypeOpen ? " open" : ""
              }`}
              onClick={() => setOrderTypeOpen((open) => !open)}
              aria-expanded={orderTypeOpen}
            >
              <span>{orderType}</span>
              <ChevronDown size={13} />
            </button>

            {orderTypeOpen && (
              <div className="trade-order-type-menu">
                {["Limit", "Market"].map((type) => (
                  <button
                    type="button"
                    key={type}
                    className={type === orderType ? "selected" : ""}
                    onClick={() => {
                      setOrderType(type);
                      setOrderTypeOpen(false);
                    }}
                  >
                    <span>{type}</span>
                    {type === orderType && <Check size={13} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {orderType === "Limit" && (
            <label className="trade-field">
              <span>Price ({quoteAsset})</span>
              <div>
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  inputMode="decimal"
                />
                <em>{quoteAsset}</em>
              </div>
            </label>
          )}

          <label className="trade-field">
            <span>Amount ({activeMarket.base})</span>
            <div>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.0000"
                inputMode="decimal"
              />
              <em>{activeMarket.base}</em>
            </div>
          </label>

            <label className="trade-field">
              <span>
                {orderType === "Market"
                  ? "Estimated Total"
                  : "Total"}{" "}
                ({quoteAsset})
              </span>
              <div>
                <input
                  value={
                    orderTotal > 0
                      ? formatTradePrice(orderTotal)
                      : "0"
                  }
                  readOnly
                  tabIndex={-1}
                />
                <em>{quoteAsset}</em>
              </div>
            </label>

          <div className="trade-percentages">
            {[25, 50, 75, 100].map((percent) => (
              <button
                type="button"
                key={percent}
                onClick={() => handleBalancePercentage(percent)}
              >
                {percent}%
              </button>
            ))}
          </div>

          {orderType === "Limit" && (
            <>
              <label className="trade-tpsl-toggle">
                <input
                  type="checkbox"
                  checked={tpSlEnabled}
                  onChange={(event) => setTpSlEnabled(event.target.checked)}
                />
                <span>TP/SL</span>
              </label>

              {tpSlEnabled && (
                <>
                  <label className="trade-field">
                    <span>Take Profit</span>
                    <div>
                      <input
                        value={takeProfitPrice}
                        onChange={(event) => setTakeProfitPrice(event.target.value)}
                        inputMode="decimal"
                      />
                      <em>{quoteAsset}</em>
                    </div>
                  </label>

                  <label className="trade-field">
                    <span>Stop Trigger</span>
                    <div>
                      <input
                        value={stopLossTriggerPrice}
                        onChange={(event) =>
                          setStopLossTriggerPrice(event.target.value)
                        }
                        inputMode="decimal"
                      />
                      <em>{quoteAsset}</em>
                    </div>
                  </label>

                  <label className="trade-field">
                    <span>Stop Limit</span>
                    <div>
                      <input
                        value={stopLossLimitPrice}
                        onChange={(event) =>
                          setStopLossLimitPrice(event.target.value)
                        }
                        inputMode="decimal"
                      />
                      <em>{quoteAsset}</em>
                    </div>
                  </label>
                </>
              )}
            </>
          )}

          <div className="trade-total">
            <span>AVL ({tradeBalanceAsset})</span>
            <strong>
              {isLoggedIn
                ? formatTradeAmount(availableTradeBalance) || "0"
                : "--"}
            </strong>
          </div>

          <button
            type="button"
            className={`trade-submit ${side.toLowerCase()}`}
            onClick={submitSpotOrder}
          >
            {isLoggedIn ? `${side} ${activeMarket.base}` : "Log In to Trade"}
          </button>

          <p className="trade-demo-note">
            {isLoggedIn ? "Demo trading only." : "Sign in to place buy and sell orders."}
          </p>

          {message && <p className="trade-message">{message}</p>}
        </div>


        <div className="trade-book-card">
          <div className="trade-book-heading">
            <strong>Order Book</strong>

            <button
              type="button"
              aria-label="Refresh order book"
              className="trade-book-refresh"
                onClick={refreshOrderBook}
            >
              <RefreshCw size={13} />
            </button>
          </div>

          <div className="trade-book-columns">
            <span>Price ({quoteAsset})</span>
            <span>Amount ({activeMarket.base})</span>
          </div>

          {orderBookView !== "Buy" && (
            <div className="trade-book-list asks">
              {groupedOrderBookAsks.map(([bookPrice, bookAmount]) => (
                  <div
                    key={bookPrice}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      selectOrderBookPrice(bookPrice, "Buy")
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectOrderBookPrice(bookPrice, "Buy");
                      }
                    }}
                  >
                  <span>{bookPrice}</span>
                  <span>{bookAmount}</span>
                </div>
              ))}
            </div>
          )}

          <div className="trade-book-mid">
            <strong>
              {formatOrderBookPrice(
                  activeOrderBook.referencePrice,
                  marketOrderBookPrecision
                )}
            </strong>
          </div>

          {orderBookView !== "Sell" && (
            <div className="trade-book-list bids">
              {groupedOrderBookBids.map(([bookPrice, bookAmount], index) => (
                <div
                  key={bookPrice}
                  className={index === 0 ? "highlight" : ""}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      selectOrderBookPrice(bookPrice, "Sell")
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectOrderBookPrice(bookPrice, "Sell");
                      }
                    }}
                >
                  <span>{bookPrice}</span>
                  <span>{bookAmount}</span>
                </div>
              ))}
            </div>
          )}

          <div className="trade-book-controls">
            <div className="trade-order-type-wrap">
              <button
                type="button"
                className={`trade-order-type${orderBookViewOpen ? " open" : ""}`}
                onClick={() => {
                  setOrderBookViewOpen((open) => !open);
                  setOrderBookPrecisionOpen(false);
                }}
                aria-expanded={orderBookViewOpen}
              >
                <span>{orderBookView}</span>
                <ChevronDown size={13} />
              </button>

              {orderBookViewOpen && (
                <div className="trade-book-control-menu">
                  {orderBookViewOptions.map((view) => (
                    <button
                      type="button"
                      key={view}
                      className={view === orderBookView ? "selected" : ""}
                      onClick={() => {
                        setOrderBookView(view);
                        setOrderBookViewOpen(false);
                      }}
                    >
                      <span>{view}</span>
                      {view === orderBookView && <Check size={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="trade-order-type-wrap">
              <button
                type="button"
                className={`trade-order-type${orderBookPrecisionOpen ? " open" : ""}`}
                onClick={() => {
                  setOrderBookPrecisionOpen((open) => !open);
                  setOrderBookViewOpen(false);
                }}
                aria-expanded={orderBookPrecisionOpen}
              >
                <span>{orderBookPrecisionLabel}</span>
                <ChevronDown size={13} />
              </button>

              {orderBookPrecisionOpen && (
                <div className="trade-book-control-menu">
                  {activeOrderBookPrecisionOptions.map((option) => (
                    <button
                      type="button"
                      key={option.decimals}
                      className={
                        option.decimals === orderBookPrecision ? "selected" : ""
                      }
                      onClick={() => {
                        setOrderBookPrecision(option.decimals);
                        setOrderBookPrecisionOpen(false);
                      }}
                    >
                      <span>{option.label}</span>
                      {option.decimals === orderBookPrecision && <Check size={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="trade-account-panel">
          <div
            className="trade-account-tabs"
            role="tablist"
            aria-label="Trade activity"
          >
            {tradeAccountTabs.map((tab) => (
              <button
                type="button"
                key={tab}
                role="tab"
                aria-selected={tradeAccountTab === tab}
                className={tradeAccountTab === tab ? "active" : ""}
                onClick={() => setTradeAccountTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="trade-account-content" role="tabpanel">
            {!isLoggedIn ? (
              <button
                type="button"
                className="trade-account-login"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("bitlora:login"))
                }
              >
                Log In to View {tradeAccountTab}
              </button>
            ) : (
              (() => {
                const orders = Array.isArray(tradeOrders) ? tradeOrders : [];
                const fills = Array.isArray(tradeFills) ? tradeFills : [];

                if (tradeAccountTab === "Open Orders") {
                  const openOrders = orders.filter((order) => order.isOpen);

                  const cancelOpenOrder = (order) => {
                    if (!order?.isOpen) {
                      return;
                    }

                    const reservedAmount = Number(order.reservedAmount ?? 0);
                    const reservedAsset = order.reservedAsset;
                    const cancelledAt = new Date().toISOString();

                    if (
                      reservedAsset &&
                      Number.isFinite(reservedAmount) &&
                      reservedAmount > 0
                    ) {
                      setWalletBalances((current) => {
                        const currentSpot = current?.["Spot Wallet"] ?? {};
                        const currentBalance = Number(
                          currentSpot[reservedAsset] ?? 0
                        );

                        return {
                          ...current,
                          "Spot Wallet": {
                            ...currentSpot,
                            [reservedAsset]: currentBalance + reservedAmount,
                          },
                        };
                      });
                    }

                    setTradeOrders((current) =>
                      (Array.isArray(current) ? current : []).map(
                        (currentOrder) =>
                          currentOrder.id === order.id && currentOrder.isOpen
                            ? {
                                ...currentOrder,
                                status: "Cancelled",
                                isOpen: false,
                                reservedAsset: null,
                                reservedAmount: 0,
                                updatedAt: cancelledAt,
                              }
                            : currentOrder
                      )
                    );

                    setMessage(`${order.pair} ${order.side} order cancelled.`);
                  };

                  if (openOrders.length === 0) {
                    return (
                      <p className="trade-account-empty">No open orders.</p>
                    );
                  }

                  return (
                    <div className="trade-account-table open-orders">
                      <div className="trade-account-row heading">
                        <span>Pair</span>
                        <span>Side</span>
                        <span>Type</span>
                        <span>Price</span>
                        <span>Amount</span>
                        <span>Filled</span>
                        <span>Status</span>
                        <span>Action</span>
                      </div>

                      {openOrders.map((order) => (
                        <div className="trade-account-row" key={order.id}>
                          <span>{order.pair}</span>
                          <span className={order.side.toLowerCase()}>
                            {order.side}
                          </span>
                          <span>{order.type}</span>
                          <span>
                            {order.price
                              ? formatTradePrice(order.price)
                              : "Market"}
                          </span>
                          <span>
                            {formatTradeAmount(order.amount) || "0"}
                          </span>
                          <span>
                            {formatTradeAmount(order.filledAmount) || "0"}
                          </span>
                          <span>{order.status}</span>
                          <span>
                            <button
                              type="button"
                              className="trade-order-cancel"
                              onClick={() => cancelOpenOrder(order)}
                            >
                              Cancel
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }

                if (tradeAccountTab === "Order History") {
                  const orderHistory = orders.filter((order) => !order.isOpen);

                  if (orderHistory.length === 0) {
                    return (
                      <p className="trade-account-empty">No order history yet.</p>
                    );
                  }

                  return (
                    <div className="trade-account-table order-history">
                      <div className="trade-account-row heading">
                        <span>Time</span>
                        <span>Pair</span>
                        <span>Side</span>
                        <span>Type</span>
                        <span>Amount</span>
                        <span>Avg. Price</span>
                        <span>Status</span>
                      </div>

                      {orderHistory.map((order) => (
                        <div className="trade-account-row" key={order.id}>
                          <span>
                            {new Date(
                              order.updatedAt || order.createdAt
                            ).toLocaleString()}
                          </span>
                          <span>{order.pair}</span>
                          <span className={order.side.toLowerCase()}>
                            {order.side}
                          </span>
                          <span>{order.type}</span>
                          <span>
                            {formatTradeAmount(order.amount) || "0"}
                          </span>
                          <span>
                            {order.averagePrice
                              ? formatTradePrice(order.averagePrice)
                              : "-"}
                          </span>
                          <span>
                            {order.tpSl
                              ? `${order.status} · TP/SL ${order.tpSl.state}`
                              : order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }

                if (fills.length === 0) {
                  return (
                    <p className="trade-account-empty">No trade history yet.</p>
                  );
                }

                return (
                  <div className="trade-account-table trade-history">
                    <div className="trade-account-row heading">
                      <span>Time</span>
                      <span>Pair</span>
                      <span>Side</span>
                      <span>Price</span>
                      <span>Amount</span>
                      <span>Total</span>
                      <span>Status</span>
                    </div>

                    {fills.map((fill) => (
                      <div className="trade-account-row" key={fill.id}>
                        <span>
                          {new Date(fill.createdAt).toLocaleString()}
                        </span>
                        <span>{fill.pair}</span>
                        <span className={fill.side.toLowerCase()}>
                          {fill.side}
                        </span>
                        <span>{formatTradePrice(fill.price)}</span>
                        <span>
                          {formatTradeAmount(fill.amount) || "0"}
                        </span>
                        <span>{formatTradePrice(fill.quoteAmount)}</span>
                        <span>
                          {fill.source === "TP/SL" && fill.triggeredBy
                            ? fill.triggeredBy
                            : "Filled"}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>
        </section>
      </div>
    </section>


  );
}

function PublicTrade(props) {
  return <TradeSurface isLoggedIn={false} {...props} />;
}

function LoggedInTrade(props) {
  return <TradeSurface isLoggedIn {...props} />;
}

export default function Trade({
  isLoggedIn,
  selectedTradePair,
  walletBalances,
  setWalletBalances,
  transactions,
  setTransactions,
  tradeOrders,
  setTradeOrders,
  tradeFills,
  setTradeFills,
}) {
  const sharedProps = {
    selectedTradePair,
    walletBalances,
    setWalletBalances,
    transactions,
    setTransactions,
    tradeOrders,
    setTradeOrders,
    tradeFills,
    setTradeFills,
  };

  if (isLoggedIn) {
    return <LoggedInTrade {...sharedProps} />;
  }

  return <PublicTrade {...sharedProps} />;
}
