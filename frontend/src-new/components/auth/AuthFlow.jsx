import { useState } from "react";
import Welcome from "../../pages/auth/Welcome";
import Login from "../../pages/auth/Login";
import SignUp from "../../pages/auth/SignUp";
import ForgotPassword from "../../pages/auth/ForgotPassword";
import OTPVerification from "../../pages/auth/OTPVerification";
import CreatePIN from "../../pages/auth/CreatePIN";
import {
  clearDemoSession,
  createDemoAccount,
  createDemoPIN,
  loginDemoAccount,
  requestDemoPasswordReset,
  verifyDemoOTP,
} from "../../services/authDemo";

export default function AuthFlow({ onAuthenticated }) {
  const [screen, setScreen] = useState("login");
  const [identifier, setIdentifier] = useState("");

  const handleLogin = ({ identifier: nextIdentifier }) => {
    const result = loginDemoAccount({
      identifier: nextIdentifier,
    });

    if (!result.ok) return;

    setIdentifier(nextIdentifier);
    setScreen("otp");
  };

  const handleCreateAccount = ({ fullName, identifier: nextIdentifier }) => {
    const result = createDemoAccount({
      fullName,
      identifier: nextIdentifier,
    });

    if (!result.ok) return;

    setIdentifier(nextIdentifier);
    setScreen("otp");
  };

  const handleVerifyOTP = (otp) => {
    const result = verifyDemoOTP(otp);

    if (!result.ok) return;

    setScreen("create-pin");
  };

  const handleCreatePIN = (pin) => {
    const result = createDemoPIN(pin);

    if (!result.ok) return;

    onAuthenticated?.();
  };

  const handleSkipPIN = () => {
    onAuthenticated?.();
  };

  const handlePasswordReset = ({ identifier: nextIdentifier }) => {
    const result = requestDemoPasswordReset(nextIdentifier);

    if (!result.ok) return;

    setIdentifier(nextIdentifier);
    setScreen("login");
  };

  const handleLogout = () => {
    clearDemoSession();
    setScreen("welcome");
  };

  switch (screen) {
    case "login":
      return (
        <Login
          onLogin={handleLogin}
          onSignUp={() => setScreen("signup")}
          onForgotPassword={() => setScreen("forgot-password")}
        />
      );

    case "signup":
      return (
        <SignUp
          onCreateAccount={handleCreateAccount}
          onLogin={() => setScreen("login")}
        />
      );

    case "forgot-password":
      return (
        <ForgotPassword
          onSendReset={handlePasswordReset}
          onBackToLogin={() => setScreen("login")}
        />
      );

    case "otp":
      return (
        <OTPVerification
          destination={identifier}
          onVerify={handleVerifyOTP}
          onResend={() => {}}
          onBack={() => setScreen("login")}
        />
      );

    case "create-pin":
      return (
        <CreatePIN
          onCreatePIN={handleCreatePIN}
          onSkip={handleSkipPIN}
        />
      );

    case "welcome":
    default:
      return (
        <Welcome
          onLogin={() => setScreen("login")}
          onSignUp={() => setScreen("signup")}
        />
      );
  }
}
