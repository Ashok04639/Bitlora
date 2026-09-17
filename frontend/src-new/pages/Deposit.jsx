import { useMemo, useState } from "react";
import CoinLogo from "../components/CoinLogo";
import "../styles/deposit.css";

const assets = [
  {
    symbol: "USDT",
    name: "Tether",
    balance: "4,250.00 USDT",
    networks: [
      { name: "Ethereum", fee: "2.50 USDT", minimum: "10 USDT", address: "0x71C8...4A92" },
      { name: "Tron", fee: "1.00 USDT", minimum: "5 USDT", address: "TQ7x...9K3P" },
      { name: "BSC", fee: "0.80 USDT", minimum: "5 USDT", address: "0x94B2...7F11" },
    ],
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: "2,840.00 USDC",
    networks: [
      { name: "Ethereum", fee: "2.50 USDC", minimum: "10 USDC", address: "0x52D1...8B41" },
      { name: "Solana", fee: "0.01 USDC", minimum: "1 USDC", address: "7Kp2...mQ8A" },
      { name: "BSC", fee: "0.80 USDC", minimum: "5 USDC", address: "0x83F4...2C19" },
    ],
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    balance: "0.0450 BTC",
    networks: [
      { name: "Bitcoin", fee: "0.00010 BTC", minimum: "0.00010 BTC", address: "bc1q7...8m2v" },
    ],
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: "1.2500 ETH",
    networks: [
      { name: "Ethereum", fee: "0.0015 ETH", minimum: "0.005 ETH", address: "0xA81F...D294" },
      { name: "Arbitrum", fee: "0.0004 ETH", minimum: "0.001 ETH", address: "0xA81F...D294" },
      { name: "Base", fee: "0.0003 ETH", minimum: "0.001 ETH", address: "0xA81F...D294" },
    ],
  },
  {
    symbol: "BNB",
    name: "BNB",
    balance: "3.4200 BNB",
    networks: [
      { name: "BSC", fee: "0.0005 BNB", minimum: "0.01 BNB", address: "0x38C1...91F2" },
    ],
  },
  {
    symbol: "SOL",
    name: "Solana",
    balance: "18.5000 SOL",
    networks: [
      { name: "Solana", fee: "0.0001 SOL", minimum: "0.01 SOL", address: "7Kp2...mQ8A" },
    ],
  },
  {
    symbol: "XRP",
    name: "XRP",
    balance: "1,250.00 XRP",
    networks: [
      { name: "XRP Ledger", fee: "0.20 XRP", minimum: "10 XRP", address: "rN7a...4K2P", memo: "18472931" },
    ],
  },
  {
    symbol: "ADA",
    name: "Cardano",
    balance: "950.00 ADA",
    networks: [
      { name: "Cardano", fee: "0.20 ADA", minimum: "5 ADA", address: "addr1q...7x9m" },
    ],
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    balance: "2,500.00 DOGE",
    networks: [
      { name: "Dogecoin", fee: "5 DOGE", minimum: "25 DOGE", address: "D7Kp...9mQ2" },
    ],
  },
  {
    symbol: "TRX",
    name: "TRON",
    balance: "1,850.00 TRX",
    networks: [
      { name: "Tron", fee: "1 TRX", minimum: "10 TRX", address: "TQ7x...9K3P" },
    ],
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    balance: "12.8000 AVAX",
    networks: [
      { name: "Avalanche C-Chain", fee: "0.01 AVAX", minimum: "0.10 AVAX", address: "0x62A4...C821" },
    ],
  },
  {
    symbol: "SHIB",
    name: "Shiba Inu",
    balance: "850,000 SHIB",
    networks: [
      { name: "Ethereum", fee: "25,000 SHIB", minimum: "100,000 SHIB", address: "0x71C8...4A92" },
      { name: "BSC", fee: "8,000 SHIB", minimum: "50,000 SHIB", address: "0x94B2...7F11" },
    ],
  },
];

function Dropdown({ label, children, open, onToggle }) {
  return (
    <div className="deposit-dropdown">
      <span className="deposit-field-label">{label}</span>

      <button
        type="button"
        className={`deposit-dropdown-trigger${open ? " is-open" : ""}`}
        onClick={onToggle}
        aria-expanded={open}
      >
        {children}
        <span className={`deposit-dropdown-chevron${open ? " is-open" : ""}`}>
          ↓
        </span>
      </button>
    </div>
  );
}

