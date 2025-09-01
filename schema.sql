-- ========================================
-- SOCIALSPOT - DATABASE SCHEMA COMPLETO
-- ========================================
-- Schema completo per tutte le funzionalità richieste:
-- - Profili utente con badge e achievements
-- - Eventi con creator_id corretto
-- - Partecipanti eventi (per conteggi corretti)
-- - Favoriti eventi
-- - Commenti eventi
-- - Chat di gruppo eventi
-- - Sistema di notifiche
-- - Badge e achievements
-- - Messaggi privati
-- - RLS (Row Level Security) configurato

-- ✅ 1. ELIMINA EVENTUALI TABELLE ESISTENTI (solo se necessario)
-- drop table if exists public.notifications cascade;
-- drop table if exists public.user_badges cascade;
-- drop table if exists public.badges cascade;
-- drop table if exists public.private_messages cascade;
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
  bio text,
  interests text[] default '{}',
  location text,
  website text,
  social_links jsonb default '{}',
  privacy_settings jsonb default '{"profile_visible": true, "events_visible": true}',
  notification_settings jsonb default '{"email": true, "push": true, "event_reminders": true}',
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
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  message_type text default 'text' check (message_type in ('text', 'image', 'file', 'system')),
  metadata jsonb default '{}',
  is_deleted boolean default false,
  created_at timestamptz default now()
);

-- Tabella messaggi privati
create table if not exists public.private_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  is_deleted_by_sender boolean default false,
  is_deleted_by_receiver boolean default false,
  created_at timestamptz default now()
);

-- Tabella badge
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  category text,
  points integer default 0,
  requirements jsonb,
  created_at timestamptz default now()
);

-- Tabella badge utente
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  badge_id uuid references public.badges(id) on delete cascade not null,
  earned_at timestamptz default now(),
  -- Evita badge duplicati per utente
  unique(user_id, badge_id)
);

-- Tabella notifiche
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('event_reminder', 'new_participant', 'new_comment', 'new_message', 'badge_earned', 'event_cancelled')),
  title text not null,
  content text,
  data jsonb default '{}',
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ✅ 3. INDICI PER PERFORMANCE

-- Indici per eventi
create index if not exists idx_events_creator_id on public.events(creator_id);
create index if not exists idx_events_event_date on public.events(event_date);
create index if not exists idx_events_category on public.events(category);
create index if not exists idx_events_status on public.events(status);
create index if not exists idx_events_location on public.events(location);

-- Indici per partecipanti
create index if not exists idx_event_participants_event_id on public.event_participants(event_id);
create index if not exists idx_event_participants_user_id on public.event_participants(user_id);
create index if not exists idx_event_participants_status on public.event_participants(status);

-- Indici per favoriti
create index if not exists idx_event_favorites_event_id on public.event_favorites(event_id);
create index if not exists idx_event_favorites_user_id on public.event_favorites(user_id);

-- Indici per commenti
create index if not exists idx_event_comments_event_id on public.event_comments(event_id);
create index if not exists idx_event_comments_parent_id on public.event_comments(parent_id);
create index if not exists idx_event_comments_created_at on public.event_comments(created_at);

-- Indici per chat
create index if not exists idx_event_chats_event_id on public.event_chats(event_id);
create index if not exists idx_event_chats_created_at on public.event_chats(created_at);

-- Indici per messaggi privati
create index if not exists idx_private_messages_sender_id on public.private_messages(sender_id);
create index if not exists idx_private_messages_receiver_id on public.private_messages(receiver_id);
create index if not exists idx_private_messages_created_at on public.private_messages(created_at);

-- Indici per notifiche
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_is_read on public.notifications(is_read);
create index if not exists idx_notifications_created_at on public.notifications(created_at);

-- ✅ 4. TRIGGER PER UPDATED_AT

-- Funzione per aggiornare updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

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
alter table public.private_messages enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.notifications enable row level security;

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

-- ✅ 12. POLICY PER PRIVATE_MESSAGES
drop policy if exists "Users can read their messages" on public.private_messages;
create policy "Users can read their messages"
  on public.private_messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can send messages" on public.private_messages;
