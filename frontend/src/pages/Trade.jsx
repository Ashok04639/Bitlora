import { useEffect, useMemo, useState } from "react";
import TradingViewChart from "../components/TradingViewChart";
import { api } from "../services/api";

const TIMEFRAMES = [
  ["1s", "1S"],
  ["1m", "1M"],
  ["5m", "5M"],
  ["15m", "15M"],
  ["30m", "30M"],
  ["1H", "1H"],
  ["4H", "4H"],
  ["1D", "1D"],
  ["1Mth", "1M"],
];

const USER_ID = 1;

export default function Trade() {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [marketsData, setMarketsData] = useState([]);
  const [balanceData, setBalanceData] = useState(null);
  const [assetsData, setAssetsData] = useState([]);
  const [orderBookData, setOrderBookData] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);

  const [timeframe, setTimeframe] = useState("1m");
  const [side, setSide] = useState("Buy");
  const [orderType, setOrderType] = useState("Limit");
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradePrice, setTradePrice] = useState("");
  const [tradeTotal, setTradeTotal] = useState("");
  const [tradeMessage, setTradeMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const currentMarket = useMemo(
    () => marketsData.find((item) => item.pair === selectedPair),
    [marketsData, selectedPair]
  );

  const marketPrice = useMemo(() => {
    const raw = currentMarket?.price;
    return Number(String(raw ?? "").replace(/[$,]/g, ""));
  }, [currentMarket]);

  const baseAsset = selectedPair.split("/")[0];
  const quoteAsset = selectedPair.split("/")[1];

  const loadMarkets = async () => {
    try {
      const data = await api.markets();

      if (data.success && Array.isArray(data.markets)) {
        setMarketsData(data.markets);
      }
    } catch {
      setMarketsData([]);
    }
  };

  const loadBalance = async () => {
    try {
      const data = await api.balance(USER_ID);

      if (data.success) {
        setBalanceData(data);
      }
    } catch {
      setBalanceData(null);
    }
  };

  const loadAssets = async () => {
    try {
      const data = await api.assets(USER_ID);

      if (data.success && Array.isArray(data.assets)) {
        setAssetsData(data.assets);
      }
    } catch {
      setAssetsData([]);
    }
  };

  const loadOrderBook = async () => {
    try {
      const data = await api.orderBook(selectedPair);

      if (data.success) {
        setOrderBookData(data.orders || []);
      }
    } catch (error) {
      console.error("Failed to load order book:", error);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await api.orders(USER_ID);

      if (data.success && Array.isArray(data.orders)) {
        setOpenOrders(
          data.orders.filter((order) => order.status === "Open")
        );

        setOrderHistory(
          data.orders.filter((order) => order.status !== "Open")
        );
      }
    } catch {
      setOpenOrders([]);
      setOrderHistory([]);
    }
  };

  useEffect(() => {
    loadMarkets();
    loadBalance();
    loadAssets();
    loadOrders();
  }, []);

  useEffect(() => {
    loadOrderBook();
  }, [selectedPair]);

  useEffect(() => {
    if (orderType === "Market") {
      setTradePrice("");
      setTradeTotal(
        tradeAmount && Number.isFinite(marketPrice)
          ? String(marketPrice * Number(tradeAmount))
          : ""
      );
      return;
    }

    const amount = Number(tradeAmount);
    const price = Number(tradePrice);

    if (
      tradeAmount &&
      tradePrice &&
      Number.isFinite(amount) &&
      Number.isFinite(price)
    ) {
      setTradeTotal(String(amount * price));
    } else {
      setTradeTotal("");
    }
  }, [tradeAmount, tradePrice, orderType, marketPrice]);

  const handleTradeOrder = async () => {
    const amount = Number(tradeAmount);
    const market = marketsData.find((item) => item.pair === selectedPair);

    const currentMarketPrice = Number(
      String(market?.price ?? "").replace(/[$,]/g, "")
    );

    const price =
      orderType === "Market"
        ? currentMarketPrice
        : Number(tradePrice);

    const total = price * amount;

    if (!tradeAmount.trim()) {
      setTradeMessage("Enter an amount to place this order.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setTradeMessage("Enter a valid amount greater than 0.");
      return;
    }

    if (
      orderType === "Limit" &&
      (!Number.isFinite(price) || price <= 0)
    ) {
      setTradeMessage("Enter a valid price greater than 0.");
      return;
    }

    if (
      orderType === "Market" &&
      (!Number.isFinite(currentMarketPrice) || currentMarketPrice <= 0)
    ) {
      setTradeMessage("Current market price is unavailable.");
      return;
    }

    if (
      side === "Buy" &&
      balanceData &&
      orderType === "Limit" &&
      total > Number(balanceData.balance)
    ) {
      setTradeMessage("Insufficient USDT balance for this order.");
      return;
    }

    try {
      setLoading(true);
      setTradeMessage("");

      const data = await api.placeOrder({
        pair: selectedPair,
        side,
        type: orderType,
        userId: USER_ID,
        price: orderType === "Market" ? 0 : price,
        amount,
      });

      if (!data.success) {
        setTradeMessage(data.message || "Unable to place order.");
        return;
      }

      await loadOrders();
      await loadOrderBook();
      await loadBalance();
      await loadAssets();

      if (data.balance) {
        setBalanceData((current) =>
          current
            ? { ...current, ...data.balance }
            : data.balance
        );
      }

      if (Array.isArray(data.assets)) {
        setAssetsData(data.assets);
      }

      setTradeMessage(
        `${side} ${orderType.toLowerCase()} order placed successfully for ${amount} ${baseAsset}.`
      );

      setTradeAmount("");
      setTradeTotal("");
    } catch {
      setTradeMessage("Unable to connect to the order service.");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const data = await api.cancelOrder(orderId, USER_ID);

      if (!data.success) {
        setTradeMessage(data.message || "Unable to cancel order.");
        return;
      }

      await loadOrders();
      await loadOrderBook();
      await loadBalance();
      await loadAssets();

      setTradeMessage("Order cancelled successfully.");
    } catch {
      setTradeMessage("Unable to connect to the order service.");
    }
  };

  const availablePairs = marketsData.filter((item) => item?.pair);

  const orderBook = Array.isArray(orderBookData)
    ? orderBookData
    : [];

  const sellOrders = orderBook.filter(
    (order) =>
      String(order.side || "").toLowerCase() === "sell"
  );

  const buyOrders = orderBook.filter(
    (order) =>
      String(order.side || "").toLowerCase() === "buy"
  );

  const displayedSellOrders = [...sellOrders].reverse().slice(0, 8);
  const displayedBuyOrders = buyOrders.slice(0, 8);

  const formatNumber = (value, digits = 8) => {
    const number = Number(value);

    if (!Number.isFinite(number)) return "--";

    return number.toLocaleString("en-US", {
      maximumFractionDigits: digits,
    });
  };

  return (
    <section className="page-section trade-page">
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">SPOT TRADING</span>

          <div className="trade-pair-selector">
            <select
              value={selectedPair}
              onChange={(event) => {
                setSelectedPair(event.target.value);
                setTradeMessage("");
              }}
            >
              {availablePairs.length > 0 ? (
                availablePairs.map((market) => (
                  <option key={market.pair} value={market.pair}>
                    {market.pair}
                  </option>
                ))
              ) : (
                <option value={selectedPair}>
                  {selectedPair}
                </option>
              )}
            </select>
          </div>
        </div>

        <div className="trade-market-summary">
          <strong>
            {Number.isFinite(marketPrice)
              ? formatNumber(marketPrice, 2)
              : "--"}
          </strong>

          <span>{quoteAsset}</span>
        </div>
      </div>

      <div className="trade-chart">
        <div className="chart-toolbar">
          <span>{selectedPair}</span>

          <div className="trade-timeframes">
            {TIMEFRAMES.map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={timeframe === value ? "active" : ""}
                onClick={() => setTimeframe(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-frame">
          <TradingViewChart
            pair={selectedPair}
            timeframe={timeframe}
          />
        </div>
      </div>

      <div className="trade-bottom">
        <div className="order-panel">
          <div className="panel-title">Place Order</div>

          <div className="panel-tabs">
            <button
              type="button"
              className={side === "Buy" ? "selected" : ""}
              onClick={() => {
                setSide("Buy");
                setTradeMessage("");
              }}
            >
              Buy
            </button>

            <button
              type="button"
              className={side === "Sell" ? "selected" : ""}
              onClick={() => {
                setSide("Sell");
                setTradeMessage("");
              }}
            >
              Sell
            </button>
          </div>

          <div className="order-type-tabs">
            <button
              type="button"
              className={orderType === "Limit" ? "active" : ""}
              onClick={() => setOrderType("Limit")}
            >
              Limit
            </button>

            <button
              type="button"
              className={orderType === "Market" ? "active" : ""}
              onClick={() => setOrderType("Market")}
            >
              Market
            </button>
          </div>

          <div className="order-fields">
            <label>
              Price
              <span>{quoteAsset}</span>
            </label>

            <input
              value={tradePrice}
              onChange={(event) =>
                setTradePrice(event.target.value)
              }
              disabled={orderType === "Market"}
              inputMode="decimal"
              placeholder={
                orderType === "Market"
                  ? "Market Price"
                  : "0.00"
              }
            />

            <label>
              Amount
              <span>{baseAsset}</span>
            </label>

            <input
              value={tradeAmount}
              onChange={(event) =>
                setTradeAmount(event.target.value)
              }
              inputMode="decimal"
              placeholder="0.00"
            />

            <div className="percent-row">
              {[25, 50, 75, 100].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    const balance = Number(
                      balanceData?.balance || 0
                    );

                    const price =
                      orderType === "Market"
                        ? marketPrice
                        : Number(tradePrice);

                    if (
                      balance > 0 &&
                      Number.isFinite(price) &&
                      price > 0
                    ) {
                      const amount =
                        (balance * value) / 100 / price;

                      setTradeAmount(
                        String(Number(amount.toFixed(8)))
                      );
                    }
                  }}
                >
                  {value}%
                </button>
              ))}
            </div>

            <div className="trade-total-row">
              <span>Total</span>
              <strong>
                {tradeTotal
                  ? `${formatNumber(tradeTotal, 8)} ${quoteAsset}`
                  : `0 ${quoteAsset}`}
              </strong>
            </div>

            <button
              type="button"
              className={
                side === "Buy"
                  ? "submit-buy"
                  : "submit-sell"
              }
              disabled={loading}
              onClick={handleTradeOrder}
            >
              {loading
                ? "Processing..."
                : `${side} ${baseAsset}`}
            </button>

            <div className="trade-balance">
              Available:
              <strong>
                {" "}
                {formatNumber(
                  balanceData?.balance,
                  8
                )}{" "}
                {quoteAsset}
              </strong>
            </div>

            {tradeMessage && (
              <div className="trade-message">
                {tradeMessage}
              </div>
            )}
          </div>
        </div>

        <div className="order-book">
          <div className="panel-title">
            <span>Order Book</span>
            <span>{selectedPair}</span>
          </div>

          <div className="order-book-head">
            <span>Price</span>
            <span>Amount</span>
            <span>Total</span>
          </div>

          <div className="order-book-list">
            {displayedSellOrders.length > 0 ? (
              displayedSellOrders.map((order, index) => (
                <div
                  className="order-book-row sell"
                  key={order.id || `sell-${index}`}
                >
                  <span>
                    {formatNumber(order.price, 2)}
                  </span>
                  <span>
                    {formatNumber(order.amount, 8)}
                  </span>
                  <span>
                    {formatNumber(
                      Number(order.price) *
                        Number(order.amount),
                      8
                    )}
                  </span>
                </div>
              ))
            ) : (
              <div className="order-book-empty">
                No sell orders
              </div>
            )}

            <div className="order-book-mid">
              {Number.isFinite(marketPrice)
                ? formatNumber(marketPrice, 2)
                : "--"}
            </div>

            {displayedBuyOrders.length > 0 ? (
              displayedBuyOrders.map((order, index) => (
                <div
                  className="order-book-row buy"
                  key={order.id || `buy-${index}`}
                >
                  <span>
                    {formatNumber(order.price, 2)}
                  </span>
                  <span>
                    {formatNumber(order.amount, 8)}
                  </span>
                  <span>
                    {formatNumber(
                      Number(order.price) *
                        Number(order.amount),
                      8
                    )}
                  </span>
                </div>
              ))
            ) : (
              <div className="order-book-empty">
                No buy orders
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="trade-orders-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ACCOUNT</span>
            <h2>Orders</h2>
          </div>
        </div>

        <div className="trade-order-columns">
          <div className="data-panel">
            <div className="panel-title">
              Open Orders
            </div>

            {openOrders.length > 0 ? (
              <div className="data-list">
                {openOrders.map((order) => (
                  <div
                    className="data-row"
                    key={order.id}
                  >
                    <div>
                      <strong>
                        {order.side} {order.pair}
                      </strong>
                      <span>
                        {order.type} ·{" "}
                        {formatNumber(order.amount, 8)}
                      </span>
                    </div>

                    <div>
                      <strong>
                        {formatNumber(order.price, 8)}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          cancelOrder(order.id)
                        }
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                No open orders
              </div>
            )}
          </div>

          <div className="data-panel">
            <div className="panel-title">
              Order History
            </div>

            {orderHistory.length > 0 ? (
              <div className="data-list">
                {orderHistory.slice(0, 20).map((order) => (
                  <div
                    className="data-row"
                    key={order.id}
                  >
                    <div>
                      <strong>
                        {order.side} {order.pair}
                      </strong>
                      <span>
                        {order.type} ·{" "}
                        {order.status}
                      </span>
                    </div>

                    <div>
                      <strong>
                        {formatNumber(order.amount, 8)}
                      </strong>
                      <span>
                        {formatNumber(order.price, 8)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                No order history
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="trade-assets-section">
        <div className="panel-title">
          Account Assets
        </div>

        <div className="asset-summary">
          {assetsData.length > 0 ? (
            assetsData.map((asset, index) => (
              <div
                className="asset-summary-item"
                key={
                  asset.asset ||
                  asset.symbol ||
                  index
                }
              >
                <span>
                  {asset.asset ||
                    asset.symbol ||
                    "--"}
                </span>

                <strong>
                  {formatNumber(
                    asset.balance ??
                      asset.amount ??
                      asset.free,
                    8
                  )}
                </strong>
              </div>
            ))
          ) : (
            <span className="empty-state">
              No asset data
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
