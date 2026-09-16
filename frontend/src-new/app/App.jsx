import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Home from "../pages/Home";
import Markets from "../pages/Markets";
import Trade from "../pages/Trade";
import Futures from "../pages/Futures";
import Wallet from "../pages/Wallet";
import AuthFlow from "../components/auth/AuthFlow";

const pages = {
  Home,
  Markets,
  Trade,
  Futures,
  Wallet,
};

export default function App() {
  const [activePage, setActivePage] = useState("Home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const swipeStartRef = useRef(null);

  const pageOrder = ["Home", "Markets", "Trade", "Futures", "Wallet"];

  useEffect(() => {
    const handleTouchStart = (event) => {
      if (event.touches.length !== 1) return;

      const target = event.target;

      if (
        target.closest(
          "button, input, textarea, select, a, [role='button'], [data-no-swipe]"
        )
      ) {
        swipeStartRef.current = null;
        return;
      }

      const touch = event.touches[0];

      swipeStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    };

    const handleTouchEnd = (event) => {
      const start = swipeStartRef.current;
      swipeStartRef.current = null;

      if (!start || event.changedTouches.length !== 1) return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;

      const horizontalDistance = Math.abs(deltaX);
      const verticalDistance = Math.abs(deltaY);

      if (horizontalDistance < 70) return;
      if (horizontalDistance <= verticalDistance * 1.25) return;

      const currentIndex = pageOrder.indexOf(activePage);
      if (currentIndex === -1) return;

      const nextIndex =
        deltaX < 0
          ? Math.min(currentIndex + 1, pageOrder.length - 1)
          : Math.max(currentIndex - 1, 0);

      if (nextIndex !== currentIndex) {
        setActivePage(pageOrder[nextIndex]);
      }
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    document.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activePage]);

  useEffect(() => {
    const handleDemoLogin = () => setIsLoggedIn(true);
    window.addEventListener("bitlora-login", handleDemoLogin);

    return () => window.removeEventListener("bitlora-login", handleDemoLogin);
  }, []);

  useEffect(() => {
    const handleLogin = () => setIsLoggedIn(true);

    window.addEventListener("bitlora:login", handleLogin);

    return () => {
      window.removeEventListener("bitlora:login", handleLogin);
    };
  }, []);

  const Page = pages[activePage];

  if (!isLoggedIn) {
    return (
      <div className="app">
        <AuthFlow
          onAuthenticated={() => setIsLoggedIn(true)}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        onNavigate={setActivePage}
        isLoggedIn={isLoggedIn}
        onLogin={() => setIsLoggedIn(true)}
        onLogout={() => setIsLoggedIn(false)}
      />

      <main className="page">
        <Page isLoggedIn={isLoggedIn} onNavigate={setActivePage} />
      </main>

      <Footer
        activePage={activePage}
        onNavigate={setActivePage}
      />
    </div>
  );
}
