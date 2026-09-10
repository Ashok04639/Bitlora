import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [active, setActive] = useState("Home");
  const [activeUserId, setActiveUserId] = useState(1);
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [menuOpen, setMenuOpen] = useState(false);
  const [buyMenuOpen, setBuyMenuOpen] = useState(false);
  const [cardComingSoon, setCardComingSoon] = useState(false);
  const [balanceData, setBalanceData] = useState(null);
  const [assetsData, setAssetsData] = useState([]);
  const [marketsData, setMarketsData] = useState([]);
  const [demoPrices, setDemoPrices] = useState({});
  const [transactionsData, setTransactionsData] = useState([]);
  const [tradesData, setTradesData] = useState([]);
  const [marketTab, setMarketTab] = useState("Favorites");
  const [favoritePairs, setFavoritePairs] = useState(() => {
    try {
      const saved = localStorage.getItem("bitlora_favorite_pairs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "bitlora_favorite_pairs",
        JSON.stringify(favoritePairs)
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [favoritePairs]);
  const [marketSearch, setMarketSearch] = useState("");
  const [tradeSide, setTradeSide] = useState("Buy");
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradePrice, setTradePrice] = useState("");
  const [tradeTotal, setTradeTotal] = useState("");
  const [orderType, setOrderType] = useState("Limit");
const [priceStep, setPriceStep] = useState("0.01");
const [orderBookSide, setOrderBookSide] = useState("All");
  const [orderBookData, setOrderBookData] = useState([]);
  const [orderBookMenuOpen, setOrderBookMenuOpen] = useState(false);
  const [priceStepMenuOpen, setPriceStepMenuOpen] = useState(false);
  const [liveCandles,setLiveCandles]=useState(()=>Array.from({length:15},(_,i)=>({up:i%3!==1,height:35+Math.floor(Math.random()*55)})));
  const [tradeTimeframe, setTradeTimeframe] = useState("1m");
  const [chartType, setChartType] = useState("Candles");
  useEffect(() => { setTradePrice(Number(getDemoPrice(selectedPair)).toFixed(8)); setTradeAmount(""); setTradeTotal(""); setTradeMessage(""); }, [selectedPair]);
  const [tradeMessage, setTradeMessage] = useState("");
  const [openOrders, setOpenOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [ordersTab, setOrdersTab] = useState("Open Orders");
  const [orderHistoryFilter, setOrderHistoryFilter] = useState("All");
  useEffect(()=>{const intervals={"1m":1200,"5m":2000,"15m":2800,"1H":3600,"4H":4500,"1D":5500};const t=setInterval(()=>setLiveCandles(c=>[...c.slice(1),{up:Math.random()>0.45,height:25+Math.floor(Math.random()*65)}]),intervals[tradeTimeframe]||1200);return()=>clearInterval(t)},[tradeTimeframe]);
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoPrices((current) => {
        const next = { ...current };

        markets.forEach((market) => {
          const base = Number(String(market.price).replace(/[$,]/g, ""));
          const previous = Number(next[market.pair] ?? base);

          if (Number.isFinite(previous) && previous > 0) {
            next[market.pair] =
              previous * (1 + (Math.random() - 0.5) * 0.0006);
          }
        });

        return next;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);


  const handleTradeOrder = async () => {
    const amount = Number(tradeAmount);
    const market = marketsData.find((item) => item.pair === selectedPair);
    const marketPrice = Number(market?.price?.replace(/[$,]/g, ""));
    const price = orderType === "Market" ? marketPrice : Number(tradePrice);
    const total = price * amount;

    if (!tradeAmount.trim()) {
      setTradeMessage("Enter an amount to place this order.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setTradeMessage("Enter a valid amount greater than 0.");
      return;
    }

    if (orderType === "Limit" && (!Number.isFinite(price) || price <= 0)) {
      setTradeMessage("Enter a valid price greater than 0.");
      return;
    }

    if (orderType === "Market" && (!Number.isFinite(marketPrice) || marketPrice <= 0)) {
      setTradeMessage("Current market price is unavailable.");
      return;
    }

    if (
      tradeSide === "Buy" &&
      balanceData &&
      orderType === "Limit" &&
      total > Number(balanceData.balance)
    ) {
      setTradeMessage("Insufficient USDT balance for this order.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pair: selectedPair,
          side: tradeSide,
          type: orderType,
          userId: activeUserId,
          price: orderType === "Market" ? 0 : price,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setTradeMessage(data.message || "Unable to place order.");
        return;
      }

      await loadOrders();
      await loadOrderBook();
      await loadBalance();
      await loadAssets();

      if (data.balance) {
        setBalanceData((current) =>
          current ? { ...current, ...data.balance } : data.balance
        );
      }

      if (Array.isArray(data.assets)) {
        setAssetsData(data.assets);
      }

      setTradeMessage(
        `${tradeSide} ${orderType.toLowerCase()} order placed successfully for ${amount} ${selectedPair.split("/")[0]}.`
      );
      setTradeAmount("");
      setTradeTotal("");
    } catch {
      setTradeMessage("Unable to connect to the order service.");
    }
  };

  useEffect(() => {
    const market = marketsData.find((item) => item.pair === selectedPair);
    const price = Number(market?.price?.replace(/[$,]/g, ""));
    const amount = Number(tradeAmount);

    if (Number.isFinite(price) && Number.isFinite(amount) && amount > 0) {
      setTradeTotal((price * amount).toFixed(8));
    } else {
      setTradeTotal("");
    }
  }, [tradeAmount, selectedPair, marketsData]);

  const API_BASE_URL = `http://${window.location.hostname}:3000`;

  const checkApiHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (!response.ok) throw new Error("API health check failed");

        const data = await response.json();

        if (data.success && data.status === "healthy") {
          setApiStatus("API Online");
        } else {
          setApiStatus("API Offline");
        }
      } catch {
        setApiStatus("API Offline");
      }
    };

    const loadBalance = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/balance?userId=${activeUserId}`);
        if (!response.ok) throw new Error("Balance request failed");

        const data = await response.json();

        if (data.success) {
          setBalanceData(data);
        }
      } catch {
        setBalanceData(null);
      }
    };

    const loadMarkets = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/markets`);
        if (!response.ok) throw new Error("Markets API request failed");

        const data = await response.json();

        if (data.success && Array.isArray(data.markets)) {
          console.log("Bitlora markets received:", data.markets.length, data.markets.map((market) => market.pair));
          setMarketsData(data.markets);
        }
      } catch {
        setMarketsData([]);
      }
    };

    const loadTransactions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/transactions`);
        if (!response.ok) {
          throw new Error("Transactions API request failed");
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.transactions)) {
          setTransactionsData(data.transactions);
        }
      } catch {
        setTransactionsData([]);
      }
    };

    const loadTrades = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/trades?userId=${activeUserId}`);
        if (!response.ok) throw new Error("Trades API request failed");
        const data = await response.json();
        if (data.success && Array.isArray(data.trades)) {
          setTradesData(data.trades);
        } else {
          setTradesData([]);
        }
      } catch {
        setTradesData([]);
      }
    };

    const loadAssets = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/assets?userId=${activeUserId}`);
        if (!response.ok) throw new Error("Assets API request failed");

        const data = await response.json();

        if (data.success && Array.isArray(data.assets)) {
          setAssetsData(data.assets);
        }
      } catch {
        setAssetsData([]);
      }
    };

  const getOrderDepthPercent = (order) => {
    const values = orderBookData.map((item) => Number(item.price) * Number(item.amount)).filter((value) => Number.isFinite(value) && value > 0);
    const maxValue = Math.max(...values, 1);
    const value = Number(order.price) * Number(order.amount);
    return Math.min(100, Math.max(4, (value / maxValue) * 100));
  };
    const loadOrderBook = async () => {
    try {
      const url = API_BASE_URL + "/api/orderbook?pair=" + encodeURIComponent(selectedPair);
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) setOrderBookData(data.orders || []);
    } catch (error) {
      console.error("Failed to load order book:", error);
    }
  };

  useEffect(() => {
    loadOrderBook();
  }, [selectedPair]);

  const loadOrders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders?userId=${activeUserId}`);
        if (!response.ok) throw new Error("Orders API request failed");

        const data = await response.json();

        if (data.success && Array.isArray(data.orders)) {
          setOpenOrders(data.orders.filter((order) => order.status === "Open"));
          setOrderHistory(data.orders.filter((order) => order.status !== "Open"));
        }
      } catch {
        setOpenOrders([]);
        setOrderHistory([]);
      }
    };

  useEffect(() => {
    loadOrders();
    loadTrades();
    loadAssets();
    loadTransactions();
    loadMarkets();
    checkApiHealth();
    loadBalance();
  }, [activeUserId]);

  useEffect(() => {
    loadOrderBook();
  }, [selectedPair]);

  const assets = [
    {
      icon: "₿",
      name: "Bitcoin",
      symbol: "BTC",
      amount: "0.0024 BTC",
      value: "$158.42",
    },
    {
      icon: "Ξ",
      name: "Ethereum",
      symbol: "ETH",
      amount: "0.041 ETH",
      value: "$132.18",
    },
    {
      icon: "◆",
      name: "BNB",
      symbol: "BNB",
      amount: "0.18 BNB",
      value: "$116.70",
    },
  ];

  const markets = [
    { pair: "BTC/USDT", price: "$66,842.10", change: "+2.41%" },
    { pair: "ETH/USDT", price: "$3,224.50", change: "+1.82%" },
    { pair: "BNB/USDT", price: "$648.30", change: "-0.74%" },
    { pair: "SOL/USDT", price: "$182.45", change: "+3.16%" },
    { pair: "DOGE/USDT", price: "$0.1742", change: "+2.87%" },
    { pair: "SHIB/USDT", price: "$0.00001284", change: "+1.94%" },
    { pair: "ADA/USDT", price: "$0.8215", change: "+1.27%" },
    { pair: "XRP/USDT", price: "$2.74", change: "+2.08%" },
    { pair: "TRX/USDT", price: "$0.3438", change: "+0.92%" },
    { pair: "AVAX/USDT", price: "$28.64", change: "-1.12%" },
    { pair: "LINK/USDT", price: "$18.42", change: "+2.35%" },
    { pair: "DOT/USDT", price: "$4.76", change: "+1.08%" },
    { pair: "ICP/USDT", price: "$5.91", change: "+1.76%" },
    { pair: "LTC/USDT", price: "$68.25", change: "+0.64%" },
    { pair: "TON/USDT", price: "$3.18", change: "-0.58%" },

    { pair: "BTC/USDC", price: "$66,842.10", change: "+2.41%" },
    { pair: "ETH/USDC", price: "$3,224.50", change: "+1.82%" },
    { pair: "BNB/USDC", price: "$648.30", change: "-0.74%" },
    { pair: "SOL/USDC", price: "$182.45", change: "+3.16%" },

    { pair: "ETH/BTC", price: "$0.04823", change: "+1.12%" },
    { pair: "BNB/BTC", price: "$0.00969", change: "-0.31%" },
    { pair: "SOL/BTC", price: "$0.00273", change: "+1.46%" },

    { pair: "BTC/ETH", price: "$20.72", change: "+0.84%" },
    { pair: "BNB/ETH", price: "$0.2012", change: "-0.52%" },
    { pair: "SOL/ETH", price: "$0.05655", change: "+1.03%" },
  ];

    const formattedBalance = balanceData
      ? `$${(balanceData.totalBalance ?? balanceData.balance).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "Loading...";
    const formattedUsdtBalance = balanceData
      ? `$${balanceData.balance.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "Loading...";
    const selectedBaseAsset = selectedPair.split("/")[0];
    const selectedAsset = assetsData.find((asset) => asset.symbol === selectedBaseAsset);
    const formattedTradeBalance = tradeSide === "Sell"
      ? (selectedAsset ? selectedAsset.amount : `0 ${selectedBaseAsset}`)
      : formattedUsdtBalance;


  const formattedBtcEquivalent = balanceData
    ? `≈ ${balanceData.btcEquivalent} BTC`
    : "Loading...";

  const formattedChange = balanceData
    ? `${balanceData.change24h >= 0 ? "+" : ""}${balanceData.change24h}% today`
    : "Loading...";

  const getDemoPrice = (pair) => {
    const fallback = Number(String(
      marketsData.find((market) => market.pair === pair)?.price ||
      markets.find((market) => market.pair === pair)?.price ||
      "66842.10"
    ).replace(/[$,]/g, ""));

    return demoPrices[pair] ?? fallback;
  };

  const orderBookMarketPrice = getDemoPrice(selectedPair);
  const orderBookDecimals = Math.max(2, ((marketsData.find((market) => market.pair === selectedPair)?.price || markets.find((market) => market.pair === selectedPair)?.price || "$66842.10").split(".")[1] || "").length);
  const orderBookPrice = (multiplier) => { const stepDecimals = Math.max(0, (String(priceStep).split(".")[1] || "").length); const decimals = Math.max(2, stepDecimals); return orderBookMarketPrice ? (orderBookMarketPrice * multiplier).toFixed(decimals) : "66842.10"; };
    const marketSource = markets.map((fallbackMarket) => {
    const liveMarket = marketsData.find(
      (apiMarket) => apiMarket.pair === fallbackMarket.pair
    );

    return liveMarket
      ? { ...fallbackMarket, ...liveMarket }
      : fallbackMarket;
  });

  marketsData.forEach((liveMarket) => {
    if (!marketSource.some((market) => market.pair === liveMarket.pair)) {
      marketSource.push(liveMarket);
    }
  });

  const displayMarkets = marketSource
    .filter((market) => {
      if (marketTab === "Favorites") {
        return favoritePairs.includes(market.pair);
      }

      return market.pair.endsWith(`/${marketTab}`);
    })
    .filter((market) => {
      const query = marketSearch.trim().toLowerCase();

      if (!query) return true;

      return market.pair.toLowerCase().includes(query);
    });

  const displayTransactions =
    transactionsData.length > 0
      ? transactionsData
      : [
          {
            type: "Deposit",
            asset: "Bitcoin",
            amount: "+$500.00",
            direction: "in",
          },
          {
            type: "Trade",
            asset: "BTC/USDT",
            amount: "-$120.00",
            direction: "out",
          },
        ];

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <img className="bitlora-logo" src="/bitlora-logo.svg" alt="Bitlora" />
        </div>

        <div className="header-right">
          <span className="api-status">{apiStatus}</span>

          <button className="notification" type="button">
            🔔
          </button>

          <button
            className="menu-button"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          {menuOpen && (
            <div className="profile-menu">
              <button
                type="button"
                onClick={() => {
                  setActive("Profile");
                  setMenuOpen(false);
                }}
              >
                Profile
              </button>
            </div>
          )}
        </div>
      </header>

      {active === "Home" && (
        <section className="home-pro">
          <section className="home-balance-card">
            <div className="home-balance-top">
              <div>
                <span className="home-eyebrow">Portfolio Balance</span>
                <h2>{formattedBalance}</h2>
              </div>
              <button type="button" className="home-balance-menu">•••</button>
            </div>

            <div className="home-balance-meta">
              <span>{formattedBtcEquivalent}</span>
              <strong>{formattedChange}</strong>
            </div>

            <div className="home-balance-footer">
              <span>Estimated portfolio value</span>
              <span>24H performance</span>
            </div>
          </section>

          <section className="home-quick-actions">
            <div className="home-section-heading">
              <div>
                <h3>Quick Actions</h3>
                <p>Manage your account instantly</p>
              </div>
            </div>

            <div className="home-action-grid">
              <button type="button" onClick={() => setActive("Wallet")}>
                <span className="home-action-icon deposit">↓</span>
                <strong>Deposit</strong>
                <small>Add funds</small>
              </button>

              <button type="button" onClick={() => setActive("Wallet")}>
                <span className="home-action-icon withdraw">↑</span>
                <strong>Withdraw</strong>
                <small>Send funds</small>
              </button>

              <button type="button" onClick={() => setActive("Trade")}>
                <span className="home-action-icon trade">⇄</span>
                <strong>Trade</strong>
                <small>Buy & sell</small>
              </button>

              <button type="button" onClick={() => setActive("Markets")}>
                <span className="home-action-icon markets">◈</span>
                <strong>Markets</strong>
                <small>Explore prices</small>
              </button>
            </div>
          </section>

          <section className="home-market-section">
            <div className="home-section-heading">
              <div>
                <h3>Market Overview</h3>
                <p>Live market prices and 24H movement</p>
              </div>
              <button type="button" onClick={() => setActive("Markets")}>View all</button>
            </div>

            <div className="home-market-list">
              {(marketsData.length > 0 ? marketsData : markets).slice(0, 6).map((market) => (
                <button
                  type="button"
                  className="home-market-row"
                  key={market.pair}
                  onClick={() => {
                    setSelectedPair(market.pair);
                    setActive("Trade");
                  }}
                >
                  <div className="home-market-main">
                    <span className="home-coin-icon">◆</span>
                    <div>
                      <strong>{market.pair}</strong>
                      <small>Spot Market</small>
                    </div>
                  </div>

                  <div className="home-market-price">
                    <strong>
                      {"$" + getDemoPrice(market.pair).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: getDemoPrice(market.pair) < 1 ? 8 : 2
                      })}
                    </strong>
                    <span className={market.change.startsWith("+") ? "green" : "red"}>
                      {market.change}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="home-discover-grid">
            <button type="button" className="home-feature-card" onClick={() => setActive("Trade")}>
              <div className="home-feature-icon">↗</div>
              <div>
                <strong>Start Trading</strong>
                <span>Access spot markets and place orders</span>
              </div>
              <b>›</b>
            </button>

            <button type="button" className="home-feature-card" onClick={() => setActive("Wallet")}>
              <div className="home-feature-icon">▣</div>
              <div>
                <strong>Manage Wallet</strong>
                <span>View assets, deposits and withdrawals</span>
              </div>
              <b>›</b>
            </button>
          </section>

          <section className="home-insights-grid">
      <div className="home-insight-card">
        <div className="home-insight-heading"><strong>Top Movers</strong><span>24H</span></div>
        <div className="home-mover-row"><span>BTC/USDT</span><b className="green">+2.84%</b></div>
        <div className="home-mover-row"><span>ETH/USDT</span><b className="green">+1.72%</b></div>
        <div className="home-mover-row"><span>SOL/USDT</span><b className="red">-0.64%</b></div>
      </div>

      <div className="home-insight-card">
        <div className="home-insight-heading"><strong>Recent Activity</strong><button type="button" onClick={() => setActive("Wallet")}>View all</button></div>
        <div className="home-activity-row"><span>Wallet activity</span><small>No recent activity</small></div>
        <div className="home-activity-row"><span>Trading activity</span><small>No recent trades</small></div>
        <div className="home-activity-row"><span>Account activity</span><small>Account ready</small></div>
      </div>
    </section>

    <section className="home-announce-card">
      <div className="home-announce-icon">!</div>
      <div><strong>Bitlora Updates</strong><span>New trading markets and wallet features will appear here.</span></div>
      <button type="button">›</button>
    </section>

    <section className="home-security-card">
      <div className="home-security-main"><span className="home-security-icon">✓</span><div><strong>Account Security</strong><small>Your account is protected</small></div></div>
      <button type="button" onClick={() => setActive("Security")}>Review</button>
    </section>

    <section className="home-status-card">
            <div className="home-status-dot"></div>
            <div>
              <strong>Bitlora Exchange</strong>
              <span>Trading systems are ready</span>
            </div>
            <small>Online</small>
          </section>
        </section>
      )}

      {active === "Markets" && (
        <section className="markets-screen">
          <div className="section-header markets-title">
            <div>
              <h3>Markets</h3>
              <p>Live crypto prices & market movements</p>
            </div>
          </div>

          <div className="market-overview">
            <div className="market-overview-head">
              <div>
                <span>MARKET OVERVIEW</span>
                <strong>Live Market Pulse</strong>
              </div>
              <div className="market-live">
                <i></i>
                LIVE
              </div>
            </div>

            <div className="market-overview-grid">
              <div className="market-stat">
                <span>Markets</span>
                <strong>{(marketsData.length || markets.length)}</strong>
                <small>Available pairs</small>
              </div>

              <div className="market-stat">
                <span>Top Gainer</span>
                <strong className="green">
                  {(() => {
                    const source = marketsData.length > 0 ? marketsData : markets;
                    if (!source.length) return "--";
                    return source.reduce((best, item) =>
                      parseFloat(item.change) > parseFloat(best.change) ? item : best
                    ).pair;
                  })()}
                </strong>
                <small>24H performance</small>
              </div>

              <div className="market-stat">
                <span>Market Mode</span>
                <strong>SPOT</strong>
                <small>Trading markets</small>
              </div>
            </div>
          </div>

          <div className="market-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search coin or pair"
              aria-label="Search markets"
              value={marketSearch}
              onChange={(event) => setMarketSearch(event.target.value)}
            />
          </div>

          <div className="market-tabs">
            {["Favorites", "USDT", "USDC", "BTC", "ETH"].map((tab) => (
              <button
                key={tab}
                type="button"
                className={marketTab === tab ? "active" : ""}
                onClick={() => setMarketTab(tab)}
              >
                {tab === "Favorites" ? "★ Favorites" : tab}
              </button>
            ))}
          </div>

          <div className="market-list">
            <div className="market-list-header">
              <span>Trading Pair</span>
              <span>Last Price</span>
              <span>24H Change</span>
            </div>

            {displayMarkets.map((market) => (
              <div
                className="market-row"
                key={market.pair}
                onClick={() => setSelectedPair(market.pair)}
              >
                <div className="market-pair">
                  <button
                    type="button"
                    className={
                      favoritePairs.includes(market.pair)
                        ? "favorite-button active"
                        : "favorite-button"
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      setFavoritePairs((current) =>
                        current.includes(market.pair)
                          ? current.filter((pair) => pair !== market.pair)
                          : [...current, market.pair]
                      );
                    }}
                  >
                    {favoritePairs.includes(market.pair) ? "★" : "☆"}
                  </button>

                  <div className="market-coin">◆</div>

                  <div>
                    <strong>{market.pair}</strong>
                    <span>Spot Market</span>
                  </div>
                </div>

                <div className="market-price">
                  <strong>
                    {"$" +
                      getDemoPrice(market.pair).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8
                      })}
                  </strong>
                  <span>{market.pair.split("/")[1]}</span>
                </div>

                <div
                  className={
                    market.change.startsWith("+")
                      ? "market-change green"
                      : "market-change red"
                  }
                >
                  {market.change}
                </div>
              </div>
            ))}

            {displayMarkets.length === 0 && (
              <div className="market-empty">
                <strong>No markets found</strong>
                <span>Try another coin, pair or market category.</span>
              </div>
            )}
          </div>
        </section>
      )}

      {active === "Trade" && (
        <section className="trade-screen">
          <div className="trade-header">
            <div className="trade-pair-info">
              <strong>{selectedPair}</strong>
              <span>Spot Trading</span>
            </div>

            <button type="button" className="trade-pair-button">
              ▾
            </button>
          </div>

          
    <div className="trade-premium-strip">
      <div className="trade-premium-stat">
        <span>24H HIGH</span>
        <strong>$67,920.00</strong>
      </div>
      <div className="trade-premium-stat">
        <span>24H LOW</span>
        <strong>$65,480.00</strong>
      </div>
      <div className="trade-premium-stat">
        <span>24H VOLUME</span>
        <strong>1.84B USDT</strong>
      </div>
      <div className="trade-premium-stat">
        <span>SPREAD</span>
        <strong>0.02%</strong>
      </div>
    </div>

    <div className="trade-advanced-toolbar">
      <button type="button" className="trade-advanced-button active">Overview</button>
      <button type="button" className="trade-advanced-button">Depth</button>
      <button type="button" className="trade-advanced-button">Recent Trades</button>
      <button type="button" className="trade-advanced-button">Market Info</button>
    </div>

    <div className="trade-pro-hero"><div className="trade-pro-top"><div><div className="trade-pro-pair"><strong>{selectedPair}</strong><span>{favoritePairs.includes(selectedPair)?"★":"☆"}</span></div><small>SPOT • CRYPTO MARKET</small></div><b className="trade-pro-live">● LIVE</b></div><div className="trade-pro-price"><div><small>MARKET PRICE</small><strong>{"$"+getDemoPrice(selectedPair).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:8})}</strong></div><div><small>24H</small><strong className="green">{marketsData.find((market)=>market.pair===selectedPair)?.change||"+2.41%"}</strong></div></div><div className="trade-pro-stats"><span>HIGH <b>$67,920</b></span><span>LOW <b>$65,480</b></span><span>VOL <b>1.84B</b></span></div><div className="trade-pro-nav"><button>CHART</button><button>DEPTH</button><button>TRADES</button><button>INFO</button><button>⚙</button></div></div><div className="trade-price-bar">
            <div>
              <strong>
                {"$" + (demoPrices[selectedPair] ?? Number(String(marketsData.find((market) => market.pair === selectedPair)?.price || markets.find((market) => market.pair === selectedPair)?.price || "$66842.10").replace(/[$,]/g, ""))).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
              </strong>
              <span>Last Price</span>
            </div>

            <div className="trade-change">
              <strong className="green">
                {marketsData.find((market) => market.pair === selectedPair)?.change || "+2.41%"}
              </strong>
              <span>24h Change</span>
            </div>
          </div>

            <div className="trade-timeframes">
              {["1m", "5m", "15m", "1H", "4H", "1D"].map((timeframe) => (
                <button key={timeframe} type="button" className={tradeTimeframe === timeframe ? "active" : ""} onClick={() => setTradeTimeframe(timeframe)}>{timeframe}</button>
              ))}
          </div>

          <div className="trade-chart">
                <div className="chart-toolbar">
                  <div className="chart-toolbar-left">
                    <button type="button" className={`chart-tool ${chartType === "Candles" ? "active" : ""}`} onClick={() => setChartType("Candles")}>Candles</button>
                    <button type="button" className={`chart-tool ${chartType === "Line" ? "active" : ""}`} onClick={() => setChartType("Line")}>Line</button>
                    <button type="button" className={`chart-tool ${chartType === "Indicators" ? "active" : ""}`} onClick={() => setChartType("Indicators")}>Indicators</button>
                  </div>
                  <div className="chart-toolbar-right">
                    <button type="button" className="chart-tool">⌗</button>
                    <button type="button" className="chart-tool">⛶</button>
                  </div>
                </div>
            <div className="chart-grid">
              <span>$67,000</span>
              <span>$66,900</span>
              <span>$66,800</span>
              <span>$66,700</span>
            </div>
              {chartType === "Candles" ? (
                <div className="candles">
                  {liveCandles.map((candle,index)=><i key={index} className={`candle ${candle.up?"up":"down"}`} style={{height:`${candle.height}%`}}></i>)}
                </div>
              ) : (
                <div className="line-chart">
                  {liveCandles.map((candle,index)=><i key={index} style={{height:`${candle.height}%`}}></i>)}
                </div>
              )}
              {chartType === "Indicators" && <div className="chart-indicator"></div>}
            <div className="chart-line"></div>
            <div className="chart-time">
              <span>12:00</span>
              <span>14:00</span>
              <span>16:00</span>
              <span>18:00</span>
            </div>
          </div>

          <div className="trade-user-selector"><label>User</label><select value={activeUserId} onChange={(e) => setActiveUserId(Number(e.target.value))}><option value={1}>User 1</option><option value={2}>User 2</option></select></div>

  <div className="trade-workspace">
          <div className="trade-market-section">
            <div className="trade-section-title">
              <strong>Order Book</strong>
                <span className="order-book-columns">
                  <span>Price</span>
                  <span>Amount</span>
                  <span>Total</span>
                </span>
            </div>

            <div className="order-book">
                {orderBookSide !== "Buy" && <div className="order-book-label sell-label">{orderBookSide === "Sell" ? "Sell" : "Sell Orders"}</div>}
                {orderBookSide !== "Buy" && <div className="sell-orders-visible">
                  {orderBookData.filter((order) => order.side === "Sell").sort((a, b) => Number(a.price) - Number(b.price)).map((order) => (
                    <div className="order-row ask" key={`sell-${order.price}-${order.amount}`} style={{"--depth-width": `${getOrderDepthPercent(order)}%`}} onClick={() => setTradePrice(Number(order.price).toFixed(8))}>
                      <span>{Number(order.price).toFixed(Math.max(2, String(priceStep).split(".")[1]?.length || 0))}</span>
                      <span>{Number(order.amount).toFixed(4)}</span>
                      <span>{(Number(order.price) * Number(order.amount)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>}

                <div className="order-current">
                  <strong>{getDemoPrice(selectedPair).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</strong>
                  <span>Current Market Price</span>
                </div>

                {orderBookSide !== "Sell" && <div className="order-book-label buy-label">{orderBookSide === "Buy" ? "Buy" : "Buy Orders"}</div>}
                {orderBookSide !== "Sell" && <div className="buy-orders-visible">
                  {orderBookData.filter((order) => order.side === "Buy").sort((a, b) => Number(b.price) - Number(a.price)).map((order) => (
                    <div className="order-row bid" key={`buy-${order.price}-${order.amount}`} style={{"--depth-width": `${getOrderDepthPercent(order)}%`}} onClick={() => setTradePrice(Number(order.price).toFixed(8))}>
                      <span>{Number(order.price).toFixed(Math.max(2, String(priceStep).split(".")[1]?.length || 0))}</span>
                      <span>{Number(order.amount).toFixed(4)}</span>
                      <span>{(Number(order.price) * Number(order.amount)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>}
              </div>

              <div className="order-book-controls">
                  <div className="order-book-dropdown">
                    <button type="button" className="order-book-dropdown-button" onClick={() => setOrderBookMenuOpen((open) => !open)}>
                      <span>{orderBookSide}</span><span>▾</span>
                    </button>
                    {orderBookMenuOpen && <div className="order-book-dropdown-menu">
                      {["All", "Buy", "Sell"].map((side) => (
                        <button key={side} type="button" className={orderBookSide === side ? "active" : ""} onClick={() => { setOrderBookSide(side); setOrderBookMenuOpen(false); }}>
                          {side}
                        </button>
                      ))}
                    </div>}
                  </div>
                  <div className="order-book-dropdown">
                    <button type="button" className="order-book-dropdown-button" onClick={() => setPriceStepMenuOpen((open) => !open)}>
                      <span>{priceStep}</span><span>▾</span>
                    </button>
                    {priceStepMenuOpen && <div className="order-book-dropdown-menu">
                      {["0.01", "0.001", "0.0001", "0.00001"].map((step) => (
                        <button key={step} type="button" className={priceStep === step ? "active" : ""} onClick={() => { setPriceStep(step); setPriceStepMenuOpen(false); }}>
                          {step}
                        </button>
                      ))}
                    </div>}
                  </div>
              </div>
          </div>

          <div className="trade-order-section">
            <div className="trade-tabs">
              <button type="button" className={tradeSide === "Buy" ? "active" : ""} onClick={() => { setTradeSide("Buy"); setTradeMessage("Buy mode selected for " + selectedPair.split("/")[0] + "."); }}>Buy</button>
              <button type="button" className={tradeSide === "Sell" ? "active" : ""} onClick={() => { setTradeSide("Sell"); setTradeMessage("Sell mode selected for " + selectedPair.split("/")[0] + "."); }}>Sell</button>
            </div>

            {orderType === "Market" && <div className="market-order-note">Market order uses the current market price.</div>}
            <div className="order-tabs">
              <button type="button" className={orderType === "Limit" ? "active" : ""} onClick={() => setOrderType("Limit")}>Limit</button>
              <button type="button" className={orderType === "Market" ? "active" : ""} onClick={() => setOrderType("Market")}>Market</button>
            </div>

            <div className="order-field">
              <label>Price</label>
              <div>
                <input
                  type="text"
                    value={
                      orderType === "Market"
                        ? Number(marketsData.find((item) => item.pair === selectedPair)?.price?.replace(/[$,]/g, "") || 0).toFixed(8)
                        : tradePrice
                    }
                    onChange={(event) => setTradePrice(event.target.value)}
                    disabled={orderType === "Market"}
                  />
                <span>USDT</span>
              </div>
            </div>

            <div className="order-field">
              <label>Amount</label>
              <div>
                <input type="text" placeholder="0.00" value={tradeAmount} onChange={(event) => setTradeAmount(event.target.value)} />
                <span>{selectedPair.split("/")[0]}</span>
              </div>
            </div>

            <div className="order-field">
              <label>Total</label>
              <div>
                  <input type="text" placeholder="0.00" value={tradeTotal} onChange={(event) => { const value = event.target.value; setTradeTotal(value); const market = marketsData.find((item) => item.pair === selectedPair); const price = orderType === "Market" ? Number(market?.price?.replace(/[$,]/g, "")) : Number(tradePrice); const total = Number(value); if (Number.isFinite(price) && price > 0 && Number.isFinite(total) && total >= 0) { setTradeAmount((total / price).toFixed(8)); } else if (!value) { setTradeAmount(""); } }} />
                <span>{selectedPair.split("/")[1]}</span>
              </div>
            </div>

            <div className="trade-percent-buttons">
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => {
                    const market = marketsData.find((item) => item.pair === selectedPair);
                    const price = orderType === "Market"
                      ? Number(market?.price?.replace(/[$,]/g, ""))
                      : Number(tradePrice);
                    const available = tradeSide === "Sell"
                      ? Number(selectedAsset?.amount)
                      : Number(balanceData?.balance);

                    if (Number.isFinite(price) && price > 0 && Number.isFinite(available) && available >= 0) {
                      const amount = tradeSide === "Buy"
                        ? (available * percent / 100) / price
                        : available * percent / 100;
                      setTradeAmount(amount.toFixed(8));
                    }
                  }}
                >
                  {percent}%
                </button>
              ))}
            </div>

            <div className="trade-balance">
              <span>Available Balance</span>
              <strong>{formattedTradeBalance}</strong>
            </div>

            <button type="button" className={tradeSide === "Buy" ? "buy-button" : "sell-button"} onClick={handleTradeOrder}>
              {tradeSide} {selectedPair.split("/")[0]}
            </button>
          </div>

          </div>
            <div className="trade-orders">
              <button type="button" className={ordersTab === "Open Orders" ? "active" : ""} onClick={() => setOrdersTab("Open Orders")}>Open Orders</button>
              <button type="button" className={ordersTab === "Order History" ? "active" : ""} onClick={() => setOrdersTab("Order History")}>Order History</button>
              <button type="button" className={ordersTab === "Trade History" ? "active" : ""} onClick={() => setOrdersTab("Trade History")}>Trade History</button>
            </div>
          {ordersTab === "Open Orders" && (
            <div className="open-orders-list">
              {openOrders.length === 0 ? (
              <div className="empty-orders">No open orders</div>
            ) : (
              openOrders.map((order) => (
                <div className="open-order-row" key={order.id}>
                  <div>
                    <strong>{order.side}</strong>
                    <span>{order.pair}</span>
                  </div>
                  <div>
                    <span>{order.type}</span>
                    <span>{order.type === "Market" ? "Market" : order.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</span>
                  </div>
                  <div>
                    <span>{order.amount}</span>
                    <span>{order.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })} USDT</span>
                  </div>
                  <div>
                    <span>{order.time}</span>
                    <button type="button" onClick={async () => {
                      try {
                        const response = await fetch(`${API_BASE_URL}/api/orders/${order.id}/cancel`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            userId: activeUserId,
                          }),
                        });

                        const data = await response.json();

                        if (!response.ok || !data.success) {
                          setTradeMessage(data.message || "Unable to cancel order.");
                          return;
                        }

                        setOpenOrders((current) => current.filter((item) => item.id !== order.id));
                        setOrderHistory((current) => [
                          data.order,
                          ...current
                        ]);
                          if (Array.isArray(data.assets)) {
                            setAssetsData(data.assets);
                          }


                        if (data.balance) {
                          setBalanceData((current) => current ? { ...current, ...data.balance } : data.balance);
                        }

                        setTradeMessage("Order cancelled successfully.");
                      } catch {
                        setTradeMessage("Unable to connect to the order service.");
                      }
                    }}>Cancel</button>
                  </div>
                </div>
              ))
            )}
          </div>
          )}

          {ordersTab === "Order History" && (
            <>
              <div className="order-history-filters">
                {["All", "Filled", "Cancelled"].map((filter) => (
                  <button
                    type="button"
                    className={orderHistoryFilter === filter ? "active" : ""}
                    onClick={() => setOrderHistoryFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="open-orders-list">
              {orderHistory.length === 0 ? (
                <div className="empty-orders">No order history</div>
              ) : (
                orderHistory
                  .filter((order) => orderHistoryFilter === "All" || order.status === orderHistoryFilter)
                  .map((order) => (
                  <div className="open-order-row" key={order.id}>
                    <div>
                      <strong>{order.side}</strong>
                      <span>{order.pair}</span>
                    </div>
                    <div>
                      <span>{order.type}</span>
                      <span>{order.type === "Market" ? "Market" : order.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</span>
                    </div>
                    <div>
                      <span>{order.amount}</span>
                      <span>{order.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })} USDT</span>
                    </div>
                    <div>
                      <span>{order.status}</span>
                      <span>{order.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            </>
          )}
        
          {ordersTab === "Trade History" && (
            <div className="open-orders-list">
              {tradesData.length === 0 ? (
                <div className="empty-orders">No trade history</div>
              ) : (
                tradesData.map((trade) => (
                  <div className="open-order-row" key={trade.id}>
                    <div>
                      <strong>{trade.pair}</strong>
                      <span>Trade</span>
                    </div>
                    <div>
                      <span>Price</span>
                      <span>{Number(trade.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</span>
                    </div>
                    <div>
                      <span>Amount</span>
                      <span>{Number(trade.amount).toFixed(8)}</span>
                    </div>
                    <div>
                      <span>Total</span>
                      <span>{Number(trade.total).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })} USDT</span>
                      <span>{trade.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
</section>
      )}

      {active === "Futures" && (
        <section className="section">
          <div className="section-header">
            <div>
              <h3>Futures</h3>
              <p>Trade crypto futures</p>
            </div>
          </div>

          <div className="cards">
            <div className="market">
              <div className="market-left">
                <div className="market-icon">⚡</div>

                <div>
                  <strong>BTC/USDT Perpetual</strong>
                  <span>Futures Market</span>
                </div>
              </div>

              <div className="market-value">
                <strong>$66,842.10</strong>
                <span className="green">+2.41%</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {active === "Wallet" && (
        <section className="wallet-screen">
          <div className="section-header">
            <div>
              <h3>Wallet</h3>
              <p>Manage your crypto assets</p>
            </div>
          </div>

          <div className="wallet-balance">
            <span>Total Wallet Balance</span>
            <strong>{formattedBalance}</strong>
            <small>{formattedBtcEquivalent}</small>
          </div>

          <div className="wallet-actions">
            <button type="button">
              <span>↓</span>
              Deposit
            </button>

            <button type="button">
              <span>↑</span>
              Withdraw
            </button>
          </div>

          <div className="section-header">
            <div>
              <h3>Your Assets</h3>
              <p>Available crypto balances</p>
            </div>
          </div>

          <div className="cards">
            {displayAssets.map((asset) => (
              <div className="asset" key={asset.symbol}>
                <div className="coin">{asset.icon}</div>

                <div className="asset-name">
                  <strong>{asset.name}</strong>
                  <span>{asset.symbol}</span>
                </div>

                <div className="asset-value">
                  <strong>{asset.amount}</strong>
                  <span>{asset.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="section-header">
            <div>
              <h3>Recent Transactions</h3>
              <p>Your latest activity</p>
            </div>
          </div>

          <div className="cards">
            {displayTransactions.map((transaction, index) => (
              <div
                className="transaction"
                key={`${transaction.type}-${index}`}
              >
                <div className="transaction-icon">
                  {transaction.direction === "in" ? "↓" : "⇄"}
                </div>

                <div>
                  <strong>{transaction.type}</strong>
                  <span>{transaction.asset}</span>
                </div>

                <b
                  className={
                    transaction.direction === "in" ? "green" : "red"
                  }
                >
                  {transaction.amount}
                </b>
              </div>
            ))}
          </div>
        </section>
      )}

      {active === "Profile" && (
        <section className="section">
          <div className="section-header">
            <div>
              <h3>Profile</h3>
              <p>Manage your Bitlora account</p>
            </div>
          </div>

          <div className="cards">
            <div className="asset">
              <div className="coin">B</div>

              <div className="asset-name">
                <strong>Bitlora User</strong>
                <span>Account Profile</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <nav className="bottom">
        <button
          type="button"
          className={active === "Home" ? "active" : ""}
          onClick={() => setActive("Home")}
        >
          <span>⌂</span>
          <small>Home</small>
        </button>

        <button
          type="button"
          className={active === "Markets" ? "active" : ""}
          onClick={() => setActive("Markets")}
        >
          <span>◈</span>
          <small>Markets</small>
        </button>

        <button
          type="button"
          className={active === "Trade" ? "active" : ""}
          onClick={() => setActive("Trade")}
        >
          <span>⇄</span>
          <small>Trade</small>
        </button>

        <button
          type="button"
          className={active === "Futures" ? "active" : ""}
          onClick={() => setActive("Futures")}
        >
          <span>⚡</span>
          <small>Futures</small>
        </button>

        <button
          type="button"
          className={active === "Wallet" ? "active" : ""}
          onClick={() => setActive("Wallet")}
        >
          <span>▣</span>
          <small>Wallet</small>
        </button>
      </nav>
    </div>
  );
}

export default App;