create policy "Users can send messages"
  on public.private_messages for insert
  with check (auth.uid() = sender_id);

drop policy if exists "Users can update their messages" on public.private_messages;
create policy "Users can update their messages"
  on public.private_messages for update
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- ✅ 13. POLICY PER BADGES
drop policy if exists "Anyone can read badges" on public.badges;
create policy "Anyone can read badges"
  on public.badges for select
  using (true);

-- ✅ 14. POLICY PER USER_BADGES
drop policy if exists "Anyone can read user badges" on public.user_badges;
create policy "Anyone can read user badges"
  on public.user_badges for select
  using (true);

-- ✅ 15. POLICY PER NOTIFICATIONS
drop policy if exists "Users can read their notifications" on public.notifications;
create policy "Users can read their notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update their notifications" on public.notifications;
create policy "Users can update their notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- ✅ 16. FUNZIONI UTILI

-- Funzione per ottenere statistiche utente
create or replace function public.get_user_stats(user_uuid uuid)
returns table(
  events_created bigint,
  events_participated bigint,
  total_points bigint,
  user_level bigint
) as $$
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
$$ language plpgsql security definer;

-- Funzione per creare notifica
create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_content text,
  p_data jsonb default '{}'
)
returns uuid as $$
declare
  v_notification_id uuid;
begin
  insert into public.notifications (user_id, type, title, content, data)
  values (p_user_id, p_type, p_title, p_content, p_data)
  returning id into v_notification_id;
  
  return v_notification_id;
end;
$$ language plpgsql security definer;

-- Funzione per assegnare badge
create or replace function public.award_badge(p_user_id uuid, p_badge_name text)
returns boolean as $$
declare
  v_badge_id uuid;
begin
  -- Trova il badge
  select id into v_badge_id from public.badges where name = p_badge_name;
  
  if v_badge_id is null then
    return false;
  end if;
  
  -- Assegna il badge se non già assegnato
  insert into public.user_badges (user_id, badge_id)
  values (p_user_id, v_badge_id)
  on conflict (user_id, badge_id) do nothing;
  
  -- Crea notifica
  perform public.create_notification(
    p_user_id,
    'badge_earned',
    'Nuovo badge ottenuto!',
    'Hai ottenuto il badge: ' || p_badge_name,
    jsonb_build_object('badge_name', p_badge_name)
  );
  
  return true;
end;
$$ language plpgsql security definer;

-- Trigger per notifiche nuovo partecipante
create or replace function public.notify_new_participant()
returns trigger as $$
declare
  v_event_title text;
  v_participant_name text;
begin
  -- Ottieni titolo evento e nome partecipante
  select title into v_event_title from public.events where id = new.event_id;
  select username into v_participant_name from public.profiles where id = new.user_id;
  
  -- Notifica il creatore dell'evento
  perform public.create_notification(
    (select creator_id from public.events where id = new.event_id),
    'new_participant',
    'Nuovo partecipante!',
    coalesce(v_participant_name, 'Un utente') || ' partecipa a ' || v_event_title,
    jsonb_build_object('event_id', new.event_id, 'participant_id', new.user_id)
  );
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists notify_new_participant_trigger on public.event_participants;
create trigger notify_new_participant_trigger
  after insert on public.event_participants
  for each row execute function public.notify_new_participant();

-- Trigger per auto-assegnazione badge
create or replace function public.check_badges()
returns trigger as $$
declare
  v_events_created integer;
  v_events_participated integer;
begin
  -- Conta eventi creati
  select count(*) into v_events_created 
  from public.events 
  where creator_id = new.user_id;
  
  -- Conta partecipazioni
  select count(*) into v_events_participated 
  from public.event_participants 
  where user_id = new.user_id;
  
  -- Badge per primo evento creato
  if v_events_created = 1 then
    perform public.award_badge(new.user_id, 'Primo Evento');
  end if;
  
  -- Badge per 10 eventi creati
  if v_events_created = 10 then
    perform public.award_badge(new.user_id, 'Organizzatore Esperto');
  end if;
  
  -- Badge per prima partecipazione
  if v_events_participated = 1 then
    perform public.award_badge(new.user_id, 'Prima Partecipazione');
  end if;
  
  -- Badge per 10 partecipazioni
  if v_events_participated = 10 then
    perform public.award_badge(new.user_id, 'Partecipante Attivo');
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger per eventi creati
drop trigger if exists check_badges_on_event on public.events;
create trigger check_badges_on_event
  after insert on public.events
  for each row execute function public.check_badges();

