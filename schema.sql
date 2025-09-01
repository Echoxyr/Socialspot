diff --git a/schema.sql b/schema.sql
index d4adb774b082e3c048a3fb94307cd0b9d70320c0..f364c1161e7c1e92ed95a4d899d461f01d917ce7 100644
--- a/schema.sql
+++ b/schema.sql
@@ -43,61 +43,71 @@ create table if not exists public.profiles (
   updated_at timestamptz default now()
 );
 
 -- Tabella eventi
 create table if not exists public.events (
   id uuid primary key default gen_random_uuid(),
   creator_id uuid references public.profiles(id) on delete cascade not null,
   title text not null,
   description text,
   category text,
   event_date timestamptz not null,
   end_date timestamptz,
   location text not null,
   latitude double precision,
   longitude double precision,
   max_participants integer,
   is_private boolean default false,
   requirements text,
   tags text[] default '{}',
   images text[] default '{}',
   status text default 'active' check (status in ('active', 'cancelled', 'completed')),
   created_at timestamptz default now(),
   updated_at timestamptz default now()
 );
 
+-- Ensure the status column exists for existing installations
+alter table public.events
+  add column if not exists status text default 'active'
+    check (status in ('active', 'cancelled', 'completed'));
+
 -- Tabella partecipanti eventi (per conteggi corretti)
 create table if not exists public.event_participants (
   id uuid primary key default gen_random_uuid(),
   event_id uuid references public.events(id) on delete cascade not null,
   user_id uuid references public.profiles(id) on delete cascade not null,
   status text default 'confirmed' check (status in ('confirmed', 'pending', 'cancelled')),
   joined_at timestamptz default now(),
   -- Evita partecipazioni duplicate
   unique(event_id, user_id)
 );
 
+-- Ensure the status column exists for existing installations
+alter table public.event_participants
+  add column if not exists status text default 'confirmed'
+    check (status in ('confirmed', 'pending', 'cancelled'));
+
 -- Tabella favoriti eventi
 create table if not exists public.event_favorites (
   id uuid primary key default gen_random_uuid(),
   event_id uuid references public.events(id) on delete cascade not null,
   user_id uuid references public.profiles(id) on delete cascade not null,
   created_at timestamptz default now(),
   -- Evita favoriti duplicati
   unique(event_id, user_id)
 );
 
 -- Tabella commenti eventi
 create table if not exists public.event_comments (
   id uuid primary key default gen_random_uuid(),
   event_id uuid references public.events(id) on delete cascade not null,
   user_id uuid references public.profiles(id) on delete cascade not null,
   parent_id uuid references public.event_comments(id) on delete cascade,
   content text not null,
   likes integer default 0,
   is_edited boolean default false,
   created_at timestamptz default now(),
   updated_at timestamptz default now()
 );
 
 -- Tabella chat di gruppo eventi
 create table if not exists public.event_chats (
