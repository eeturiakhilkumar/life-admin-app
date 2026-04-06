create extension if not exists "pgcrypto";

create type public.item_type as enum (
  'bill',
  'appointment',
  'renewal',
  'important_date',
  'shopping_list',
  'document'
);

create type public.item_status as enum (
  'draft',
  'active',
  'completed',
  'archived'
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  locale text default 'en-IN' not null,
  timezone text default 'Asia/Kolkata' not null,
  created_at timestamptz default now() not null
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  type public.item_type not null,
  status public.item_status not null default 'active',
  title text not null,
  subtitle text,
  due_at timestamptz,
  starts_at timestamptz,
  amount numeric(12,2),
  currency text,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  channel text not null default 'push',
  scheduled_for timestamptz not null,
  offset_minutes integer not null default 0,
  delivered_at timestamptz,
  created_at timestamptz default now() not null
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  mime_type text not null,
  storage_path text not null,
  summary text,
  extracted_text_status text not null default 'pending',
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null
);

create table if not exists public.document_links (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  relation text not null default 'supporting',
  created_at timestamptz default now() not null
);

create table if not exists public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  label text not null,
  quantity numeric(10,2),
  unit text,
  checked boolean default false not null,
  created_at timestamptz default now() not null
);

create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid references public.items(id) on delete set null,
  prompt_type text not null,
  status text not null default 'queued',
  prompt_input jsonb default '{}'::jsonb not null,
  response_payload jsonb,
  confirmed_at timestamptz,
  created_at timestamptz default now() not null
);

create index if not exists items_owner_due_idx on public.items(owner_id, due_at);
create index if not exists items_owner_type_idx on public.items(owner_id, type);
create index if not exists reminders_owner_scheduled_idx on public.reminders(owner_id, scheduled_for);
create index if not exists ai_runs_owner_created_idx on public.ai_runs(owner_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.reminders enable row level security;
alter table public.documents enable row level security;
alter table public.document_links enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.ai_runs enable row level security;

create policy "profiles are self readable" on public.profiles
for select using (auth.uid() = id);

create policy "profiles are self writable" on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "items owner access" on public.items
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "reminders owner access" on public.reminders
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "documents owner access" on public.documents
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "document links via owned item" on public.document_links
for all using (
  exists (
    select 1
    from public.items
    where public.items.id = document_links.item_id
      and public.items.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.items
    where public.items.id = document_links.item_id
      and public.items.owner_id = auth.uid()
  )
);

create policy "shopping list items owner access" on public.shopping_list_items
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "ai runs owner access" on public.ai_runs
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

