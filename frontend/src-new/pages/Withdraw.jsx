import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpFromLine,
  Camera,
  CheckCircle2,
  ChevronDown,
  Copy,
  ScanLine,
} from "lucide-react";
import CoinLogo from "../components/CoinLogo";
import "./../styles/wallet.css";

const assets = [
  {
    coin: "usdt",
    symbol: "USDT",
    name: "Tether",
    balance: 4250,
    networks: ["Ethereum", "Tron", "BSC"],
    fee: 1,
  },
  {
    coin: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    balance: 0.045,
    networks: ["Bitcoin"],
    fee: 0.0001,
  },
  {
    coin: "eth",
    symbol: "ETH",
    name: "Ethereum",
    balance: 1.25,
    networks: ["Ethereum", "Arbitrum", "Base"],
    fee: 0.001,
  },
  {
    coin: "sol",
    symbol: "SOL",
    name: "Solana",
    balance: 8.5,
    networks: ["Solana"],
    fee: 0.01,
  },
  {
    coin: "bnb",
    symbol: "BNB",
    name: "BNB",
    balance: 2.1,
    networks: ["BSC"],
    fee: 0.002,
  },
];

export default function Withdraw({ onNavigate, walletBalances, setWalletBalances, transactions, setTransactions }) {
  const [asset, setAsset] = useState(assets[0]);
  const [network, setNetwork] = useState(assets[0].networks[0]);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
const [openDropdown, setOpenDropdown] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const selectAsset = (symbol) => {
    const next = assets.find((item) => item.symbol === symbol) || assets[0];
    setAsset(next);
    setNetwork(next.networks[0]);
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard?.writeText(address);
    }
  };

  const useDemoScan = () => {
    setAddress("0x71C8A9D42F7B8E2C6A4D19F3B5C82017");
    setScannerOpen(false);
  };

  const availableBalance = walletBalances?.["Spot Wallet"]?.[asset.symbol] ?? 0;
  const numericAmount = Number(amount);
  const validationMessage =
    !amount || numericAmount <= 0
      ? ""
      : numericAmount > availableBalance
        ? `Amount exceeds available ${asset.symbol} balance.`
        : numericAmount <= asset.fee
          ? `Amount must be greater than the ${asset.symbol} network fee.`
          : "";

  const submit = () => {
    if (
      !address.trim() ||
      numericAmount <= 0 ||
      numericAmount > availableBalance ||
      numericAmount <= asset.fee
    ) {
      return;
    }

    setWalletBalances((current) => ({
    ...current,
    "Spot Wallet": {
      ...(current["Spot Wallet"] || {}),
      [asset.symbol]:
        (current["Spot Wallet"]?.[asset.symbol] ?? 0) - numericAmount,
    },
  }));

  setTransactions((current) => [
    {
      type: "Withdrawal",
      asset: asset.symbol,
      amount: `-${numericAmount.toFixed(4)}`,
      status: "Processing",
      date: "Just now",
    },
    ...(current || []),
  ]);
  setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="wallet-page wallet-flow-page">
        <button
          type="button"
          className="wallet-back-button"
          onClick={() => onNavigate("Wallet")}
        >
          <ArrowLeft size={16} />
          Wallet
        </button>

        <section className="wallet-flow-success">
          <div className="wallet-flow-success-icon">
            <CheckCircle2 size={25} />
          </div>

          <span className="wallet-page-kicker">WITHDRAWAL</span>
          <h1>Withdrawal Submitted</h1>

          <p>
            Your demo withdrawal request has been added for processing.
          </p>

          <div className="wallet-success-summary">
            <span>Amount</span>
            <strong>
              {Number(amount).toFixed(4)} {asset.symbol}
            </strong>
          </div>

          <button
            type="button"
            className="wallet-primary-action"
            onClick={() => onNavigate("History")}
          >
            View History
          </button>
        </section>
      </section>
    );
  }

  return (
    <section className="wallet-page wallet-flow-page">
      <button
        type="button"
        className="wallet-back-button"
        onClick={() => onNavigate("Wallet")}
      >
        <ArrowLeft size={16} />
        Wallet
      </button>

      <section className="wallet-flow-card">
        <div className="wallet-flow-heading">
          <div className="wallet-flow-icon">
            <ArrowUpFromLine size={19} />
          </div>

          <div>
            <span className="wallet-page-kicker">WITHDRAW</span>
            <h1>Withdraw Assets</h1>
            <p>Send supported assets to an external wallet.</p>
          </div>
        </div>

        <div className="wallet-form-grid">
          <div className={`wallet-field wallet-inline-dropdown${openDropdown === "asset" ? " is-open" : ""}`}>
            <span>Asset</span>
            <button
              type="button"
              className="wallet-inline-trigger"
              onClick={() =>
                setOpenDropdown((current) =>
                  current === "asset" ? null : "asset"
                )
              }
              aria-expanded={openDropdown === "asset"}
            >
              <span className="wallet-inline-value">
                <CoinLogo coin={asset.coin} name={asset.name} />
                <span>
                  <strong>{asset.symbol}</strong>
                  <small>{asset.name}</small>
                </span>
              </span>
              <ChevronDown size={15} />
            </button>

            {openDropdown === "asset" && (
              <div className="wallet-inline-list">
                {assets.map((item) => (
                  <button
                    type="button"
                    className={`wallet-inline-option${
                      item.symbol === asset.symbol ? " is-selected" : ""
                    }`}
                    key={item.symbol}
                    onClick={() => {
                      selectAsset(item.symbol);
                      setOpenDropdown(null);
                    }}
                  >
                    <CoinLogo coin={item.coin} name={item.name} />
                    <span>
                      <strong>{item.symbol}</strong>
                      <small>{item.name}</small>
                    </span>
                    {item.symbol === asset.symbol && <CheckCircle2 size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={`wallet-field wallet-inline-dropdown${openDropdown === "network" ? " is-open" : ""}`}>
            <span>Network</span>
            <button
              type="button"
              className="wallet-inline-trigger"
              onClick={() =>
                setOpenDropdown((current) =>
                  current === "network" ? null : "network"
                )
              }
              aria-expanded={openDropdown === "network"}
            >
              <span className="wallet-inline-value">
                <span>
                  <strong>{network}</strong>
                  <small>{asset.symbol} network</small>
                </span>
              </span>
              <ChevronDown size={15} />
            </button>

            {openDropdown === "network" && (
              <div className="wallet-inline-list">
                {asset.networks.map((item) => (
                  <button
                    type="button"
                    className={`wallet-inline-option${
                      item === network ? " is-selected" : ""
                    }`}
                    key={item}
                    onClick={() => {
                      setNetwork(item);
                      setOpenDropdown(null);
                    }}
                  >
                    <span>
                      <strong>{item}</strong>
                      <small>{asset.symbol} network</small>
                    </span>
                    {item === network && <CheckCircle2 size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="wallet-field wallet-field-wide">
            <span>Withdrawal Address</span>

            <div className="wallet-input-with-action">
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Enter wallet address"
              />

              <button
                type="button"
                onClick={copyAddress}
                aria-label="Copy address"
              >
                <Copy size={16} />
              </button>
            </div>
          </label>

          <button
            type="button"
            className={`wallet-scan-button ${
              scannerOpen ? "wallet-scan-active" : ""
            }`}
            onClick={() => setScannerOpen((value) => !value)}
          >
            <ScanLine size={17} />
            <span>
              <strong>Scan Address</strong>
              <small>Scan a wallet QR code</small>
            </span>
            <Camera size={16} />
          </button>

          {scannerOpen && (
            <div className="wallet-scanner wallet-field-wide">
              <div className="wallet-scanner-frame">
                <ScanLine size={36} strokeWidth={1.4} />
              </div>

              <div>
                <strong>QR Scanner</strong>
                <p>
                  Camera scanning is available in the live integration.
                  Use the demo address below for this demo flow.
                </p>
              </div>

              <button type="button" onClick={useDemoScan}>
                Use Demo Address
              </button>
            </div>
          )}

          <label className="wallet-field">
            <span>Amount</span>

            <input
              type="number"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder={`Available ${availableBalance} ${asset.symbol}`}
            />
          </label>

          <div className="wallet-fee-box">
            <span>Network Fee</span>
            <strong>
              {asset.fee} {asset.symbol}
            </strong>
          </div>

          <div className="wallet-receive-box wallet-field-wide">
            <span>You Receive</span>
            <strong>
              {Math.max(0, Number(amount || 0) - asset.fee).toFixed(4)}{" "}
              {asset.symbol}
            </strong>
          </div>

          {validationMessage && (
            <p className="wallet-validation-message wallet-field-wide">
              {validationMessage}
            </p>
          )}

          <button
            type="button"
            className="wallet-primary-action wallet-field-wide"
            onClick={submit}
            disabled={
              !address.trim() ||
              numericAmount <= 0 ||
              Boolean(validationMessage)
            }
          >
            Review Withdrawal
          </button>
        </div>

        <div className="wallet-selected-asset">
          <CoinLogo coin={asset.coin} name={asset.name} />
          <div>
            <strong>{asset.symbol}</strong>
            <span>{asset.name}</span>
          </div>
          <span>
            Available {availableBalance} {asset.symbol}
          </span>
        </div>
      </section>
    </section>
  );
}
