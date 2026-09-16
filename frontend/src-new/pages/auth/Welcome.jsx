import AuthShell from "../../components/auth/AuthShell";
import AuthButton from "../../components/auth/AuthButton";

export default function Welcome({ onLogin, onSignUp }) {
  return (
    <AuthShell
      title={
        <>
          Trade Smarter
          <span className="auth-welcome-title-accent">Grow Faster</span>
        </>
      }
      subtitle="A simple, secure way to explore crypto trading with Bitlora."
    >
      <div className="auth-welcome-content">
        <div className="auth-welcome-features">
          <div className="auth-welcome-feature">
            <span className="auth-welcome-feature-icon">◆</span>
            <div>
              <strong>Simple Trading</strong>
              <p>Explore markets and trading tools in one place.</p>
            </div>
          </div>

          <div className="auth-welcome-feature">
            <span className="auth-welcome-feature-icon">◆</span>
            <div>
              <strong>Secure Access</strong>
              <p>Protect your account with verification and a trading PIN.</p>
            </div>
          </div>

          <div className="auth-welcome-feature">
            <span className="auth-welcome-feature-icon">◆</span>
            <div>
              <strong>Built for Growth</strong>
              <p>Discover spot and futures trading in a clean interface.</p>
            </div>
          </div>
        </div>

        <div className="auth-welcome-actions">
          <AuthButton type="button" onClick={onLogin}>
            Log In
          </AuthButton>

          <AuthButton type="button" variant="secondary" onClick={onSignUp}>
            Create Account
          </AuthButton>
        </div>

        <div className="auth-welcome-dots" aria-label="Welcome screen 1 of 3">
          <span className="active" />
          <span />
          <span />
        </div>
      </div>
    </AuthShell>
  );
}
