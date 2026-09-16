import { useState } from "react";
import AuthShell from "../../components/auth/AuthShell";
import AuthButton from "../../components/auth/AuthButton";

export default function OTPVerification({
  destination,
  onVerify,
  onResend,
  onBack,
}) {
  const [otp, setOtp] = useState("");

  const handleChange = (event) => {
    const nextValue = event.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(nextValue);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (otp.length !== 6) return;

    onVerify?.(otp);
  };

  return (
    <AuthShell
      title="Verify your account"
      subtitle={
        destination
          ? `Enter the 6-digit code sent to ${destination}.`
          : "Enter the 6-digit verification code."
      }
      footer={
        <button type="button" onClick={onBack}>
          Back
        </button>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-otp-field">
          <label htmlFor="auth-otp">Verification Code</label>
          <input
            id="auth-otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            value={otp}
            onChange={handleChange}
            maxLength={6}
            aria-label="6-digit verification code"
          />
        </div>

        <AuthButton type="submit" disabled={otp.length !== 6}>
          Verify OTP
        </AuthButton>

        <button
          type="button"
          className="auth-link-button auth-resend-button"
          onClick={onResend}
        >
          Resend OTP
        </button>
      </form>
    </AuthShell>
  );
}
