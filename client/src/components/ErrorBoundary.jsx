import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[App] Uncaught error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
          <div className="card corner-frame" style={{ maxWidth: 460, padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>⚠</div>
            <h2 style={{ fontSize: 24, marginBottom: 10 }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 22 }}>
              An unexpected error occurred. Please reload the page.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Reload
              </button>
              <Link to="/" className="btn btn-ghost">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
