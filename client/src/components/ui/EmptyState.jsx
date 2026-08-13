export function EmptyState({ icon = '◈', title = 'No data', sub = 'Nothing to display yet.' }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-3)' }}>
      <div style={{ fontSize: 34, marginBottom: 12, opacity: 0.5 }}>{icon}</div>
      <p style={{ fontFamily: 'var(--font-display)', color: 'var(--text-2)', fontSize: 17 }}>{title}</p>
      <p style={{ fontSize: 13, marginTop: 4 }}>{sub}</p>
    </div>
  );
}
