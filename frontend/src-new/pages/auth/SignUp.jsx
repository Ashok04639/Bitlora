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
          icon="name"
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

      <div className="auth-social-divider" aria-hidden="true">
        <span></span>
        <em>OR</em>
        <span></span>
      </div>

      <div className="auth-social-actions">
        <button type="button" className="auth-social-button">
          <span className="auth-social-icon auth-google-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path fill="#4285F4" d="M21.35 12.23c0-.7-.06-1.37-.18-2H12v3.79h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.18Z"/>
              <path fill="#34A853" d="M12 21.7c2.64 0 4.86-.87 6.48-2.36l-3.14-2.45c-.87.58-1.98.92-3.34.92-2.56 0-4.73-1.73-5.51-4.06H3.25v2.53A9.8 9.8 0 0 0 12 21.7Z"/>
              <path fill="#FBBC05" d="M6.49 13.75A5.9 5.9 0 0 1 6.18 12c0-.61.11-1.2.31-1.75V7.72H3.25A9.77 9.77 0 0 0 2.2 12c0 1.57.38 3.05 1.05 4.28l3.24-2.53Z"/>
              <path fill="#EA4335" d="M12 6.19c1.44 0 2.73.5 3.75 1.49l2.81-2.81C16.86 3.3 14.64 2.3 12 2.3a9.8 9.8 0 0 0-8.75 5.42l3.24 2.53C7.27 7.92 9.44 6.19 12 6.19Z"/>
            </svg>
          </span>
          <span>Continue with Google</span>
        </button>

        <button type="button" className="auth-social-button">
          <span className="auth-social-icon auth-apple-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path
                fill="currentColor"
                d="M17.05 12.54c-.02-2.02 1.65-2.99 1.73-3.04a3.72 3.72 0 0 0-2.93-1.58c-1.24-.13-2.43.74-3.06.74-.64 0-1.61-.72-2.65-.7a3.92 3.92 0 0 0-3.3 2.01c-1.42 2.47-.36 6.11 1.02 8.12.68.98 1.48 2.08 2.54 2.04 1.02-.04 1.4-.65 2.63-.65 1.22 0 1.57.65 2.64.63 1.1-.02 1.8-1 2.46-1.98a8.08 8.08 0 0 0 1.12-2.3 3.56 3.56 0 0 1-2.2-3.29Zm-2.01-5.93a3.56 3.56 0 0 0 .82-2.55 3.62 3.62 0 0 0-2.35 1.22 3.38 3.38 0 0 0-.85 2.46 2.99 2.99 0 0 0 2.38-1.13Z"
              />
            </svg>
          </span>
          <span>Continue with Apple</span>
        </button>
      </div>
    </AuthShell>
  );
}
