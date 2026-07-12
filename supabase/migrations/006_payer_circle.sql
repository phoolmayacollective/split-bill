-- One-way saved contacts for signed-in payers (private circle per owner)

create table payer_circle (
  id uuid primary key default gen_random_uuid(),
  owner_payer_id uuid not null references payers(id) on delete cascade,
  member_payer_id uuid not null references payers(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint payer_circle_owner_member_unique unique (owner_payer_id, member_payer_id),
  constraint payer_circle_no_self check (owner_payer_id <> member_payer_id)
);

create index payer_circle_owner_idx on payer_circle (owner_payer_id);
