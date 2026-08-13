export function Badge({ status, children, dot = true }) {
  const map = {
    success: 'success',
    allowed: 'success',
    secure: 'success',
    active: 'success',
    failed: 'danger',
    blocked: 'danger',
    denied: 'danger',
    warning: 'warn',
    pending: 'warn',
    info: 'info',
    user: 'info',
    admin: 'warn',
    blocked_ip: 'danger',
  };
  const tone = map[status] || (children ? 'muted' : 'info');
  return (
    <span className={`badge badge-${tone}`}>
      {dot && <span className="dot" />}
      {children || (status && status.replace(/_/g, ' '))}
    </span>
  );
}
