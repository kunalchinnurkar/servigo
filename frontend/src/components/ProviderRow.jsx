import Stars from "./Stars";

export default function ProviderRow({ provider, onRequest, requesting }) {
  return (
    <div className="directory-row">
      <div className="directory-row__main">
        <div className="directory-row__name">{provider.name}</div>
        <div className="directory-row__meta">
          {provider.services.map((s) => (
            <span className="tag" key={s}>
              {s}
            </span>
          ))}
          <Stars value={provider.rating_avg} count={provider.rating_count} />
        </div>
        {provider.address_text && <div className="muted">{provider.address_text}</div>}
      </div>
      <div className="directory-row__distance">{provider.distance_km} km away</div>
      <div className="directory-row__actions">
        <button
          className="btn btn--accent btn--small"
          disabled={requesting}
          onClick={() => onRequest(provider)}
        >
          {requesting ? "Sending..." : "Request service"}
        </button>
      </div>
    </div>
  );
}
