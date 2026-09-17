import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  History,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import CoinLogo from "../components/CoinLogo";
import { markets } from "../data/marketData";
import "./../styles/wallet.css";

function buildWalletAssets(spotBalances) {
  const marketMetadata = new Map();

  markets.forEach((market) => {
    const symbol = market.pair.split("/")[0];

    if (!marketMetadata.has(symbol)) {
      marketMetadata.set(symbol, {
        coin: market.coinClass,
        symbol,
        name: market.name,
        price: market.price,
      });
    }
  });

  marketMetadata.set("USDT", {
    coin: "usdt",
    symbol: "USDT",
    name: "Tether",
    price: 1,
  });

  marketMetadata.set("USDC", {
    coin: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    price: 1,
  });

  return Object.entries(spotBalances).map(([symbol, balance]) => {
    const metadata = marketMetadata.get(symbol);

    return {
      coin: metadata?.coin ?? symbol.toLowerCase(),
      symbol,
      name: metadata?.name ?? symbol,
      balance,
      price: metadata?.price ?? 0,
    };
  });
}

function PublicWallet({ onLogin }) {
  return (
    <section className="wallet-access">
      <div className="wallet-access-icon" aria-hidden="true">
        <WalletCards size={28} strokeWidth={1.8} />
      </div>

      <span className="wallet-access-kicker">WALLET</span>

      <h1>Wallet Access</h1>

      <p>
        Log in to manage your assets, deposits, withdrawals and transfers.
      </p>

      <div className="wallet-access-actions">
        <button
          type="button"
          className="wallet-access-login"
          onClick={onLogin}
        >
          Log In
        </button>

        <button
          type="button"
          className="wallet-access-signup"
          onClick={onLogin}
        >
          Sign Up
        </button>
      </div>

      <div className="wallet-security-card">
        <div>
          <ShieldCheck size={17} />
          <span>Secure Transfers</span>
        </div>

        <div>
          <ArrowLeftRight size={17} />
          <span>Easy Transfers</span>
        </div>

        <div>
          <History size={17} />
          <span>Wallet Activity</span>
        </div>
      </div>
    </section>
  );
}

function LoggedInWallet({ onNavigate, walletBalances, transactions }) {
  const [hideZeroBalance, setHideZeroBalance] = useState(false);
  const [walletTab, setWalletTab] = useState("Overview");

  const assets = useMemo(
    () => buildWalletAssets(walletBalances?.["Spot Wallet"] ?? {}),
    [walletBalances]
  );

  const spotBalance = useMemo(
    () => assets.reduce((total, asset) => total + asset.balance * asset.price, 0),
    [assets]
  );

  const futuresAssets = useMemo(
    () => buildWalletAssets(walletBalances?.["Futures Wallet"] ?? {}),
    [walletBalances]
  );

  const futuresBalance = useMemo(
    () =>
      futuresAssets.reduce(
        (total, asset) => total + asset.balance * asset.price,
        0
      ),
    [futuresAssets]
  );

  const totalBalance = spotBalance + futuresBalance;

  const displayedBalance =
    walletTab === "Spot"
      ? spotBalance
      : walletTab === "Futures"
        ? futuresBalance
        : totalBalance;

  const availableBalance = displayedBalance * 0.86;
  const inOrders = displayedBalance - availableBalance;

  const visibleAssets = hideZeroBalance
    ? assets.filter((asset) => asset.balance > 0)
    : assets;

  const actions = [
    {
      key: "Deposit",
      label: "Deposit",
      description: "Add funds",
      icon: ArrowDownToLine,
      primary: true,
    },
    {
      key: "Withdraw",
      label: "Withdraw",
      description: "Send funds",
      icon: ArrowUpFromLine,
    },
    {
      key: "Transfer",
      label: "Transfer",
      description: "Move funds",
      icon: ArrowLeftRight,
    },
    {
      key: "History",
      label: "History",
      description: "View activity",
      icon: History,
    },
  ];

  return (
    <section className="wallet-page">
      <nav className="wallet-balance-tabs" aria-label="Wallet balance view">
        {["Overview", "Spot", "Futures"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`wallet-balance-tab ${
              walletTab === tab ? "active" : ""
            }`}
            onClick={() => setWalletTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <section className="wallet-overview-card">
        <div className="wallet-overview-main">
          <span className="wallet-balance-label">
            {walletTab === "Overview" ? "Total Balance" : `${walletTab} Balance`}
          </span>

          <strong>
            $
            {displayedBalance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </strong>

          <p>Estimated demo wallet value</p>
        </div>

        <div className="wallet-overview-stats">
          <div>
            <span>Available</span>
            <strong>
              $
              {availableBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
          </div>

          <div>
            <span>In Orders</span>
            <strong>
              $
              {inOrders.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
          </div>
        </div>
      </section>

      <nav className="wallet-action-bar" aria-label="Wallet actions">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.key}
              type="button"
              className={`wallet-action ${
                action.primary ? "wallet-action-primary" : ""
              }`}
              onClick={() => onNavigate(action.key)}
              aria-label={action.label}
            >
              <span className="wallet-action-icon">
                <Icon size={19} strokeWidth={1.8} />
              </span>
              <span className="wallet-action-label">{action.label}</span>
            </button>
          );
        })}
      </nav>

      <section className="wallet-assets-card">
        <div className="wallet-card-heading">
          <div>
            <span>ASSETS</span>
            <strong>Your Assets</strong>
          </div>

          <label className="wallet-zero-toggle">
            <span>Hide zero balance</span>
            <input
              type="checkbox"
              checked={hideZeroBalance}
              onChange={(event) => setHideZeroBalance(event.target.checked)}
            />
            <i aria-hidden="true" />
          </label>
        </div>

        <div className="wallet-asset-list">
          {visibleAssets.map((asset) => (
            <div className="wallet-asset-row" key={asset.symbol}>
              <div className="wallet-asset-identity">
                <CoinLogo coin={asset.coin} name={asset.name} />

                <div>
                  <strong>{asset.symbol}</strong>
                  <span>
                    {asset.balance} {asset.symbol}
                  </span>
                </div>
              </div>

              <strong>
                $
                {(asset.balance * asset.price).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <section className="wallet-security-strip">
        <div>
          <ShieldCheck size={17} />
          <span>
            <strong>Protected Wallet</strong>
            <small>Demo environment</small>
          </span>
        </div>

        <div>
          <ArrowLeftRight size={17} />
          <span>
            <strong>Fast Transfers</strong>
            <small>Spot & Futures</small>
          </span>
        </div>

        <div>
          <History size={17} />
          <span>
            <strong>Full Activity</strong>
            <small>{transactions.length} recent items</small>
          </span>
        </div>
      </section>
    </section>
  );
}

export default function Wallet({ isLoggedIn, onNavigate, walletBalances, transactions }) {
  const handleLogin = () => {
    window.dispatchEvent(new CustomEvent("bitlora:login"));
  };

  if (!isLoggedIn) {
    return <PublicWallet onLogin={handleLogin} />;
  }

  return <LoggedInWallet onNavigate={onNavigate} walletBalances={walletBalances} transactions={transactions} />;
}
