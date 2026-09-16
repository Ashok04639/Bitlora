export default function AuthButton({
  children,
  type = "button",
  variant = "primary",
  onClick,
  disabled = false,
  loading = false,
}) {
  return (
    <button
      type={type}
      className={`auth-button auth-button-${variant}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
