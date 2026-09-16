export default function AuthInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  autoComplete,
  disabled = false,
  error,
  helperText,
  icon,
}) {
  const iconType = icon || (type === "password" ? "password" : "email");

  return (
    <div className="auth-input">
      {label && (
        <label htmlFor={id}>
          {label}
        </label>
      )}

      <div className="auth-input-field">
        <span className="auth-input-icon" aria-hidden="true">
          {iconType === "password" ? (
            <svg viewBox="0 0 24 24">
              <rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="15" r="1.2" fill="currentColor" />
            </svg>
          ) : iconType === "name" ? (
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M5.5 19c.7-3.1 3.1-5 6.5-5s5.8 1.9 6.5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <rect x="3.5" y="5" width="17" height="14" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="m5.5 7 6.5 5 6.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>

        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error || helperText ? `${id}-message` : undefined
          }
        />
      </div>

      {(error || helperText) && (
        <span
          id={`${id}-message`}
          className={error ? "auth-input-error" : "auth-input-helper"}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
}
