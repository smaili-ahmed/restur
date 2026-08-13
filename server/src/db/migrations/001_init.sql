CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS connections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address  TEXT NOT NULL,
  user_agent  TEXT,
  status      TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'blocked')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blocked_ips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address  TEXT NOT NULL UNIQUE,
  reason      TEXT NOT NULL DEFAULT 'Manual block',
  blocked_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  blocked_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  unblocked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS security_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address  TEXT,
  event_type  TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_connections_user_id   ON connections (user_id);
CREATE INDEX IF NOT EXISTS idx_connections_ip        ON connections (ip_address);
CREATE INDEX IF NOT EXISTS idx_connections_created   ON connections (created_at);
CREATE INDEX IF NOT EXISTS idx_events_ip             ON security_events (ip_address);
CREATE INDEX IF NOT EXISTS idx_events_created        ON security_events (created_at);
CREATE INDEX IF NOT EXISTS idx_events_type           ON security_events (event_type);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip        ON blocked_ips (ip_address);
