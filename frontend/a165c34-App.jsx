import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [active, setActive] = useState("Home");
  const [activeUserId, setActiveUserId] = useState(1);
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [tradeMode, setTradeMode] = useState("Spot");
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [menuOpen, setMenuOpen] = useState(false);
const [expandedMenu, setExpandedMenu] = useState(null);
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

  /* ===== BITLORA FUTURES STATE ===== */
  const [futuresPair, setFuturesPair] = useState("BTC/USDT");
  const [futuresMarketPrice, setFuturesMarketPrice] = useState(66842.10);
  const [futuresChange, setFuturesChange] = useState("+0.00%");
  const [futuresAvailableMargin, setFuturesAvailableMargin] = useState(1000);
  const [futuresInitialMargin, setFuturesInitialMargin] = useState(0);
  const [futuresRiskLevel, setFuturesRiskLevel] = useState("LOW");
  const [futuresMarginMode, setFuturesMarginMode] = useState("Cross");
  const [futuresLeverage, setFuturesLeverage] = useState(10);
  const [futuresPositionMode, setFuturesPositionMode] = useState("One-Way");
  const [futuresSide, setFuturesSide] = useState("Long");
  const [futuresOrderType, setFuturesOrderType] = useState("Limit");
  const [futuresPrice, setFuturesPrice] = useState("");
  const [futuresTriggerPrice, setFuturesTriggerPrice] = useState("");
  const [futuresAmount, setFuturesAmount] = useState("");
  const [futuresAmountUnit, setFuturesAmountUnit] = useState("USDT");
  const [futuresReduceOnly, setFuturesReduceOnly] = useState(false);
  const [futuresPostOnly, setFuturesPostOnly] = useState(false);
  const [futuresTriggerBy, setFuturesTriggerBy] = useState("Mark");
  const [futuresTakeProfit, setFuturesTakeProfit] = useState("");
  const [futuresStopLoss, setFuturesStopLoss] = useState("");
  const [futuresNotional, setFuturesNotional] = useState(0);
  const [futuresLiquidationPrice, setFuturesLiquidationPrice] = useState(0);
  const [futuresMessage, setFuturesMessage] = useState("");
  const [futuresTab, setFuturesTab] = useState("Positions");
  const [futuresPositions, setFuturesPositions] = useState([]);
  const [futuresOrders, setFuturesOrders] = useState([]);
  const [futuresMarginUsage, setFuturesMarginUsage] = useState(0);
  const [futuresSettingsOpen, setFuturesSettingsOpen] = useState(false);

  /* ===== END BITLORA FUTURES STATE ===== */
  /* ===== BITLORA FUTURES HANDLERS ===== */
  const placeFuturesOrder = () => {
    const amount = Number(futuresAmount || 0);
    const price = Number(futuresPrice || futuresTriggerPrice || futuresMarketPrice || 0);

    if (!amount || amount <= 0) {
      setFuturesMessage("Enter a valid order size.");
      return;
    }

    if (!price || price <= 0) {
      setFuturesMessage("Enter a valid price.");
      return;
    }

    const notional = futuresAmountUnit === "Asset" ? amount * price : amount;
    const leverage = Number(futuresLeverage || 1);
    const initialMargin = notional / leverage;

    setFuturesNotional(notional);
    setFuturesInitialMargin(initialMargin);

    const usage = futuresAvailableMargin > 0
      ? Math.min(100, (initialMargin / futuresAvailableMargin) * 100)
      : 0;

    setFuturesMarginUsage(usage);

    const liquidationPrice = futuresSide === "Long"
      ? Math.max(0, futuresMarketPrice * (1 - 0.9 / leverage))
      : futuresMarketPrice * (1 + 0.9 / leverage);

    setFuturesLiquidationPrice(liquidationPrice);

    const newPosition = {
      id: Date.now(),
      pair: futuresPair,
      side: futuresSide,
      leverage: leverage,
      size: amount,
      entry: price,
      mark: futuresMarketPrice,
      liquidationPrice: liquidationPrice,
      pnl: 0,
      roi: 0
    };

    setFuturesPositions((prev) => [...prev, newPosition]);
    setFuturesMessage(
      futuresSide + " order prepared successfully (" + futuresOrderType + ")."
    );
  };

  const closeFuturesPosition = (positionId) => {
    setFuturesPositions((prev) =>
      prev.filter((position) => position.id !== positionId)
    );
    setFuturesMessage("Futures position closed.");
  };

  /* ===== END BITLORA FUTURES HANDLERS ===== */


  /* ===== BITLORA WALLET PRO STATE ===== */
  const [walletActiveTab, setWalletActiveTab] = useState("Overview");
  const [walletSettingsOpen, setWalletSettingsOpen] = useState(false);
  const [walletAction, setWalletAction] = useState("Deposit");
  const [walletAsset, setWalletAsset] = useState("USDT");
  const [walletNetwork, setWalletNetwork] = useState("BEP20");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletMemo, setWalletMemo] = useState("");
  const [walletAmount, setWalletAmount] = useState("");
  const [walletSearch, setWalletSearch] = useState("");
  const [walletMessage, setWalletMessage] = useState("");
  const [walletSecurityOpen, setWalletSecurityOpen] = useState(false);
  const [walletHideSmall, setWalletHideSmall] = useState(false);
  const [walletShowUsd, setWalletShowUsd] = useState(true);
  const [walletConfirmWithdrawal, setWalletConfirmWithdrawal] = useState(true);
  const [walletWhitelistOnly, setWalletWhitelistOnly] = useState(true);
  const [walletNewAddressLock, setWalletNewAddressLock] = useState(true);

  const walletAssets = assetsData.map((item) => {
    const available = Number(item.amount) || 0;
    const frozen = Number(item.locked) || 0;
    const balance = available + frozen;
    const price = balance > 0 && Number.isFinite(Number(item.value))
      ? Number(item.value) / balance
      : (item.symbol === "USDT"
          ? 1
          : (Number(String(
              marketsData.find((m) => m.pair === `${item.symbol}/USDT`)?.price ?? ""
            ).replace(/[$,]/g, "")) || 0));

    return {
      asset: item.symbol,
      name: item.name || item.symbol,
      balance,
      available,
      frozen,
      price,
    };
  });

  const walletTotalUsd = walletAssets.reduce(
    (sum, item) => sum + (item.balance * item.price),
    0
  );

  const walletAvailableUsd = walletAssets.reduce(
    (sum, item) => sum + (item.available * item.price),
    0
  );

  const walletFrozenUsd = walletAssets.reduce(
    (sum, item) => sum + (item.frozen * item.price),
    0
  );

  const walletVisibleAssets = walletAssets.filter((item) => {
    const query = walletSearch.trim().toLowerCase();

    if (walletHideSmall && item.balance * item.price < 1) {
      return false;
    }

    return (
      !query ||
      item.asset.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query)
    );
  });

  const formattedBalance = balanceData
    ? `${(balanceData.totalBalance ?? balanceData.balance ?? 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "Loading...";

  const formattedUsdtBalance = balanceData
    ? `${Number(balanceData.balance ?? 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "Loading...";

  const selectedBaseAsset = selectedPair.split("/")[0];
    const selectedAsset = assetsData.find((asset) => asset.symbol === selectedBaseAsset);
    const formattedTradeBalance = tradeSide === "Sell"
      ? (selectedAsset ? selectedAsset.amount : `0 ${selectedBaseAsset}`)
      : formattedUsdtBalance;


  const walletSubmitAction = () => {
    if (walletAction === "Deposit") {
      setWalletMessage(
        "Deposit address generation will be connected to the wallet backend."
      );
      return;
    }

    if (walletAction === "Withdraw") {
      if (!walletAddress || !walletAmount) {
        setWalletMessage("Enter withdrawal address and amount.");
        return;
      }

      setWalletMessage(
        "Withdrawal request prepared. Security verification will be required."
      );
      return;
    }

    setWalletMessage(
      "Transfer module is ready for backend integration."
    );
  };

  /* ===== END WALLET PRO STATE ===== */

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
          <img className="bitlora-logo" src="/assets/bitlora-logo.png" alt="Bitlora" />
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
            <div className="profile-menu bitlora-account-menu">

              <div className="account-menu-head">
                <div className="account-avatar">B</div>
                <div className="account-menu-user">
                  <strong>Bitlora Account</strong>
                  <span>Account Center</span>
                </div>
                <span className="account-status-dot">●</span>
              </div>

              <div className="account-menu-list">

                <button type="button" className="account-menu-row"
                  onClick={() => setExpandedMenu(expandedMenu === "Profile" ? null : "Profile")}>
                  <span>👤</span><strong>Profile</strong><b>›</b>
                </button>
                {expandedMenu === "Profile" && (
                  <div className="account-submenu">
                    <button type="button">Personal Information</button>
                    <button type="button">Account Details</button>
                    <button type="button">Verification</button>
                  </div>
                )}

                <button type="button" className="account-menu-row"
                  onClick={() => alert("Login / Logout will be connected to Bitlora authentication.")}>
                  <span>🔐</span><strong>Login / Logout</strong><b>›</b>
                </button>

                <button type="button" className="account-menu-row"
                  onClick={() => setExpandedMenu(expandedMenu === "2FA" ? null : "2FA")}>
                  <span>🛡️</span><strong>2FA Security</strong><b>›</b>
                </button>
                {expandedMenu === "2FA" && (
                  <div className="account-submenu">
                    <button type="button">Enable 2FA</button>
                    <button type="button">Authenticator App</button>
                    <button type="button">Security Verification</button>
                  </div>
                )}

                <button type="button" className="account-menu-row"
                  onClick={() => setExpandedMenu(expandedMenu === "Password" ? null : "Password")}>
                  <span>🔑</span><strong>Change Password</strong><b>›</b>
                </button>
                {expandedMenu === "Password" && (
                  <div className="account-submenu">
                    <button type="button">Change Password</button>
                    <button type="button">Forgot Password</button>
                  </div>
                )}

                <button type="button" className="account-menu-row"
                  onClick={() => setExpandedMenu(expandedMenu === "Devices" ? null : "Devices")}>
                  <span>📱</span><strong>Devices & Sessions</strong><b>›</b>
                </button>
                {expandedMenu === "Devices" && (
                  <div className="account-submenu">
                    <button type="button">Active Devices</button>
                    <button type="button">Login Sessions</button>
                    <button type="button">Sign Out All Devices</button>
                  </div>
                )}

                <button type="button" className="account-menu-row"
                  onClick={() => setExpandedMenu(expandedMenu === "Notifications" ? null : "Notifications")}>
                  <span>🔔</span><strong>Notifications</strong><b>›</b>
                </button>
                {expandedMenu === "Notifications" && (
                  <div className="account-submenu">
                    <button type="button">Push Notifications</button>
                    <button type="button">Trading Alerts</button>
                    <button type="button">Security Alerts</button>
                  </div>
                )}

                <button type="button" className="account-menu-row"
                  onClick={() => setExpandedMenu(expandedMenu === "Settings" ? null : "Settings")}>
                  <span>⚙️</span><strong>Settings</strong><b>›</b>
                </button>
                {expandedMenu === "Settings" && (
                  <div className="account-submenu">
                    <button type="button">Appearance</button>
                    <button type="button">Language</button>
                    <button type="button">Currency</button>
                  </div>
                )}

                <button type="button" className="account-menu-row"
                  onClick={() => setExpandedMenu(expandedMenu === "Payment" ? null : "Payment")}>
                  <span>💳</span><strong>Payment / Withdrawal Settings</strong><b>›</b>
                </button>
                {expandedMenu === "Payment" && (
                  <div className="account-submenu">
                    <button type="button">Payment Methods</button>
                    <button type="button">Withdrawal Settings</button>
                    <button type="button">Withdrawal Address</button>
                    <button type="button">Address Whitelist</button>
                  </div>
                )}

                <button type="button" className="account-menu-row"
                  onClick={() => setExpandedMenu(expandedMenu === "History" ? null : "History")}>
                  <span>📜</span><strong>Transaction History</strong><b>›</b>
                </button>
                {expandedMenu === "History" && (
                  <div className="account-submenu">
                    <button type="button">Deposit History</button>
                    <button type="button">Withdrawal History</button>
                    <button type="button">Trading History</button>
                  </div>
                )}

                <button type="button" className="account-menu-row"
                  onClick={() => setExpandedMenu(expandedMenu === "Referral" ? null : "Referral")}>
                  <span>🎁</span><strong>Referral</strong><b>›</b>
                </button>
                {expandedMenu === "Referral" && (
                  <div className="account-submenu">
                    <button type="button">Referral Program</button>
                    <button type="button">My Referral Code</button>
                    <button type="button">Referral Rewards</button>
                  </div>
                )}

                <button type="button" className="account-menu-row"
                  onClick={() => setExpandedMenu(expandedMenu === "Help" ? null : "Help")}>
                  <span>🆘</span><strong>Help & Support</strong><b>›</b>
                </button>
                {expandedMenu === "Help" && (
                  <div className="account-submenu">
                    <button type="button">Help Center</button>
                    <button type="button">Contact Support</button>
                    <button type="button">Report a Problem</button>
                  </div>
                )}

                <button type="button" className="account-menu-row"
                  onClick={() => setExpandedMenu(expandedMenu === "Terms" ? null : "Terms")}>
                  <span>📄</span><strong>Terms / Privacy</strong><b>›</b>
                </button>
                {expandedMenu === "Terms" && (
                  <div className="account-submenu">
                    <button type="button">Terms of Service</button>
                    <button type="button">Privacy Policy</button>
                  </div>
                )}

                <button type="button" className="account-menu-row account-logout"
                  onClick={() => alert("Logout will be connected to Bitlora authentication.")}>
                  <span>🚪</span><strong>Logout</strong><b>›</b>
                </button>

              </div>

            </div>
          )}
        </div>
      </header>

      {active === "Home" && (
        <section className="home-pro">
          <section className="home-balance-card">
            <div className="home-balance-top">
              <div>
                <span className="home-eyebrow">TOTAL PORTFOLIO BALANCE</span>
                <h2>{formattedBalance}</h2>
              </div>

              <button
                type="button"
                className="home-balance-menu"
                aria-label="Balance options"
              >
                •••
              </button>
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
                <p>Fast access to your account</p>
              </div>
              <span className="home-section-badge">4 ACTIONS</span>
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

          
    <div className="trade-mode-switch">
  <button
    type="button"
    className={tradeMode === "Spot" ? "active spot-mode" : ""}
    onClick={() => {
      setTradeMode("Spot");
      setActive("Trade");
    }}
  >
    SPOT
  </button>
  <button
    type="button"
    className={tradeMode === "Futures" ? "active futures-mode" : ""}
    onClick={() => {
      setTradeMode("Futures");
      setActive("Futures");
    }}
  >
    FUTURES
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
  <section className="futures-screen">

    <div className="futures-topbar">
      <div className="futures-pair-area">
        <select
          className="futures-pair-select"
          value={futuresPair}
          onChange={(e) => setFuturesPair(e.target.value)}
        >
          {markets.slice(0, 15).map((market) => (
            <option key={market.pair} value={market.pair}>
              {market.pair} Perpetual
            </option>
          ))}
        </select>

        <span className="futures-contract-badge">PERP</span>
        <span className="futures-live-dot">LIVE</span>
      </div>

      <button
        type="button"
        className="futures-settings-button"
        onClick={() => setFuturesSettingsOpen(true)}
      >
        ⚙ Settings
      </button>
    </div>

    <div className="futures-price-card">

      <div className="futures-main-price">
        <span>Mark Price</span>

        <strong>
          {"$" + futuresMarketPrice.toLocaleString(undefined, {
            minimumFractionDigits: futuresMarketPrice < 1 ? 6 : 2,
            maximumFractionDigits: futuresMarketPrice < 1 ? 8 : 2
          })}
        </strong>

        <b className={String(futuresChange).startsWith("-") ? "red" : "green"}>
          {futuresChange}
        </b>
      </div>

      <div className="futures-stat">
        <span>Index Price</span>
        <strong>
          {"$" + futuresMarketPrice.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </strong>
      </div>

      <div className="futures-stat">
        <span>24H High</span>
        <strong>
          {"$" + (futuresMarketPrice * 1.035).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </strong>
      </div>

      <div className="futures-stat">
        <span>24H Low</span>
        <strong>
          {"$" + (futuresMarketPrice * 0.965).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </strong>
      </div>

      <div className="futures-stat">
        <span>Funding Rate</span>
        <strong className="green">+0.0100%</strong>
        <small>Next 08:00</small>
      </div>

    </div>

    <div className="futures-account-grid">

      <div>
        <span>Available Margin</span>
        <strong>{"$" + futuresAvailableMargin.toFixed(2)}</strong>
      </div>

      <div>
        <span>Margin Used</span>
        <strong>{"$" + futuresInitialMargin.toFixed(2)}</strong>
      </div>

      <div>
        <span>Unrealized PnL</span>
        <strong className="green">$0.00</strong>
      </div>

      <div>
        <span>Risk Level</span>
        <strong className={
          futuresRiskLevel === "HIGH"
            ? "red"
            : futuresRiskLevel === "MEDIUM"
            ? "yellow"
            : "green"
        }>
          {futuresRiskLevel}
        </strong>
      </div>

    </div>

    <div className="futures-contract-tabs">
      <button type="button" className="active">USDT-M Perpetual</button>
      <button type="button">USDC-M Perpetual</button>
      <button type="button">COIN-M</button>
    </div>

    <div className="futures-main-grid">

      <div className="futures-chart-card">

        <div className="futures-chart-header">
          <div>
            <strong>{futuresPair} Perpetual</strong>
            <span>Advanced market chart</span>
          </div>

          <div className="futures-timeframes">
            {["1m","5m","15m","1H","4H","1D"].map((tf) => (
              <button
                key={tf}
                type="button"
                className={tradeTimeframe === tf ? "active" : ""}
                onClick={() => setTradeTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="futures-chart">

          <div className="futures-chart-grid">
            {liveCandles.map((candle, index) => (
              <div className="futures-candle" key={index}>
                <span
                  className={candle.up ? "up" : "down"}
                  style={{ height: candle.height + "%" }}
                />
              </div>
            ))}
          </div>

          <div className="futures-chart-labels">
            <span>09:00</span>
            <span>12:00</span>
            <span>15:00</span>
            <span>18:00</span>
          </div>

          <div className="futures-chart-price-line">
            <span>{futuresMarketPrice.toFixed(2)}</span>
          </div>

        </div>

        <div className="futures-chart-footer">
          <span>MA</span>
          <span>EMA</span>
          <span>VOL</span>
          <span>RSI</span>
          <span>MACD</span>
          <span>DEPTH</span>
        </div>

      </div>

      <div className="futures-order-card">

        <div className="futures-order-controls">

          <label>
            Margin
            <select
              value={futuresMarginMode}
              onChange={(e) => setFuturesMarginMode(e.target.value)}
            >
              <option>Cross</option>
              <option>Isolated</option>
              <option>Portfolio</option>
            </select>
          </label>

          <label>
            Leverage
            <select
              value={futuresLeverage}
              onChange={(e) => setFuturesLeverage(Number(e.target.value))}
            >
              {[1,2,3,5,10,20,25,50,75,100].map((x) => (
                <option key={x} value={x}>{x}x</option>
              ))}
            </select>
          </label>

          <label>
            Position
            <select
              value={futuresPositionMode}
              onChange={(e) => setFuturesPositionMode(e.target.value)}
            >
              <option>One-Way</option>
              <option>Hedge</option>
            </select>
          </label>

        </div>

        <div className="futures-side-tabs">

          <button
            type="button"
            className={futuresSide === "Long" ? "active-long" : ""}
            onClick={() => setFuturesSide("Long")}
          >
            LONG
          </button>

          <button
            type="button"
            className={futuresSide === "Short" ? "active-short" : ""}
            onClick={() => setFuturesSide("Short")}
          >
            SHORT
          </button>

        </div>

        <div className="futures-order-types">
          {["Market","Limit","Stop Market","Stop Limit"].map((type) => (
            <button
              key={type}
              type="button"
              className={futuresOrderType === type ? "active" : ""}
              onClick={() => setFuturesOrderType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        {(futuresOrderType === "Limit" ||
          futuresOrderType === "Stop Limit") && (
          <label className="futures-field">
            <span>Price</span>

            <input
              type="number"
              inputMode="decimal"
              placeholder={futuresMarketPrice.toFixed(2)}
              value={futuresPrice}
              onChange={(e) => setFuturesPrice(e.target.value)}
            />

            <b>USDT</b>
          </label>
        )}

        {(futuresOrderType === "Stop Market" ||
          futuresOrderType === "Stop Limit") && (
          <label className="futures-field">
            <span>Trigger Price</span>

            <input
              type="number"
              inputMode="decimal"
              placeholder={futuresMarketPrice.toFixed(2)}
              value={futuresTriggerPrice}
              onChange={(e) => setFuturesTriggerPrice(e.target.value)}
            />

            <b>USDT</b>
          </label>
        )}

        <label className="futures-field">
          <span>Size</span>

          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={futuresAmount}
            onChange={(e) => setFuturesAmount(e.target.value)}
          />

          <select
            value={futuresAmountUnit}
            onChange={(e) => setFuturesAmountUnit(e.target.value)}
          >
            <option>USDT</option>
            <option>Asset</option>
            <option>Margin</option>
          </select>
        </label>

        <div className="futures-size-presets">
          {[25,50,75,100].map((pct) => (
            <button
              type="button"
              key={pct}
              onClick={() => {
                const value =
                  (
                    futuresAvailableMargin *
                    pct *
                    Number(futuresLeverage || 1)
                  ) /
                  100 /
                  Math.max(futuresMarketPrice, 1);

                setFuturesAmount(value.toFixed(6));
              }}
            >
              {pct}%
            </button>
          ))}
        </div>

        <div className="futures-advanced-row">

          <label>
            <input
              type="checkbox"
              checked={futuresReduceOnly}
              onChange={(e) => setFuturesReduceOnly(e.target.checked)}
            />
            Reduce Only
          </label>

          <label>
            <input
              type="checkbox"
              checked={futuresPostOnly}
              onChange={(e) => setFuturesPostOnly(e.target.checked)}
            />
            Post Only
          </label>

        </div>

        <div className="futures-trigger-row">
          <span>Trigger By</span>

          {["Mark Price","Last Price","Index Price"].map((item) => (
            <button
              key={item}
              type="button"
              className={futuresTriggerBy === item ? "active" : ""}
              onClick={() => setFuturesTriggerBy(item)}
            >
              {item.replace(" Price", "")}
            </button>
          ))}
        </div>

        <div className="futures-tpsl-grid">

          <label>
            <span>Take Profit</span>

            <input
              type="number"
              inputMode="decimal"
              placeholder="Optional"
              value={futuresTakeProfit}
              onChange={(e) => setFuturesTakeProfit(e.target.value)}
            />
          </label>

          <label>
            <span>Stop Loss</span>

            <input
              type="number"
              inputMode="decimal"
              placeholder="Optional"
              value={futuresStopLoss}
              onChange={(e) => setFuturesStopLoss(e.target.value)}
            />
          </label>

        </div>

        <div className="futures-order-summary">

          <div>
            <span>Notional</span>
            <strong>{"$" + futuresNotional.toFixed(2)}</strong>
          </div>

          <div>
            <span>Initial Margin</span>
            <strong>{"$" + futuresInitialMargin.toFixed(2)}</strong>
          </div>

          <div>
            <span>Est. Liq. Price</span>
            <strong>
              {futuresLiquidationPrice > 0
                ? "$" + futuresLiquidationPrice.toFixed(2)
                : "--"}
            </strong>
          </div>

        </div>

        <button
          type="button"
          className={
            "futures-submit-button " +
            (futuresSide === "Long" ? "long-action" : "short-action")
          }
          onClick={placeFuturesOrder}
        >
          {futuresSide === "Long" ? "OPEN LONG" : "OPEN SHORT"}
          <small>
            {futuresOrderType} • {futuresLeverage}x
          </small>
        </button>

        {futuresMessage && (
          <div className="futures-message">
            {futuresMessage}
          </div>
        )}

        <div className="futures-order-note">
          ⚠ Demo execution mode — live execution will be connected to
          Bitlora's backend order/risk engine later.
        </div>

      </div>

    </div>

    <div className="futures-data-card">

      <div className="futures-data-tabs">
        {[
          "Positions",
          "Open Orders",
          "Order History",
          "Trades",
          "Funding",
          "PnL"
        ].map((tab) => (
          <button
            type="button"
            key={tab}
            className={futuresTab === tab ? "active" : ""}
            onClick={() => setFuturesTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {futuresTab === "Positions" && (
        <div className="futures-table-wrap">

          {futuresPositions.length === 0 ? (
            <div className="futures-empty">
              <strong>No open positions</strong>
              <span>Your active futures positions will appear here.</span>
            </div>
          ) : (
            <div className="futures-position-list">

              {futuresPositions.map((position) => (
                <div className="futures-position" key={position.id}>

                  <div>
                    <strong>{position.pair} Perpetual</strong>
                    <span className={position.side === "Long" ? "green" : "red"}>
                      {position.side} • {position.leverage}x
                    </span>
                  </div>

                  <div>
                    <span>Size</span>
                    <strong>{position.size}</strong>
                  </div>

                  <div>
                    <span>Entry</span>
                    <strong>{"$" + position.entryPrice.toFixed(2)}</strong>
                  </div>

                  <div>
                    <span>Mark</span>
                    <strong>{"$" + position.markPrice.toFixed(2)}</strong>
                  </div>

                  <div>
                    <span>Liq. Price</span>
                    <strong>{"$" + position.liquidationPrice.toFixed(2)}</strong>
                  </div>

                  <button
                    type="button"
                    className="futures-close-button"
                    onClick={() => closeFuturesPosition(position.id)}
                  >
                    CLOSE
                  </button>

                </div>
              ))}

            </div>
          )}

        </div>
      )}

      {futuresTab === "Open Orders" && (
        <div className="futures-table-wrap">

          {futuresOrders.length === 0 ? (
            <div className="futures-empty">
              <strong>No open orders</strong>
              <span>Limit and conditional orders will appear here.</span>
            </div>
          ) : (
            <div className="futures-position-list">

              {futuresOrders.map((order) => (
                <div className="futures-position" key={order.id}>

                  <div>
                    <strong>{order.pair}</strong>
                    <span>{order.side} • {order.type}</span>
                  </div>

                  <div>
                    <span>Price</span>
                    <strong>{"$" + Number(order.price).toFixed(2)}</strong>
                  </div>

                  <div>
                    <span>Size</span>
                    <strong>{order.size}</strong>
                  </div>

                  <div>
                    <span>Trigger</span>
                    <strong>
                      {order.triggerPrice
                        ? Number(order.triggerPrice).toFixed(2)
                        : "--"}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong className="yellow">{order.status}</strong>
                  </div>

                </div>
              ))}

            </div>
          )}

        </div>
      )}

      {futuresTab !== "Positions" &&
        futuresTab !== "Open Orders" && (
          <div className="futures-empty">
            <strong>{futuresTab}</strong>
            <span>
              This module is ready for backend data integration.
            </span>
          </div>
        )}

    </div>

    <div className="futures-risk-grid">

      <div className="futures-risk-card">

        <div className="futures-risk-heading">
          <strong>Risk Monitor</strong>
          <span>{futuresRiskLevel}</span>
        </div>

        <div className="futures-risk-meter">
          <span style={{ width: futuresMarginUsage + "%" }} />
        </div>

        <div className="futures-risk-stats">

          <div>
            <span>Margin Ratio</span>
            <strong>{futuresMarginUsage.toFixed(1)}%</strong>
          </div>

          <div>
            <span>Maintenance Margin</span>
            <strong>
              {"$" + (futuresInitialMargin * 0.5).toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Liq. Buffer</span>
            <strong>Protected</strong>
          </div>

        </div>

      </div>

      <div className="futures-protection-card">
        <strong>Risk Protection</strong>
        <span>Price Protection</span>
        <span>Slippage Protection</span>
        <span>Volatility Protection</span>
        <span>Circuit Breaker</span>
      </div>

    </div>

    {futuresSettingsOpen && (
      <div
        className="futures-settings-overlay"
        onClick={() => setFuturesSettingsOpen(false)}
      >

        <div
          className="futures-settings-drawer"
          onClick={(e) => e.stopPropagation()}
        >

          <div className="futures-settings-header">

            <div>
              <strong>Futures Settings</strong>
              <span>Professional trading preferences</span>
            </div>

            <button
              type="button"
              onClick={() => setFuturesSettingsOpen(false)}
            >
              ×
            </button>

          </div>

          <div className="futures-setting-group">

            <strong>Trading</strong>

            <label>
              <input type="checkbox" defaultChecked />
              Confirm orders
            </label>

            <label>
              <input type="checkbox" defaultChecked />
              Confirm close position
            </label>

            <label>
              <input type="checkbox" />
              One-click trading
            </label>

            <label>
              <input type="checkbox" defaultChecked />
              Show PnL
            </label>

          </div>

          <div className="futures-setting-group">

            <strong>Display</strong>

            <label>
              <input type="checkbox" defaultChecked />
              Show liquidation price
            </label>

            <label>
              <input type="checkbox" defaultChecked />
              Show margin ratio
            </label>

            <label>
              <input type="checkbox" defaultChecked />
              Show funding rate
            </label>

            <label>
              <input type="checkbox" />
              Compact mode
            </label>

          </div>

          <div className="futures-setting-group">

            <strong>Risk Controls</strong>

            <label>
              <input type="checkbox" defaultChecked />
              Price protection
            </label>

            <label>
              <input type="checkbox" defaultChecked />
              Slippage protection
            </label>

            <label>
              <input type="checkbox" defaultChecked />
              Volatility protection
            </label>

            <label>
              <input type="checkbox" defaultChecked />
              Circuit breaker
            </label>

          </div>

        </div>

      </div>
    )}

  </section>
)}

{active === "Wallet" && (
  <section className="wallet-pro-screen">

    <div className="wallet-pro-header">

      <div>
        <h3>Wallet</h3>
        <p>Manage assets, deposits, withdrawals and transfers</p>
      </div>



    </div>


    <div className="wallet-pro-balance-hero">

      <div className="wallet-pro-total">

        <span>Total Estimated Balance</span>

        <strong>
          {"$" + walletTotalUsd.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </strong>

        {walletShowUsd && (
          <small>
            ≈ USDT {walletTotalUsd.toFixed(2)}
          </small>
        )}

      </div>

      <div className="wallet-pro-balance-stats">

        <div>
          <span>Available</span>
          <strong>
            {"$" + walletAvailableUsd.toFixed(2)}
          </strong>
        </div>

        <div>
          <span>Frozen</span>
          <strong>
            {"$" + walletFrozenUsd.toFixed(2)}
          </strong>
        </div>

        <div>
          <span>24H PnL</span>
          <strong className="green">+$42.18</strong>
        </div>

      </div>

    </div>


    <div className="wallet-pro-main-grid">


      <div className="wallet-pro-assets-card">

        <div className="wallet-pro-card-header">

          <div>
            <strong>Assets</strong>

          </div>

          <input
            type="search"
            placeholder="Search asset"
            value={walletSearch}
            onChange={(e) => setWalletSearch(e.target.value)}
          />

        </div>


        <div className="wallet-pro-asset-list">

          {walletVisibleAssets.map((item) => (

            <div
              className="wallet-pro-asset-row"
              key={item.asset}
            >

              <div className="wallet-pro-asset-name">

                <div className="wallet-pro-coin-icon">
                  {item.asset.slice(0, 1)}
                </div>

                <div>
                  <strong>{item.asset}</strong>
                  <span>{item.name}</span>
                </div>

              </div>

              <strong>{item.balance}</strong>

              <span>{item.available}</span>

              <span>{item.frozen}</span>

              <strong>
                {"$" + (item.balance * item.price).toFixed(2)}
              </strong>

            </div>

          ))}

        </div>

      </div>


      <div className="wallet-pro-action-card">

        <div className="wallet-pro-action-tabs">

          {["Deposit","Withdraw","Transfer"].map((action) => (

            <button
              type="button"
              key={action}
              className={walletAction === action ? "active" : ""}
              onClick={() => {
                              setWalletAction(walletAction === action ? "" : action);
                              setWalletMessage("");
                            }}
            >
              {action}
            </button>

          ))}

        </div>


        {walletAction && (
<div className="wallet-pro-form">

          <label>
            <span>Asset</span>

            <select
              value={walletAsset}
              onChange={(e) => setWalletAsset(e.target.value)}
            >
              <option>USDT</option>
              <option>BTC</option>
              <option>ETH</option>
              <option>BNB</option>
            </select>
          </label>


          {walletAction === "Deposit" && (

            <>
              <label>
                <span>Network</span>

                <select
                  value={walletNetwork}
                  onChange={(e) => setWalletNetwork(e.target.value)}
                >
                  <option>BEP20</option>
                  <option>ERC20</option>
                  <option>TRC20</option>
                  <option>Solana</option>
                  <option>Bitcoin</option>
                  <option>Arbitrum</option>
                  <option>Polygon</option>
                </select>
              </label>

              <div className="wallet-pro-address-box">

                <span>Deposit Address</span>

                <strong>
                  Generate deposit address
                </strong>

                <small>
                  QR Code • Minimum deposit • Confirmations
                </small>

              </div>
            </>

          )}


          {walletAction === "Withdraw" && (

            <>
              <label>
                <span>Network</span>

                <select
                  value={walletNetwork}
                  onChange={(e) => setWalletNetwork(e.target.value)}
                >
                  <option>BEP20</option>
                  <option>ERC20</option>
                  <option>TRC20</option>
                  <option>Solana</option>
                  <option>Arbitrum</option>
                  <option>Polygon</option>
                </select>
              </label>

              <label>
                <span>Withdrawal Address</span>

                <input
                  type="text"
                  placeholder="Paste wallet address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
              </label>

              <label>
                <span>Memo / Tag</span>

                <input
                  type="text"
                  placeholder="Optional"
                  value={walletMemo}
                  onChange={(e) => setWalletMemo(e.target.value)}
                />
              </label>

              <label>
                <span>Amount</span>

                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                />
              </label>

              <div className="wallet-pro-fee-box">

                <div>
                  <span>Network Fee</span>
                  <strong>Calculated automatically</strong>
                </div>

                <div>
                  <span>Daily Limit</span>
                  <strong>Security policy</strong>
                </div>

              </div>
            </>

          )}


          {walletAction === "Transfer" && (

            <>
              <label>
                <span>From</span>

                <select>
                  <option>Spot Wallet</option>
                  <option>Funding Wallet</option>
                  <option>Futures Wallet</option>
                </select>
              </label>

              <label>
                <span>To</span>

                <select>
                  <option>Futures Wallet</option>
                  <option>Spot Wallet</option>
                  <option>Funding Wallet</option>
                </select>
              </label>

              <label>
                <span>Amount</span>

                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                />
              </label>
            </>

          )}


          <button
            type="button"
            className="wallet-pro-primary-action"
            onClick={walletSubmitAction}
          >
            {walletAction === "Deposit"
              ? "GENERATE DEPOSIT"
              : walletAction === "Withdraw"
              ? "REVIEW WITHDRAWAL"
              : "TRANSFER FUNDS"}
          </button>


          {walletMessage && (
            <div className="wallet-pro-message">
              {walletMessage}
            </div>
          )}

        </div>
        )}

      </div>

    </div>


    <div className="wallet-pro-security-strip">

      <div>
        <span>Withdrawal Security</span>
        <strong>Protected</strong>
      </div>

      <div>
        <span>Address Whitelist</span>
        <strong className="green">
          {walletWhitelistOnly ? "Enabled" : "Disabled"}
        </strong>
      </div>

      <div>
        <span>2FA</span>
        <strong className="green">Required</strong>
      </div>

      <div>
        <span>New Address Lock</span>
        <strong>
          {walletNewAddressLock ? "Enabled" : "Disabled"}
        </strong>
      </div>

    </div>


    <div className="wallet-pro-history-card">

      <div className="wallet-pro-card-header">

        <div>
          <strong>Wallet History</strong>
          <span>Deposits, withdrawals, transfers and fees</span>
        </div>

        <button type="button">
          View All
        </button>

      </div>

      <div className="wallet-pro-history-grid">

        <span>Type</span>
        <span>Asset</span>
        <span>Network</span>
        <span>Amount</span>
        <span>Status</span>

        <strong>Deposit</strong>
        <span>USDT</span>
        <span>BEP20</span>
        <span>+500.00</span>
        <b className="green">Completed</b>

        <strong>Transfer</strong>
        <span>USDT</span>
        <span>Internal</span>
        <span>−100.00</span>
        <b className="green">Completed</b>

      </div>

    </div>


        <div className="wallet-pro-security-card">
      <div>
        <strong>Wallet Security</strong>
        <span>Protect your assets and withdrawals</span>
      </div>

      <button
        type="button"
        className="wallet-inline-settings-toggle"
        onClick={() => setWalletSettingsOpen(!walletSettingsOpen)}
      >
        ⚙ Wallet Settings
      </button>
    </div>

    {walletSettingsOpen && (
      <div className="wallet-inline-settings">
        <div className="wallet-inline-settings-header">
          <div>
            <strong>Wallet Settings</strong>
            <span>Security, display and withdrawal preferences</span>
          </div>

          <button
            type="button"
            onClick={() => setWalletSettingsOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="wallet-pro-setting-group">
          <strong>Security</strong>

          <label>
            <input
              type="checkbox"
              checked={walletConfirmWithdrawal}
              onChange={(e) => setWalletConfirmWithdrawal(e.target.checked)}
            />
            Confirm withdrawals
          </label>

          <label>
            <input
              type="checkbox"
              checked={walletWhitelistOnly}
              onChange={(e) => setWalletWhitelistOnly(e.target.checked)}
            />
            Withdrawal whitelist only
          </label>

          <label>
            <input
              type="checkbox"
              checked={walletNewAddressLock}
              onChange={(e) => setWalletNewAddressLock(e.target.checked)}
            />
            New-address protection
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            Require 2FA for withdrawal
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            Email confirmation
          </label>
        </div>

        <div className="wallet-pro-setting-group">
          <strong>Display</strong>

          <label>
            <input
              type="checkbox"
              checked={walletShowUsd}
              onChange={(e) => setWalletShowUsd(e.target.checked)}
            />
            Show USD estimated value
          </label>

          <label>
            <input
              type="checkbox"
              checked={walletHideSmall}
              onChange={(e) => setWalletHideSmall(e.target.checked)}
            />
            Hide small balances
          </label>
        </div>

        <div className="wallet-pro-setting-group">
          <strong>Withdrawal Protection</strong>

          <label>
            <input type="checkbox" defaultChecked />
            Daily withdrawal limit
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            Address risk screening
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            Network validation
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            Suspicious withdrawal protection
          </label>
        </div>

        <div className="wallet-pro-setting-group">
          <strong>Notifications</strong>

          <label>
            <input type="checkbox" defaultChecked />
            Deposit notifications
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            Withdrawal notifications
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            Transfer notifications
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            Security alerts
          </label>
        </div>
      </div>
    )}

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
