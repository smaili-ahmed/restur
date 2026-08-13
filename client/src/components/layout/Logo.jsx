import { Link } from 'react-router-dom';

export function Logo({ to = '/', size = 34, brand = 'cyberguard' }) {
  const isRestaurant = brand === 'restaurant';

  return (
    <Link to={to} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#7c4dff" />
          </linearGradient>
        </defs>
        <path fill="url(#lg)" d="M16 2l12 4v9c0 8.5-5.2 13.7-12 17C9.2 28.7 4 23.5 4 15V6l12-4z" />
        {isRestaurant ? (
          <text x="16" y="22" textAnchor="middle" fontSize="16" fill="#05070f">🍽</text>
        ) : (
          <path fill="#05070f" d="M12 10h8v2h-3v10h-2V12h-3v-2z" />
        )}
      </svg>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, letterSpacing: '0.02em' }}>
        {isRestaurant ? (
          <>
            LE <span className="grad-text">GOURMET</span>
          </>
        ) : (
          <>
            CYBER<span className="grad-text">GUARD</span>
          </>
        )}
      </span>
    </Link>
  );
}
