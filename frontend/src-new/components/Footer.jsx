const navigation = [
  { label: "Home", icon: "⌂" },
  { label: "Markets", icon: "◈" },
  { label: "Trade", icon: "⇄" },
  { label: "Futures", icon: "⌁" },
  { label: "Wallet", icon: "▣" },
];

export default function Footer({ activePage, onNavigate }) {
  return (
    <footer className="footer">
      <nav className="footer-nav" aria-label="Primary navigation">
        {navigation.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`footer-nav-item${activePage === item.label ? " active" : ""}`}
            onClick={() => onNavigate(item.label)}
          >
            <span className="footer-nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="footer-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="footer-desktop">
        <strong>BITLORA</strong>
        <span>Demo environment · © 2026 Bitlora</span>
      </div>
    </footer>
  );
}
