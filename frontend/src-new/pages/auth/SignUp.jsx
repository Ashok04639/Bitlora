import { useState } from "react";
import AuthShell from "../../components/auth/AuthShell";
import AuthInput from "../../components/auth/AuthInput";
import AuthButton from "../../components/auth/AuthButton";

export default function SignUp({
  onCreateAccount,
  onLogin,
}) {
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !fullName.trim() ||
      !identifier.trim() ||
      !password ||
      !confirmPassword ||
      password !== confirmPassword ||
      !acceptedTerms
    ) {
      return;
    }

    onCreateAccount?.({
      fullName: fullName.trim(),
      identifier: identifier.trim(),
    });
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Bitlora and start your crypto journey."
      footer={
        <p>
          Already have an account?{" "}
          <button type="button" onClick={onLogin}>
            Log In
          </button>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthInput
          id="signup-full-name"
          name="fullName"
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          autoComplete="name"
        />

        <AuthInput
          id="signup-identifier"
          name="identifier"
          label="Email or Phone"
          placeholder="Enter your email or phone"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          autoComplete="username"
        />

        <AuthInput
          id="signup-password"
          name="password"
          type="password"
          label="Password"
          placeholder="Create a password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
        />

        <AuthInput
          id="signup-confirm-password"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
        />

        <label className="auth-checkbox auth-terms">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
          />
          <span>
            I agree to the Terms of Service and Privacy Policy.
          </span>
        </label>

        <AuthButton type="submit">
          Create Account
        </AuthButton>
      </form>
    </AuthShell>
  );
}
