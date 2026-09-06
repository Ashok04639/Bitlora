import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [active, setActive] = useState("Home");
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
  const [marketTab, setMarketTab] = useState("Favorites");
  const [favoritePairs, setFavoritePairs] = useState([]);
  const [tradeSide, setTradeSide] = useState("Buy");
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradeTotal, setTradeTotal] = useState("");
  const [orderType, setOrderType] = useState("Limit");
const [priceStep, setPriceStep] = useState("0.01");
const [orderBookSide, setOrderBookSide] = useState("All");
  const [orderBookMenuOpen, setOrderBookMenuOpen] = useState(false);
  const [priceStepMenuOpen, setPriceStepMenuOpen] = useState(false);
  const [liveCandles,setLiveCandles]=useState(()=>Array.from({length:15},(_,i)=>({up:i%3!==1,height:35+Math.floor(Math.random()*55)})));
  useEffect(() => { setTradeAmount(""); setTradeTotal(""); setTradeMessage(""); }, [selectedPair]);
  const [tradeMessage, setTradeMessage] = useState("");
  useEffect(()=>{const t=setInterval(()=>setLiveCandles(c=>[...c.slice(1),{up:Math.random()>0.45,height:25+Math.floor(Math.random()*65)}]),1200);return()=>clearInterval(t)},[]);
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


  const handleTradeOrder = () => {
    const amount = Number(tradeAmount);

    if (!tradeAmount.trim()) {
      setTradeMessage("Enter an amount to place this order.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setTradeMessage("Enter a valid amount greater than 0.");
      return;
    }
    if (tradeSide === "Buy" && balanceData && Number(tradeTotal) > Number(balanceData.balance)) {
      setTradeMessage("Insufficient USDT balance for this order.");
      return;
    }

    setTradeMessage(`${tradeSide} order ready for ${amount} ${selectedPair.split("/")[0]}.`);
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

  useEffect(() => {
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
        const response = await fetch(`${API_BASE_URL}/api/balance`);
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

    const loadAssets = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/assets`);
        if (!response.ok) throw new Error("Assets API request failed");

        const data = await response.json();

        if (data.success && Array.isArray(data.assets)) {
          setAssetsData(data.assets);
        }
      } catch {
        setAssetsData([]);
      }
    };

    loadAssets();
    loadTransactions();
    loadMarkets();
    checkApiHealth();
    loadBalance();
  }, []);

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
  ];

  const formattedBalance = balanceData
    ? `$${balanceData.balance.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "Loading...";

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
  const displayAssets = assetsData.length > 0 ? assetsData : assets;
  const displayMarkets = (marketsData.length > 0 ? marketsData : markets).filter((market) => {
    if (marketTab === "Favorites") return favoritePairs.includes(market.pair);
    return market.pair.endsWith(`/${marketTab}`);
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
          <div className="logo">B</div>

          <div>
            <h1>Bitlora</h1>
            <p>Crypto Exchange</p>
          </div>
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
        <>
          <section className="balance">
            <div className="balance-title">
              <span>Total Balance</span>
              <button type="button">•••</button>
            </div>

            <h2>{formattedBalance}</h2>

            <div className="balance-info">
              <span>{formattedBtcEquivalent}</span>
              <strong>{formattedChange}</strong>
            </div>
          </section>

          {cardComingSoon ? (
            <section className="coming-soon">
              <div className="coming-soon-icon">💳</div>
              <h2>Coming Soon</h2>
              <p>Card purchases will be available soon.</p>
              <button type="button" onClick={() => setCardComingSoon(false)}>
                Back
              </button>
            </section>
          ) : (
            <>
              <section className="actions">
                <button type="button" onClick={() => setActive("Wallet")}>
                  <span>↓</span>
                  Deposit
                </button>

                <button type="button" onClick={() => setActive("Wallet")}>
                  <span>↑</span>
                  Withdraw
                </button>

                <button type="button">
                  <span>⇄</span>
                  Transfer
                </button>

                <button type="button" onClick={() => setBuyMenuOpen((current) => !current)}>
                  <span>+</span>
                  Buy
                </button>
              </section>

              {buyMenuOpen && (
                <div className="buy-options">
                  <button
                    type="button"
                    onClick={() => {
                      setBuyMenuOpen(false);
                      setCardComingSoon(true);
                    }}
                  >
                    <span>💳</span>
                    Buy with Debit Card
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBuyMenuOpen(false);
                      setCardComingSoon(true);
                    }}
                  >
                    <span>💳</span>
                    Buy with Credit Card
                  </button>
                </div>
              )}
            </>
          )}

          <section className="section">
            <div className="section-header">
              <div>
                <h3>Market Overview</h3>
                <p>Latest crypto prices</p>
              </div>

              <button type="button" onClick={() => setActive("Markets")}>
                View all
              </button>
            </div>

            <div className="cards">
              {(marketsData.length > 0 ? marketsData : markets).slice(0, 9).map((market) => (
                <div
                  className="market"
                  key={market.pair}
                  onClick={() => {
                    setSelectedPair(market.pair);
                    setActive("Trade");
                  }}
                >
                  <div className="market-left">
                    <div className="market-icon">◆</div>

                    <div>
                      <strong>{market.pair}</strong>
                      <span>24h Market</span>
                    </div>
                  </div>

                  <div className="market-value">
                    <strong>{"$" + getDemoPrice(market.pair).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</strong>

                    <span
                      className={
                        market.change.startsWith("+") ? "green" : "red"
                      }
                    >
                      {market.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {active === "Markets" && (
        <section className="markets-screen">
          <div className="section-header">
            <div>
              <h3>Markets</h3>
              <p>Explore crypto markets</p>
            </div>
          </div>

          <div className="market-search">
            <span>⌕</span>
            <input type="text" placeholder="Search markets" aria-label="Search markets" />
          </div>

          <div className="market-tabs">
            {["Favorites", "USDT", "USDC", "BTC", "ETH"].map((tab) => (
              <button
                key={tab}
                type="button"
                className={marketTab === tab ? "active" : ""}
                onClick={() => setMarketTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="market-list">
            <div className="market-list-header">
              <span>Pair</span>
              <span>Last Price</span>
              <span>24h Change</span>
            </div>

            {displayMarkets.map((market) => (
              <div className="market-row" key={market.pair}>
                <div className="market-pair">
                  <button
                    type="button"
                    className={favoritePairs.includes(market.pair) ? "favorite-button active" : "favorite-button"}
                    onClick={() => {
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
                    <span>Spot</span>
                  </div>
                </div>

                <div className="market-price">
                  <strong>{"$" + getDemoPrice(market.pair).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</strong>
                  <span>{market.pair.split("/")[1]}</span>
                </div>

                <div className={market.change.startsWith('+') ? 'market-change green' : 'market-change red'}>
                  {market.change}
                </div>
              </div>
            ))}
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

          <div className="trade-price-bar">
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
            <button type="button" className="active">1m</button>
            <button type="button">5m</button>
            <button type="button">15m</button>
            <button type="button">1H</button>
            <button type="button">4H</button>
            <button type="button">1D</button>
          </div>

          <div className="trade-chart">
            <div className="chart-grid">
              <span>$67,000</span>
              <span>$66,900</span>
              <span>$66,800</span>
              <span>$66,700</span>
            </div>

            <div className="candles">
                {liveCandles.map((candle,index)=><i key={index} className={`candle ${candle.up?"up":"down"}`} style={{height:`${candle.height}%`}}></i>)}
              </div>

            <div className="chart-line"></div>
            <div className="chart-time">
              <span>12:00</span>
              <span>14:00</span>
              <span>16:00</span>
              <span>18:00</span>
            </div>
          </div>

          <div className="trade-workspace">
          <div className="trade-market-section">
            <div className="trade-section-title">
              <strong>Order Book</strong>
                <span>Price&nbsp;&nbsp;&nbsp;&nbsp;Amount&nbsp;&nbsp;&nbsp;&nbsp;Total</span>
            </div>

            <div className="order-book">
                {orderBookSide !== "Buy" && <div className="order-book-label sell-label">{orderBookSide === "Sell" ? "Sell" : "Sell Orders"}</div>}{orderBookSide !== "Buy" && <div className="sell-orders-visible">
                <div className="order-current">
                  <strong>{getDemoPrice(selectedPair).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</strong>
                  <span>Current Market Price</span>
                </div>

              <div className="order-row ask">
                <span>{orderBookPrice(1.0005)}</span>
                <span>0.0042</span>
                <span>280.88</span>
              </div>
              <div className="order-row ask">
                <span>{orderBookPrice(1.0003)}</span>
                <span>0.0081</span>
                <span>541.59</span>
              </div>
              <div className="order-row ask">
                <span>{orderBookPrice(1.0001)}</span>
                <span>0.0124</span>
                <span>829.36</span>
              </div>
                </div>}

                {orderBookSide !== "Sell" && <div className="order-book-label buy-label">{orderBookSide === "Buy" ? "Buy" : "Buy Orders"}</div>}
                {orderBookSide !== "Sell" && <>
                  {orderBookSide === "Buy" && <div className="order-current buy-market-price"><strong>{getDemoPrice(selectedPair).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</strong><span>Current Market Price</span></div>}

              <div className="order-row bid">
                <span>{orderBookPrice(0.9998)}</span>
                <span>0.0095</span>
                <span>634.89</span>
              </div>
              <div className="order-row bid">
                <span>{orderBookPrice(0.9997)}</span>
                <span>0.0068</span>
                <span>454.38</span>
              </div>
              <div className="order-row bid">
                <span>{orderBookPrice(0.9995)}</span>
                <span>0.0142</span>
                <span>948.70</span>
              </div>
                </>}
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
                  value={getDemoPrice(selectedPair).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 }).replace(/[$,]/g, "")}
                  readOnly
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
                <input type="text" placeholder="0.00" value={tradeTotal} readOnly />
                <span>{selectedPair.split("/")[1]}</span>
              </div>
            </div>

            <div className="trade-balance">
              <span>Available Balance</span>
              <strong>{formattedBalance}</strong>
            </div>

            <button type="button" className={tradeSide === "Buy" ? "buy-button" : "sell-button"} onClick={handleTradeOrder}>
              {tradeSide} {selectedPair.split("/")[0]}
            </button>
          </div>

          </div>
          <div className="trade-orders">
            <button type="button" className="active">Open Orders</button>
            <button type="button">Order History</button>
          </div>
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
