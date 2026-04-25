-- supabase/migrations/001_initial.sql

CREATE TABLE x_accounts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username     text NOT NULL UNIQUE,
  display_name text,
  rss_url      text NOT NULL,
  active       boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE digests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date            date NOT NULL UNIQUE,
  overall_summary text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE digest_entries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  digest_id     uuid NOT NULL REFERENCES digests(id) ON DELETE CASCADE,
  x_account_id  uuid NOT NULL REFERENCES x_accounts(id) ON DELETE CASCADE,
  summary       text NOT NULL,
  post_count    int NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
