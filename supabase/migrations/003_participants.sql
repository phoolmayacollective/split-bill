-- Optional participant roster on bills (names added at create time)

alter table bills
  add column participants jsonb not null default '[]'::jsonb;
