import {
  Bell,
  ChevronRight,
  CreditCard,
  FileText,
  Gift,
  KeyRound,
  LifeBuoy,
  LogIn,
  Menu,
  Receipt,
  Settings,
  ShieldCheck,
  Smartphone,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { label: "Profile", icon: User, accountOnly: true },
  { label: "Log In / Log Out", icon: LogIn },
  { label: "2FA Security", icon: ShieldCheck, accountOnly: true },
  { label: "Change Password", icon: KeyRound, accountOnly: true },
  { label: "Devices & Sessions", icon: Smartphone, accountOnly: true },
  { label: "Notifications", icon: Bell },
  { label: "Settings", icon: Settings },
  { label: "Payment / Withdrawal Settings", icon: CreditCard, accountOnly: true },
  { label: "Transaction History", icon: Receipt, accountOnly: true },
  { label: "Referral", icon: Gift },
  { label: "Help & Support", icon: LifeBuoy },
  { label: "Terms / Privacy", icon: FileText },
];

export default function Header({ onNavigate, activePage, isLoggedIn, onLogin, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const goHome = () => {
    setMenuOpen(false);
    onNavigate("Home");
  };

  return (
    <header className="header">
      <div className="header-inner">
        <button className="brand" type="button" onClick={goHome} aria-label="Bitlora home">
          <span className="brand-mark" aria-hidden="true">B</span>
          <span className="brand-name">BITLORA</span>
        </button>

        <div className="header-actions">
          <button className="header-icon-button" type="button" aria-label="Notifications">
            <Bell size={19} strokeWidth={1.9} />
          </button>

          <button
            className={`header-menu-button${menuOpen ? " active" : ""}`}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? (
              <X size={22} strokeWidth={2} />
            ) : (
              <Menu size={22} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="header-menu">
          <div className="header-menu-top">
            <div>
              <strong>Account Menu</strong>
              <span>{isLoggedIn ? "Demo account signed in" : "Public demo environment"}</span>
            </div>
            <button
              type="button"
              className="header-menu-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={19} />
            </button>
          </div>

          <div className="header-menu-list">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label === "Log In / Log Out"
                                  ? (isLoggedIn ? "Log Out" : "Log In")
                                  : item.label}
                  type="button"
                  className={`header-menu-item${item.accountOnly ? " account-item" : ""}`}
                  onClick={() => {
                              if (item.label === "Log In / Log Out") {
                                if (isLoggedIn) {
                                  onLogout();
                                } else {
                                  onLogin();
                                }
                                setMenuOpen(false);
                              }
                            }}
                >
                  <span className="header-menu-item-icon">
                    <Icon size={19} strokeWidth={1.9} />
                  </span>

                  <span className="header-menu-item-label">
                    {item.label}
                    {item.accountOnly && (
                      <small>Available after login</small>
                    )}
                  </span>

                  <ChevronRight size={18} strokeWidth={1.8} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
