--
-- schema.sql
-- Script per creare le tabelle event_comments ed event_chats in Supabase e configurare le relative policy RLS.
-- Assicurarsi di eseguire questo script nel database Supabase del progetto SocialSpot.

-- Creazione tabella dei commenti agli eventi
create table if not exists public.event_comments (
  id serial primary key,
  event_id uuid references public.events (id) on delete cascade,
  user_id uuid references public.profiles (user_id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- Abilita row level security
alter table public.event_comments enable row level security;

-- Permette a tutti di leggere i commenti
create policy "Allow read comments" on public.event_comments
  for select using (true);

-- Permette l'inserimento dei commenti solo al proprietario (auth.uid())
create policy "Allow insert own comments" on public.event_comments
  for insert with check (auth.uid() = user_id);

-- Permette la modifica solo al proprietario
create policy "Allow update own comments" on public.event_comments
  for update using (auth.uid() = user_id);

-- Permette la cancellazione solo al proprietario
create policy "Allow delete own comments" on public.event_comments
  for delete using (auth.uid() = user_id);

-- Creazione tabella chat degli eventi
create table if not exists public.event_chats (
  id serial primary key,
  event_id uuid references public.events (id) on delete cascade,
  user_id uuid references public.profiles (user_id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- Abilita row level security per la chat
alter table public.event_chats enable row level security;

-- Consenti a tutti di leggere i messaggi della chat
create policy "Allow read chats" on public.event_chats
  for select using (true);

-- Consenti inserimento di messaggi solo al proprietario
create policy "Allow insert own chats" on public.event_chats
  for insert with check (auth.uid() = user_id);

-- Consenti aggiornamento solo al proprietario
create policy "Allow update own chats" on public.event_chats
  for update using (auth.uid() = user_id);

-- Consenti cancellazione solo al proprietario
create policy "Allow delete own chats" on public.event_chats
  for delete using (auth.uid() = user_id);
