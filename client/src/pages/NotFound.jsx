import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <h1 className="mono grad-text" style={{ fontSize: 96, lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: 26, margin: '16px 0 10px' }}>Endpoint not found</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 28 }}>The page or route you requested does not exist.</p>
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      </div>
    </div>
  );
}
