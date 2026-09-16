import { useState } from "react";
import AuthShell from "../../components/auth/AuthShell";
import AuthInput from "../../components/auth/AuthInput";
import AuthButton from "../../components/auth/AuthButton";

export default function ForgotPassword({
  onSendReset,
  onBackToLogin,
}) {
  const [identifier, setIdentifier] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!identifier.trim()) return;

    onSendReset?.({
      identifier: identifier.trim(),
    });
  };

  return (
    <AuthShell
      title="Forgot Password?"
      subtitle="Enter your email or phone and we'll help you recover your account."
      footer={
        <button type="button" onClick={onBackToLogin}>
          Back to Log In
        </button>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthInput
          id="forgot-identifier"
          name="identifier"
          label="Email or Phone"
          placeholder="Enter your email or phone"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          autoComplete="username"
        />

        <AuthButton type="submit">
          Send Reset Link
        </AuthButton>
      </form>
    </AuthShell>
  );
}