export default function Deposit({ onNavigate, walletBalances, setWalletBalances, transactions, setTransactions }) {
  const [selectedAsset, setSelectedAsset] = useState("USDT");
  const [selectedNetwork, setSelectedNetwork] = useState("Ethereum");
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [completed, setCompleted] = useState(false);

  const asset = useMemo(
    () => assets.find((item) => item.symbol === selectedAsset) || assets[0],
    [selectedAsset]
  );

  const network =
    asset.networks.find((item) => item.name === selectedNetwork) ||
    asset.networks[0];

  const availableBalance =
    walletBalances?.["Spot Wallet"]?.[asset.symbol] ?? 0;

  const toggleDropdown = (name) => {
    setOpenDropdown((current) => (current === name ? null : name));
  };

  const handleAssetChange = (nextAsset) => {
    setSelectedAsset(nextAsset.symbol);
    setSelectedNetwork(nextAsset.networks[0].name);
    setAmount("");
    setCopied(false);
    setOpenDropdown(null);
  };

  const handleNetworkChange = (nextNetwork) => {
    setSelectedNetwork(nextNetwork.name);
    setCopied(false);
    setOpenDropdown(null);
  };

  const handleDeposit = () => {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return;
    }

    setWalletBalances((current) => ({
      ...current,
      "Spot Wallet": {
        ...(current["Spot Wallet"] || {}),
        [asset.symbol]:
          (current["Spot Wallet"]?.[asset.symbol] ?? 0) + numericAmount,
      },
    }));

    setTransactions((current) => [
      {
        type: "Deposit",
        asset: asset.symbol,
        amount: `+${numericAmount.toFixed(4)}`,
        status: "Completed",
        date: "Just now",
      },
      ...(current || []),
    ]);

    setCompleted(true);
    onNavigate("History");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(network.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="deposit-page">
      <header className="deposit-page-header">
        <button type="button" onClick={() => onNavigate("Wallet")}>
          Back to Wallet
        </button>

        <div>
          <span>WALLET</span>
          <h1>Deposit</h1>
          <p>Deposit assets into your Bitlora wallet.</p>
        </div>
      </header>

      <section className="deposit-card">
        <span>DEPOSIT</span>
        <h2>Deposit Crypto</h2>
        <p>Choose an asset and network to get your deposit details.</p>

        <div className="deposit-form">
          <Dropdown
            label="ASSET"
            open={openDropdown === "asset"}
            onToggle={() => toggleDropdown("asset")}
          >
            <span className="deposit-selected-value">
              <CoinLogo coin={asset.symbol} name={asset.name} />
              <span>
                <strong>{asset.symbol}</strong>
                <small>{asset.name}</small>
              </span>
            </span>
          </Dropdown>

          {openDropdown === "asset" && (
            <div className="deposit-dropdown-list">
              {assets.map((item) => (
                <button
                  key={item.symbol}
                  type="button"
                  className={`deposit-dropdown-option${
                    selectedAsset === item.symbol ? " is-selected" : ""
                  }`}
                  onClick={() => handleAssetChange(item)}
                >
                  <CoinLogo coin={item.symbol} name={item.name} />
                  <span>
                    <strong>{item.symbol}</strong>
                    <small>{item.name}</small>
                  </span>
                  {selectedAsset === item.symbol && (
                    <b className="deposit-check">✓</b>
                  )}
                </button>
              ))}
            </div>
          )}

          <Dropdown
            label="NETWORK"
            open={openDropdown === "network"}
            onToggle={() => toggleDropdown("network")}
          >
            <span className="deposit-selected-network">
              <strong>{network.name}</strong>
              <small>{asset.symbol} network</small>
            </span>
          </Dropdown>

          {openDropdown === "network" && (
            <div className="deposit-dropdown-list">
              {asset.networks.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className={`deposit-dropdown-option network-option${
                    selectedNetwork === item.name ? " is-selected" : ""
                  }`}
                  onClick={() => handleNetworkChange(item)}
                >
                  <span>
                    <strong>{item.name}</strong>
                    <small>Deposit {asset.symbol}</small>
                  </span>
                  {selectedNetwork === item.name && (
                    <b className="deposit-check">✓</b>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="deposit-balance-row">
            <span>AVAILABLE BALANCE</span>
            <strong>{availableBalance}</strong>
          </div>

          <label className="deposit-field">
            <span className="deposit-field-label">AMOUNT</span>
            <div className="deposit-amount-input">
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
              />
              <strong>{asset.symbol}</strong>
            </div>
          </label>

          <div className="deposit-address-section">
            <div className="deposit-section-heading">
              <span>DEPOSIT ADDRESS</span>
              <strong>{asset.symbol}</strong>
            </div>

            <div className="deposit-address-row">
              <code>{network.address}</code>
              <button type="button" onClick={handleCopy}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="deposit-qr">
              <div className="deposit-qr-grid" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <span>SCAN TO DEPOSIT</span>
            </div>
          </div>

          {network.memo && (
            <div className="deposit-memo">
              <div>
                <span>MEMO / TAG</span>
                <strong>{network.memo}</strong>
              </div>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(network.memo)}
              >
                Copy
              </button>
            </div>
          )}

          <div className="deposit-info-grid">
            <div>
              <span>MINIMUM DEPOSIT</span>
              <strong>{network.minimum}</strong>
            </div>
            <div>
              <span>NETWORK FEE</span>
              <strong>{network.fee}</strong>
            </div>
          </div>

          <div className="deposit-warning">
            <strong>Important</strong>
            <p>
              Send only {asset.symbol} on the selected network to this address.
              Sending another asset or unsupported network may result in loss of funds.
            </p>
          </div>

          <button
            type="button"
            className="deposit-action"
            disabled={!amount || Number(amount) <= 0}
            onClick={handleDeposit}
          >
            Deposit {asset.symbol}
          </button>
        </div>
      </section>
    </section>
  );
}
