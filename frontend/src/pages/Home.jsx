export default function Home() {
  return (
    <section className="page-section">
      <div className="hero">
        <div>
          <span className="eyebrow">BITLORA EXCHANGE</span>
          <h1>Trade Crypto With Confidence</h1>
          <p>Professional spot and futures trading in one clean exchange.</p>
          <button className="action-primary">Start Trading</button>
        </div>
        <div className="hero-stat">
          <span>Market Status</span>
          <strong>Live</strong>
        </div>
      </div>

      <div className="section-heading">
        <h2>Markets</h2>
        <span>Live market overview</span>
      </div>

      <div className="market-grid">
        {["BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT"].map((pair) => (
          <div className="market-card" key={pair}>
            <span>{pair}</span>
            <strong>—</strong>
            <small>Market data</small>
          </div>
        ))}
      </div>
    </section>
  );
}
