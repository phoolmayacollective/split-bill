-- Bill splitter schema: bills + claims

create table bills (
  id uuid primary key default gen_random_uuid(),
  items jsonb not null default '[]'::jsonb,
  totals jsonb not null default '{"subtotal": 0, "tax": 0, "tip": 0, "total": 0}'::jsonb,
  payment_enc text,
  payment_iv text,
  payment_salt text,
  kdf_iterations int,
  created_at timestamptz not null default now()
);

create table claims (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references bills(id) on delete cascade,
  ower_name text not null,
  item_id text not null,
  share numeric not null default 1 check (share > 0),
  created_at timestamptz not null default now()
);

create index claims_bill_id_idx on claims (bill_id);
create index claims_bill_ower_idx on claims (bill_id, ower_name);
