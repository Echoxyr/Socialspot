-- ========================================
-- SOCIALSPOT - DATABASE SCHEMA AGGIORNATO
-- ========================================
-- Schema completo per tutte le funzionalità richieste:
-- - Profili utente
-- - Eventi con creator_id corretto
-- - Partecipanti eventi (per conteggi corretti)
-- - Favoriti eventi
-- - Commenti eventi
-- - Chat di gruppo eventi
-- - RLS (Row Level Security) configurato

-- ✅ 1. ELIMINA EVENTUALI TABELLE ESISTENTI (solo se necessario)
-- drop table if exists public.event_chats cascade;
-- drop table if exists public.event_comments cascade;
-- drop table if exists public.event_favorites cascade;
-- drop table if exists public.event_participants cascade;
-- drop table if exists public.events cascade;
-- drop table if exists public.profiles cascade;

-- ✅ 2. CREA LE TABELLE PRINCIPALI

-- Tabella profili utente
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  interests text[] default '{}',
  created_at timestamptz default now(),
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
  location text not null,
  latitude double precision,
  longitude double precision,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabella partecipanti eventi (per conteggi corretti)
create table if not exists public.event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  -- Evita partecipazioni duplicate
  unique(event_id, user_id)
);

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
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabella chat di gruppo eventi
create table if not exists public.event_chats (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- ✅ 3. INDICI PER PERFORMANCE

-- Indici per eventi
create index if not exists idx_events_creator_id on public.events(creator_id);
create index if not exists idx_events_event_date on public.events(event_date);
create index if not exists idx_events_category on public.events(category);

-- Indici per partecipanti
create index if not exists idx_event_participants_event_id on public.event_participants(event_id);
create index if not exists idx_event_participants_user_id on public.event_participants(user_id);

-- Indici per favoriti
create index if not exists idx_event_favorites_event_id on public.event_favorites(event_id);
create index if not exists idx_event_favorites_user_id on public.event_favorites(user_id);

-- Indici per commenti
create index if not exists idx_event_comments_event_id on public.event_comments(event_id);
create index if not exists idx_event_comments_created_at on public.event_comments(created_at);

-- Indici per chat
create index if not exists idx_event_chats_event_id on public.event_chats(event_id);
create index if not exists idx_event_chats_created_at on public.event_chats(created_at);

-- ✅ 4. TRIGGER PER UPDATED_AT

-- Funzione per aggiornare updated_at
create or replace function public.handle_updated_at()
returns trigger as $
begin
  new.updated_at = now();
  return new;
end;
$ language plpgsql;

-- Trigger per profiles
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Trigger per events
drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at
  before update on public.events
  for each row execute function public.handle_updated_at();

-- Trigger per comments
drop trigger if exists event_comments_updated_at on public.event_comments;
create trigger event_comments_updated_at
  before update on public.event_comments
  for each row execute function public.handle_updated_at();

-- ✅ 5. ROW LEVEL SECURITY (RLS)

-- Abilita RLS su tutte le tabelle
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.event_favorites enable row level security;
alter table public.event_comments enable row level security;
alter table public.event_chats enable row level security;

-- ✅ 6. POLICY PER PROFILES
drop policy if exists "Anyone can read profiles" on public.profiles;
create policy "Anyone can read profiles" 
  on public.profiles for select 
  using (true);

drop policy if exists "Users can insert/update only their profile" on public.profiles;
create policy "Users can insert/update only their profile"
  on public.profiles for all 
  using (auth.uid() = id) 
  with check (auth.uid() = id);

-- ✅ 7. POLICY PER EVENTS
drop policy if exists "Anyone can read events" on public.events;
create policy "Anyone can read events" 
  on public.events for select 
  using (true);

drop policy if exists "Users can insert events" on public.events;
create policy "Users can insert events" 
  on public.events for insert 
  with check (auth.uid() = creator_id);

drop policy if exists "Users can update their events" on public.events;
create policy "Users can update their events" 
  on public.events for update 
  using (auth.uid() = creator_id);

drop policy if exists "Users can delete their events" on public.events;
create policy "Users can delete their events" 
  on public.events for delete 
  using (auth.uid() = creator_id);

-- ✅ 8. POLICY PER EVENT_PARTICIPANTS
drop policy if exists "Anyone can read participants" on public.event_participants;
create policy "Anyone can read participants" 
  on public.event_participants for select 
  using (true);

drop policy if exists "Users can insert their participation" on public.event_participants;
create policy "Users can insert their participation" 
  on public.event_participants for insert 
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their participation" on public.event_participants;
create policy "Users can delete their participation" 
  on public.event_participants for delete 
  using (auth.uid() = user_id);

-- ✅ 9. POLICY PER EVENT_FAVORITES
drop policy if exists "Anyone can read favorites" on public.event_favorites;
create policy "Anyone can read favorites" 
  on public.event_favorites for select 
  using (true);

drop policy if exists "Users can manage their favorites" on public.event_favorites;
create policy "Users can manage their favorites" 
  on public.event_favorites for all 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

-- ✅ 10. POLICY PER EVENT_COMMENTS
drop policy if exists "Anyone can read comments" on public.event_comments;
create policy "Anyone can read comments" 
  on public.event_comments for select 
  using (true);

drop policy if exists "Users can insert comments" on public.event_comments;
create policy "Users can insert comments" 
  on public.event_comments for insert 
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their comments" on public.event_comments;
create policy "Users can update their comments" 
  on public.event_comments for update 
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their comments" on public.event_comments;
create policy "Users can delete their comments" 
  on public.event_comments for delete 
  using (auth.uid() = user_id);

-- ✅ 11. POLICY PER EVENT_CHATS
drop policy if exists "Anyone can read chats" on public.event_chats;
create policy "Anyone can read chats" 
  on public.event_chats for select 
  using (true);

drop policy if exists "Users can insert chats" on public.event_chats;
create policy "Users can insert chats" 
  on public.event_chats for insert 
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their chats" on public.event_chats;
create policy "Users can update their chats" 
  on public.event_chats for update 
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their chats" on public.event_chats;
create policy "Users can delete their chats" 
  on public.event_chats for delete 
  using (auth.uid() = user_id);

-- ✅ 12. FUNZIONI UTILI

-- Funzione per ottenere statistiche utente
create or replace function public.get_user_stats(user_uuid uuid)
returns table(
  events_created bigint,
  events_participated bigint,
  total_points bigint,
  user_level bigint
) as $
begin
  return query
  select 
    (select count(*) from public.events where creator_id = user_uuid) as events_created,
    (select count(*) from public.event_participants ep 
     join public.events e on ep.event_id = e.id 
     where ep.user_id = user_uuid and e.creator_id != user_uuid) as events_participated,
    ((select count(*) from public.events where creator_id = user_uuid) * 5 +
     (select count(*) from public.event_participants ep 
      join public.events e on ep.event_id = e.id 
      where ep.user_id = user_uuid and e.creator_id != user_uuid) * 2) as total_points,
    (((select count(*) from public.events where creator_id = user_uuid) * 5 +
     (select count(*) from public.event_participants ep 
      join public.events e on ep.event_id = e.id 
      where ep.user_id = user_uuid and e.creator_id != user_uuid) * 2) / 100 + 1) as user_level;
end;
$ language plpgsql security definer;

-- ✅ 13. REALTIME SUBSCRIPTIONS
-- Abilita realtime per le chat
alter publication supabase_realtime add table public.event_chats;

-- ✅ 14. DATI DI ESEMPIO (opzionale)
-- Inserisci solo se le tabelle sono vuote

-- insert into public.profiles (id, username, interests) values
--   ('00000000-0000-0000-0000-000000000001', 'Mario Rossi', '{"Sport", "Musica"}'),
--   ('00000000-0000-0000-0000-000000000002', 'Anna Verdi', '{"Arte", "Cultura"}')
-- on conflict (id) do nothing;

-- insert into public.events (creator_id, title, description, category, event_date, location) values
--   ('00000000-0000-0000-0000-000000000001', 'Partita di calcetto', 'Partita amichevole al campo comunale', 'Sport', now() + interval '1 week', 'Campo Comunale, Milano'),
--   ('00000000-0000-0000-0000-000000000002', 'Visita al museo', 'Esploriamo insieme il Museo della Scienza', 'Cultura', now() + interval '3 days', 'Museo della Scienza, Milano')
-- on conflict (id) do nothing;

-- ========================================
-- FINE SCHEMA - PRONTO PER L'USO! 
-- ========================================

-- Per applicare questo schema:
-- 1. Copia tutto il contenuto
-- 2. Vai su Supabase Dashboard > SQL Editor
-- 3. Incolla ed esegui lo script
-- 4. Verifica che tutte le tabelle e policy siano create correttamente
