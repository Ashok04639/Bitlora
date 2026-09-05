import { useState } from "react";
import "./App.css";

function App() {
  const [active, setActive] = useState("Home");

  const assets = [
    { name: "Bitcoin", symbol: "BTC", balance: "0.0024", value: "$158.42", icon: "₿" },
    { name: "Ethereum", symbol: "ETH", balance: "0.041", value: "$132.18", icon: "Ξ" },
    { name: "BNB", symbol: "BNB", balance: "0.18", value: "$116.70", icon: "◆" },
  ];

  const markets = [
    { pair: "BTC/USDT", price: "$66,842.10", change: "+2.41%" },
    { pair: "ETH/USDT", price: "$3,224.50", change: "+1.82%" },
    { pair: "BNB/USDT", price: "$648.30", change: "-0.74%" },
  ];

  const renderContent = () => {
    if (active === "Markets") {
      return (
        <div className="page">
          <h2>Markets</h2>
          <p className="subtext">Live crypto market overview</p>

          <div className="market-list">
            {markets.map((coin) => (
              <div className="market-card" key={coin.pair}>
                <div>
                  <strong>{coin.pair}</strong>
                  <span>24h Market</span>
                </div>
                <div className="market-right">
                  <strong>{coin.price}</strong>
                  <span className={coin.change.startsWith("+") ? "green" : "red"}>
                    {coin.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (active === "Trade") {
      return (
        <div className="page">
          <h2>Trade</h2>
          <p className="subtext">Buy and sell crypto</p>

          <div className="trade-card">
            <div className="trade-tabs">
              <button className="active-tab">Buy</button>
              <button>Sell</button>
            </div>

            <label>Trading Pair</label>
            <div className="input-box">BTC / USDT</div>

            <label>Amount</label>
            <div className="input-box">0.00 USDT</div>

            <button className="main-button">Buy BTC</button>
          </div>
        </div>
      );
    }

    if (active === "Wallet") {
      return (
        <div className="page">
          <h2>Wallet</h2>
          <p className="subtext">Your crypto assets</p>

          <div className="wallet-actions">
            <button>↓ Deposit</button>
            <button>↑ Withdraw</button>
          </div>

          <div className="asset-list">
            {assets.map((asset) => (
              <div className="asset-row" key={asset.symbol}>
                <div className="coin-icon">{asset.icon}</div>
                <div className="asset-info">
                  <strong>{asset.name}</strong>
                  <span>{asset.symbol}</span>
                </div>
                <div className="asset-value">
                  <strong>{asset.balance}</strong>
                  <span>{asset.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (active === "Profile") {
      return (
        <div className="page">
          <h2>Profile</h2>
          <p className="subtext">Account & security</p>

          <div className="profile-card">
            <div className="profile-avatar">U</div>
            <div>
              <strong>Crypto User</strong>
              <span>Account verified</span>
            </div>
          </div>

          <div className="settings-list">
            <div>🔐 Security <span>›</span></div>
            <div>🪪 Verification <span>›</span></div>
            <div>🔔 Notifications <span>›</span></div>
            <div>⚙️ Settings <span>›</span></div>
          </div>
        </div>
      );
    }

    return (
      <div className="page">
        <div className="top-header">
          <div>
            <span className="welcome">Welcome back</span>
            <h1>CryptoWallet</h1>
          </div>
          <div className="notification">🔔</div>
        </div>

        <div className="balance-card">
          <span>Total Balance</span>
          <h2>$12,458.80</h2>
          <div className="balance-bottom">
            <span>≈ 0.186 BTC</span>
            <span className="green">+4.82% today</span>
          </div>
        </div>

        <div className="quick-actions">
          <button>
            <b>↓</b>
            Deposit
          </button>
          <button>
            <b>↑</b>
            Withdraw
          </button>
          <button>
            <b>⇄</b>
            Transfer
          </button>
          <button>
            <b>＋</b>
            Buy
          </button>
        </div>

        <div className="section-title">
          <h3>Your Assets</h3>
          <span onClick={() => setActive("Wallet")}>View all</span>
        </div>

        <div className="asset-list">
          {assets.map((asset) => (
            <div className="asset-row" key={asset.symbol}>
              <div className="coin-icon">{asset.icon}</div>
              <div className="asset-info">
                <strong>{asset.name}</strong>
                <span>{asset.symbol}</span>
              </div>
              <div className="asset-value">
                <strong>{asset.balance}</strong>
                <span>{asset.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="section-title">
          <h3>Market Overview</h3>
          <span onClick={() => setActive("Markets")}>View all</span>
        </div>

        <div className="market-list">
          {markets.map((coin) => (
            <div className="market-card" key={coin.pair}>
              <div>
                <strong>{coin.pair}</strong>
                <span>24h</span>


                <span className="market-price">{coin.price}</span>
              </div>
              <div className="market-change">
                <strong>{coin.change}</strong>
                <span>{coin.volume}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="section-title">
          <h3>Recent Transactions</h3>
          <span onClick={() => setActive("Wallet")}>View all</span>
        </div>

        <div className="transactions">
          <div className="transaction-card">
            <div>
              <strong>Deposit</strong>
              <span>Bitcoin</span>
            </div>
            <strong className="green">+$500.00</strong>
          </div>

          <div className="transaction-card">
            <div>
              <strong>Trade</strong>
              <span>BTC/USDT</span>
            </div>
            <strong>-$120.00</strong>
          </div>
        </div>

        <nav className="bottom-nav">
          <button onClick={() => setActive("Home")}>⌂<span>Home</span></button>
          <button onClick={() => setActive("Markets")}>◈<span>Markets</span></button>
          <button onClick={() => setActive("Trade")}>⇄<span>Trade</span></button>
          <button onClick={() => setActive("Wallet")}>▣<span>Wallet</span></button>
          <button onClick={() => setActive("Profile")}>●<span>Profile</span></button>
        </nav>
      </div>
    );
  }

  return <div className="app">{renderContent()}</div>;
}

export default App;
