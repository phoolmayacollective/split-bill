-- Track when each ower marks themselves as paid (self-reported settlement).

create table ower_payments (
  bill_id uuid not null references bills(id) on delete cascade,
  ower_name text not null,
  paid_at timestamptz not null default now(),
  primary key (bill_id, ower_name)
);

create index ower_payments_bill_id_idx on ower_payments (bill_id);
