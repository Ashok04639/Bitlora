import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [active, setActive] = useState("Home");
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [balanceData, setBalanceData] = useState(null);
  const [assetsData, setAssetsData] = useState([]);
  const [marketsData, setMarketsData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);
  const API_BASE_URL = `http://${window.location.hostname}:3000`;

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);

        if (!response.ok) {
          throw new Error("API health check failed");
        }

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

        if (!response.ok) {
          throw new Error("Balance request failed");
        }

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

        if (!response.ok) {
          throw new Error("Markets API request failed");
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.markets)) {
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

        if (!response.ok) {
          throw new Error("Assets API request failed");
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.assets)) {
          setAssetsData(data.assets);
        }
      } catch {
        setApiStatus("API Offline");
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
    {
      pair: "BTC/USDT",
      price: "$66,842.10",
      change: "+2.41%",
    },
    {
      pair: "ETH/USDT",
      price: "$3,224.50",
      change: "+1.82%",
    },
    {
      pair: "BNB/USDT",
      price: "$648.30",
      change: "-0.74%",
    },
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

        <button type="button" onClick={() => setActive("Trade")}>
          <span>+</span>
          Buy
        </button>
      </section>


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
          {(marketsData.length > 0 ? marketsData : markets).map((market) => (
            <div className="market" key={market.pair}>
              <div className="market-left">
                <div className="market-icon">◆</div>

                <div>
                  <strong>{market.pair}</strong>
                  <span>24h Market</span>
                </div>
              </div>

              <div className="market-value">
                <strong>{market.price}</strong>

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
              {assetsData.map((asset) => (
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
              {(transactionsData.length > 0 ? transactionsData : [
                { type: "Deposit", asset: "Bitcoin", amount: "+$500.00", direction: "in" },
                { type: "Trade", asset: "BTC/USDT", amount: "-$120.00", direction: "out" }
              ]).map((transaction, index) => (
                <div className="transaction" key={`${transaction.type}-${index}`}>
                  <div className="transaction-icon">
                    {transaction.direction === "in" ? "↓" : "⇄"}
                  </div>

                  <div>
                    <strong>{transaction.type}</strong>
                    <span>{transaction.asset}</span>
                  </div>

                  <b className={transaction.direction === "in" ? "green" : "red"}>
                    {transaction.amount}
                  </b>
                </div>
              ))}
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
          className={active === "Wallet" ? "active" : ""}
          onClick={() => setActive("Wallet")}
        >
          <span>▣</span>
          <small>Wallet</small>
        </button>

        <button
          type="button"
          className={active === "Profile" ? "active" : ""}
          onClick={() => setActive("Profile")}
        >
          <span>●</span>
          <small>Profile</small>
        </button>
      </nav>
    </div>
  );
}

export default App;