import "./CoinLogo.css";

const logoModules = import.meta.glob(
  "../assets/coins/*.{png,jpg,jpeg,webp,svg}",
  {
    eager: true,
    import: "default",
  }
);

const LOGOS = Object.fromEntries(
  Object.entries(logoModules).map(([path, url]) => {
    const filename = path.split("/").pop() || "";
    const dot = filename.lastIndexOf(".");
    const key = (
      dot > 0 ? filename.slice(0, dot) : filename
    ).toLowerCase();

    return [key, url];
  })
);

export default function CoinLogo({
  coin,
  name = "Coin",
  className = "",
}) {
  const key = String(coin || "").toLowerCase();
  const src = LOGOS[key];

  return (
    <span
      className={`coin-logo ${className}`.trim()}
      aria-label={`${name} logo`}
    >
      {src ? (
        <img
          className="coin-logo-image"
          src={src}
          alt=""
          aria-hidden="true"
        />
      ) : (
        <span
          className="coin-logo-fallback"
          aria-hidden="true"
        />
      )}
    </span>
  );
}
