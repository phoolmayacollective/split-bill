-- Payer accounts (optional — guest bills have no payer_id)

create table payers (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  constraint payers_username_unique unique (username)
);

create index payers_username_idx on payers (username);

alter table bills
  add column payer_id uuid references payers(id) on delete set null;

create index bills_payer_id_idx on bills (payer_id);