-- Trigger per partecipazioni
drop trigger if exists check_badges_on_participation on public.event_participants;
create trigger check_badges_on_participation
  after insert on public.event_participants
  for each row execute function public.check_badges();

-- ✅ 17. VISTE UTILI

-- Vista profili con statistiche
create or replace view public.profiles_with_stats as
select 
  p.*,
  coalesce(s.events_created, 0) as events_created,
  coalesce(s.events_participated, 0) as events_participated,
  coalesce(s.total_points, 0) as total_points,
  coalesce(s.user_level, 1) as user_level,
  (select count(*) from public.user_badges where user_id = p.id) as badges_count
from public.profiles p
left join lateral public.get_user_stats(p.id) s on true;

-- Vista eventi con conteggi
create or replace view public.events_with_counts as
select 
  e.*,
  (select count(*) from public.event_participants where event_id = e.id) as participants_count,
  (select count(*) from public.event_favorites where event_id = e.id) as favorites_count,
  (select count(*) from public.event_comments where event_id = e.id) as comments_count,
  p.username as creator_name,
  p.avatar_url as creator_avatar
from public.events e
join public.profiles p on e.creator_id = p.id;

-- ✅ 18. REALTIME SUBSCRIPTIONS
-- Abilita realtime per le tabelle necessarie
alter publication supabase_realtime add table public.event_chats;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.private_messages;

-- ✅ 19. DATI INIZIALI PER BADGE
insert into public.badges (name, description, icon, category, points) values
  ('Primo Evento', 'Hai creato il tuo primo evento!', 'fa-calendar-plus', 'eventi', 10),
  ('Prima Partecipazione', 'Hai partecipato al tuo primo evento!', 'fa-user-check', 'partecipazione', 5),
  ('Organizzatore Esperto', 'Hai creato 10 eventi!', 'fa-star', 'eventi', 50),
  ('Partecipante Attivo', 'Hai partecipato a 10 eventi!', 'fa-users', 'partecipazione', 25),
  ('Social Butterfly', 'Hai fatto 50 commenti!', 'fa-comments', 'social', 20),
  ('Popolare', 'I tuoi eventi hanno 100 partecipanti totali!', 'fa-fire', 'popolarita', 100)
on conflict (name) do nothing;

-- ✅ 20. DATI DI ESEMPIO (opzionale)
-- Inserisci solo se le tabelle sono vuote

-- insert into public.profiles (id, username, interests) values
--   ('00000000-0000-0000-0000-000000000001', 'Mario Rossi', '{"Sport", "Musica"}'),
--   ('00000000-0000-0000-0000-000000000002', 'Anna Verdi', '{"Arte", "Cultura"}')
-- on conflict (id) do nothing;

-- insert into public.events (creator_id, title, description, category, event_date, location, tags) values
--   ('00000000-0000-0000-0000-000000000001', 'Partita di calcetto', 'Partita amichevole al campo comunale', 'Sport', now() + interval '1 week', 'Campo Comunale, Milano', '{"calcio", "sport", "milano"}'),
--   ('00000000-0000-0000-0000-000000000002', 'Visita al museo', 'Esploriamo insieme il Museo della Scienza', 'Cultura', now() + interval '3 days', 'Museo della Scienza, Milano', '{"museo", "cultura", "scienza"}')
-- on conflict (id) do nothing;

-- ========================================
-- FINE SCHEMA COMPLETO - PRONTO PER L'USO! 
-- ========================================

-- Per applicare questo schema:
-- 1. Copia tutto il contenuto
-- 2. Vai su Supabase Dashboard > SQL Editor
-- 3. Incolla ed esegui lo script
-- 4. Verifica che tutte le tabelle, viste e policy siano create correttamente
-- 5. Il sistema di badge e notifiche sarà automaticamente attivo
