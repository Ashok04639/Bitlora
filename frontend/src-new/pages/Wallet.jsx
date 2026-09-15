import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Copy,
  Eye,
  EyeOff,
  WalletCards,
} from "lucide-react";

const assets = [
  { symbol: "USDT", name: "Tether", balance: 1248.52, price: 1 },
  { symbol: "BTC", name: "Bitcoin", balance: 0.01842, price: 66842.10 },
  { symbol: "ETH", name: "Ethereum", balance: 0.3268, price: 3482.76 },
  { symbol: "SOL", name: "Solana", balance: 2.84, price: 184.52 },
];

const initialHistory = [
  {
    id: 1,
    type: "Deposit",
    asset: "USDT",
    amount: "500.00",
    status: "Completed",
    date: "15 Sep 2026, 01:20",
  },
  {
    id: 2,
    type: "Trade",
    asset: "BTC",
    amount: "0.00420",
    status: "Completed",
    date: "14 Sep 2026, 22:48",
  },
];

export default function Wallet({ isLoggedIn }) {
  const [action, setAction] = useState("Deposit");
  const [asset, setAsset] = useState("USDT");
  const [network, setNetwork] = useState("BEP20");
  const [amount, setAmount] = useState("");
  const [hideSmall, setHideSmall] = useState(false);
  const [history, setHistory] = useState(initialHistory);
  const [message, setMessage] = useState("");

  const selectedAsset = assets.find((item) => item.symbol === asset);

  const totalBalance = useMemo(
    () =>
      assets.reduce(
        (total, item) => total + item.balance * item.price,
        0
      ),
    []
  );

  const visibleAssets = hideSmall
    ? assets.filter((item) => item.balance * item.price >= 1)
    : assets;

  function submitAction(event) {
    event.preventDefault();

    const value = Number(amount);

    if (!value || value <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }

    setHistory((current) => [
      {
        id: Date.now(),
        type: action,
        asset,
        amount: value.toFixed(asset === "USDT" ? 2 : 6),
        status: "Completed",
        date: "15 Sep 2026, just now",
      },
      ...current,
    ]);

    setAmount("");
    setMessage(
      `Demo ${action.toLowerCase()} request completed successfully.`
    );
  }

  return (
    <>
<section className="wallet-public-card">
        <span className="section-kicker">WALLET</span>
        <h2>Sign in to access your wallet</h2>
        <p>
          Your balances, deposits, withdrawals and wallet activity are
          available after signing in.
        </p>
        <button
          type="button"
          className="wallet-public-login"
          onClick={() => window.dispatchEvent(new CustomEvent("bitlora:login"))}
        >
          Log In
        </button>
        <span className="wallet-public-note">Public demo environment</span>
      </section>

      {isLoggedIn && (
        <>
<section className="wallet-page">
      <div className="wallet-heading">
        <div>
          <span className="wallet-kicker">ASSETS</span>
          <h1>Wallet</h1>
          <p>Manage your demo assets, deposits, withdrawals and history.</p>
        </div>

        <div className="wallet-demo-badge">
          <span>Environment</span>
          <strong>DEMO</strong>
        </div>
      </div>

      <section className="wallet-balance-card">
        <div className="wallet-balance-main">
          <span>Total Balance</span>
          <strong>
            ${totalBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </strong>
          <small>≈ {totalBalance.toLocaleString()} USDT</small>
        </div>

        <div className="wallet-balance-stats">
          <div>
            <span>Available</span>
            <strong>$1,248.52</strong>
          </div>
          <div>
            <span>In Orders</span>
            <strong>$0.00</strong>
          </div>
          <div>
            <span>Today's PNL</span>
            <strong className="wallet-positive">+$42.18</strong>
          </div>
        </div>

        <div className="wallet-balance-actions">
          <button
            type="button"
            className="wallet-action primary"
            onClick={() => setAction("Deposit")}
          >
            <ArrowDownToLine size={17} />
            Deposit
          </button>

          <button
            type="button"
            className="wallet-action secondary"
            onClick={() => setAction("Withdraw")}
          >
            <ArrowUpFromLine size={17} />
            Withdraw
          </button>
        </div>
      </section>

      <div className="wallet-workspace">
        <section className="wallet-assets-card">
          <div className="wallet-card-header">
            <div>
              <span>Portfolio</span>
              <strong>Your Assets</strong>
            </div>

            <button
              type="button"
              className="wallet-small-toggle"
              onClick={() => setHideSmall((value) => !value)}
            >
              {hideSmall ? <EyeOff size={15} /> : <Eye size={15} />}
              Hide small
            </button>
          </div>

          <div className="wallet-assets-list">
            {visibleAssets.map((item) => (
              <button
                type="button"
                className={`wallet-asset-row${
                  asset === item.symbol ? " selected" : ""
                }`}
                key={item.symbol}
                onClick={() => setAsset(item.symbol)}
              >
                <span className="wallet-asset-icon">
                  {item.symbol.slice(0, 1)}
                </span>

                <span className="wallet-asset-name">
                  <strong>{item.symbol}</strong>
                  <small>{item.name}</small>
                </span>

                <span className="wallet-asset-balance">
                  <strong>{item.balance}</strong>
                  <small>
                    $
                    {(item.balance * item.price).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </small>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="wallet-action-card">
          <div className="wallet-card-header">
            <div>
              <span>Wallet Actions</span>
              <strong>{action} {asset}</strong>
            </div>
            <WalletCards size={20} />
          </div>

          <div className="wallet-action-tabs">
            <button
              type="button"
              className={action === "Deposit" ? "active deposit" : ""}
              onClick={() => {
                setAction("Deposit");
                setMessage("");
              }}
            >
              Deposit
            </button>
            <button
              type="button"
              className={action === "Withdraw" ? "active withdraw" : ""}
              onClick={() => {
                setAction("Withdraw");
                setMessage("");
              }}
            >
              Withdraw
            </button>
          </div>

          <form className="wallet-form" onSubmit={submitAction}>
            <label>
              <span>Asset</span>
              <select
                value={asset}
                onChange={(event) => setAsset(event.target.value)}
              >
                {assets.map((item) => (
                  <option key={item.symbol}>{item.symbol}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Network</span>
              <select
                value={network}
                onChange={(event) => setNetwork(event.target.value)}
              >
                <option>BEP20</option>
                <option>ERC20</option>
                <option>TRC20</option>
              </select>
            </label>

            {action === "Deposit" && (
              <div className="wallet-address">
                <div>
                  <span>Demo Deposit Address</span>
                  <strong>0xDemoBitloraWallet7F21A9</strong>
                </div>
                <button
                  type="button"
                  aria-label="Copy demo address"
                  onClick={() => setMessage("Demo address copied.")}
                >
                  <Copy size={16} />
                </button>
              </div>
            )}

            <label>
              <span>Amount</span>
              <div className="wallet-amount">
                <input
                  type="number"
                  min="0"
                  step="0.000001"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.00"
                />
                <strong>{selectedAsset.symbol}</strong>
              </div>
            </label>

            <div className="wallet-form-note">
              <span>Available Balance</span>
              <strong>
                {selectedAsset.balance} {selectedAsset.symbol}
              </strong>
            </div>

            <button
              type="submit"
              className={`wallet-submit ${action.toLowerCase()}`}
            >
              {action === "Deposit" ? (
                <ArrowDownToLine size={17} />
              ) : (
                <ArrowUpFromLine size={17} />
              )}
              Demo {action}
            </button>

            {message && <p className="wallet-message">{message}</p>}
          </form>
        </section>
      </div>

      <section className="wallet-history-card">
        <div className="wallet-card-header">
          <div>
            <span>Activity</span>
            <strong>Wallet History</strong>
          </div>
          <span className="wallet-history-label">Demo records</span>
        </div>

        <div className="wallet-history-table-wrap">
          <table className="wallet-history-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Asset</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.type}</strong>
                  </td>
                  <td>{item.asset}</td>
                  <td>{item.amount}</td>
                  <td>
                    <span className="wallet-status">{item.status}</span>
                  </td>
                  <td>{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
        </>
      )}


    </>
  );
}
