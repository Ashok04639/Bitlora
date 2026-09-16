import { useState } from "react";
import AuthShell from "../../components/auth/AuthShell";
import AuthButton from "../../components/auth/AuthButton";

export default function CreatePIN({
  onCreatePIN,
  onSkip,
  onBack,
}) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handlePinChange = (event) => {
    setPin(event.target.value.replace(/\D/g, "").slice(0, 6));
  };

  const handleConfirmChange = (event) => {
    setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 6));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (pin.length !== 6 || confirmPin.length !== 6 || pin !== confirmPin) {
      return;
    }

    onCreatePIN?.(pin);
  };

  return (
    <AuthShell
      onBack={onBack}
      title="Create your PIN"
      subtitle="Set a 6-digit PIN for quick and secure access."
      footer={
        <button type="button" onClick={onSkip}>
          Skip for now
        </button>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-otp-field">
          <label htmlFor="create-pin">PIN</label>
          <input
            id="create-pin"
            name="pin"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            placeholder="Enter 6-digit PIN"
            value={pin}
            onChange={handlePinChange}
            maxLength={6}
          />
        </div>

        <div className="auth-otp-field">
          <label htmlFor="confirm-pin">Confirm PIN</label>
          <input
            id="confirm-pin"
            name="confirmPin"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            placeholder="Confirm your PIN"
            value={confirmPin}
            onChange={handleConfirmChange}
            maxLength={6}
          />
        </div>

        <AuthButton
          type="submit"
          disabled={
            pin.length !== 6 ||
            confirmPin.length !== 6 ||
            pin !== confirmPin
          }
        >
          Create PIN
        </AuthButton>
      </form>
    </AuthShell>
  );
}
