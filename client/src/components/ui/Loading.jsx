export function Spinner({ size = 22, label }) {
  return (
    <div className="page-loader" style={{ minHeight: 'auto', flexDirection: 'row', gap: 12 }}>
      <div className="spinner" style={{ width: size, height: size }} />
      {label && <span>{label}</span>}
    </div>
  );
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="page-loader">
      <div className="spinner" />
      <p className="mono" style={{ color: 'var(--text-3)', letterSpacing: '0.08em' }}>
        {label}
      </p>
    </div>
  );
}
