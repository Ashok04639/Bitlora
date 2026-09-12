import React from "react";

export default function TradingViewChart({ pair = "BTC/USDT" }) {
  const symbol = `BINANCE:${pair.replace("/", "")}`;

  const src =
    `https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(symbol)}` +
    `&interval=15` +
    `&hidesidetoolbar=0` +
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
