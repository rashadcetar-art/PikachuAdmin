-- Jalankan di Supabase SQL Editor.
-- Buat user admin melalui Authentication > Users terlebih dahulu,
-- lalu tambahkan UUID user tersebut ke tabel admin_users (lihat README).
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  owner text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  checkin_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.devices enable row level security;

-- Admin hanya dapat membaca baris keanggotaannya sendiri.
drop policy if exists "admin can read own membership" on public.admin_users;
create policy "admin can read own membership" on public.admin_users
for select to authenticated using (user_id = auth.uid());

-- Semua operasi data perangkat hanya untuk user yang dimasukkan pemilik ke admin_users.
drop policy if exists "admins manage devices" on public.devices;
create policy "admins manage devices" on public.devices
for all to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
revoke all on public.devices from anon, authenticated;
grant select, insert, update, delete on public.devices to authenticated;
