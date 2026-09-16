import logo from "../../assets/bitlora-auth-logo-transparent.png";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="auth-shell">
      <section className="auth-shell-card">
        <div className="auth-shell-brand" aria-label="Bitlora">
          <img
            src={logo}
            alt="Bitlora"
            className="auth-shell-logo"
          />
        </div>

        <div className="auth-shell-heading">
          {title && <h1>{title}</h1>}
          {subtitle && <p>{subtitle}</p>}
        </div>

        <div className="auth-shell-content">{children}</div>

        {footer && (
          <div className="auth-shell-footer">
            {footer}
          </div>
        )}
      </section>
    </main>
  );
}
