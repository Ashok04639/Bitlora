import React from "react";

export default function TradingViewChart({ pair = "BTC/USDT", timeframe = "15m" }) {
  const intervalMap = {
    "1s": "1S",
    "1m": "1",
    "5m": "5",
    "15m": "15",
    "30m": "30",
    "1H": "60",
    "4H": "240",
    "1D": "D",
    "1Mth": "1M",
  };

  const interval = intervalMap[timeframe] || "15";


  const symbol = `BINANCE:${pair.replace("/", "")}`;

  const src =
    `https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(symbol)}` +
    `&interval=${encodeURIComponent(interval)}` +
    `&hidesidetoolbar=0` +
    `&hide_top_toolbar=1` +
    `&symboledit=1` +
    `&saveimage=0` +
    `&toolbarbg=%23141a22` +
    `&theme=dark` +
    `&style=1` +
    `&timezone=Asia%2FKolkata` +
    `&withdateranges=1` +
    `&hideideas=1` +
    `&studies=[]`;

  return (
    <div className="bitlora-tv-chart">
      <iframe
        title={`${pair} TradingView Chart`}
        src={src}
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
}
