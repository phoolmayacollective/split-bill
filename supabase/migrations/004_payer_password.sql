-- Password hash for payer bill view (derived client-side; server stores hash only)

alter table bills
  add column payer_password_hash text;
