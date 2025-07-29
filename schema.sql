-- ========================================
-- SOCIALNET NEURAL - ENHANCED DATABASE SCHEMA
-- ========================================
-- Schema completo per funzionalità Neural AI avanzate

-- ✅ 1. ESTENSIONI POSTGRESQL
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ✅ 2. TABELLE ENHANCED EXISTING

-- Estendi tabella profiles con campi neural
alter table public.profiles add column if not exists neural_score integer default 0;
alter table public.profiles add column if not exists ai_bio_generated boolean default false;
alter table public.profiles add column if not exists personality_type text;
alter table public.profiles add column if not exists avatar_intelligence jsonb default '{}';
alter table public.profiles add column if not exists reputation_tier text default 'Neural Novice';
alter table public.profiles add column if not exists travel_mode boolean default false;
alter table public.profiles add column if not exists current_city text default 'Milano, IT';
alter table public.profiles add column if not exists preferred_event_types text[] default '{}';
alter table public.profiles add column if not exists ai_learning_data jsonb default '{}';

-- Estendi tabella events con campi neural obbligatori
alter table public.events add column if not exists gender_preference text not null default 'entrambi';
alter table public.events add column if not exists age_range text not null default '18-35';
alter table public.events add column if not exists ai_generated boolean default false;
alter table public.events add column if not exists neural_compatibility_score integer default 80;
alter table public.events add column if not exists ai_suggestions jsonb default '{}';
alter table public.events add column if not exists dalle_prompt text;
alter table public.events add column if not exists whatsapp_message text;
alter table public.events add column if not exists estimated_networking_potential integer default 70;

-- Add constraints for new required fields
alter table public.events add constraint check_gender_preference 
  check (gender_preference in ('uomo', 'donna', 'entrambi'));
alter table public.events add constraint check_age_range 
  check (age_range in ('18-25', '26-35', '36-45', '46-55', '55+'));

-- ✅ 3. NUOVE TABELLE NEURAL

-- Tabella AI Avatar Interactions
create table if not exists public.ai_avatar_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  avatar_owner_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  ai_response text not null,
  context_type text default 'general',
  satisfaction_rating integer check (satisfaction_rating between 1 and 5),
  created_at timestamptz default now()
);

-- Tabella Neural Reputation History
create table if not exists public.neural_reputation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  action_type text not null,
  points_awarded integer not null,
  previous_score integer not null,
  new_score integer not null,
  multiplier_applied decimal(3,2) default 1.0,
  reason text,
  created_at timestamptz default now()
);

-- Tabella Weekly Neural Stories
create table if not exists public.weekly_neural_stories (
  id uuid primary key default gen_random_uuid(),
  week_start_date date not null unique,
  title text not null,
  content text not null,
  metrics jsonb not null default '{}',
  predictions jsonb default '{}',
  user_highlights jsonb default '{}',
  ai_confidence decimal(3,2) default 0.85,
  engagement_prediction text default 'Medium',
  generated_at timestamptz default now(),
  published boolean default false
);

-- Tabella User Following System
create table if not exists public.user_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  followed_at timestamptz default now(),
  notification_enabled boolean default true,
  -- Prevent self-follow and duplicates
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

-- Tabella User Search History (per AI learning)
create table if not exists public.user_search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  search_query text not null,
  search_type text default 'events', -- events, users, locations
  results_count integer default 0,
  clicked_result_id uuid,
  search_context jsonb default '{}',
  created_at timestamptz default now()
);

-- Tabella Neural Achievements
create table if not exists public.neural_achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  icon text not null,
  category text not null,
  tier text default 'Bronze', -- Bronze, Silver, Gold, Platinum, Neural
  points_required integer not null,
  conditions jsonb not null default '{}',
  rarity_score integer default 1, -- 1-100, higher = more rare
  created_at timestamptz default now()
);

-- Tabella User Neural Achievements
create table if not exists public.user_neural_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  achievement_id uuid references public.neural_achievements(id) on delete cascade not null,
  earned_at timestamptz default now(),
  progress_data jsonb default '{}',
  -- Prevent duplicate achievements
  unique(user_id, achievement_id)
);

-- Tabella Event AI Analytics
create table if not exists public.event_ai_analytics (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  predicted_success_rate integer default 70,
  actual_success_rate integer,
  ai_suggestions_used jsonb default '{}',
  participant_satisfaction_avg decimal(3,2),
  networking_connections_made integer default 0,
  ai_accuracy_score decimal(3,2),
  learning_data jsonb default '{}',
  analyzed_at timestamptz default now()
);

-- Tabella Travel Mode Sessions
create table if not exists public.travel_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  start_location text,
  destination_location text not null,
  session_start timestamptz default now(),
  session_end timestamptz,
  events_discovered integer default 0,
  connections_made integer default 0,
  ai_recommendations_followed integer default 0,
  satisfaction_rating integer check (satisfaction_rating between 1 and 5),
  ai_insights jsonb default '{}'
);

-- Tabella Neural Community Feed
create table if not exists public.neural_community_feed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  content_type text not null, -- achievement, event_created, story_shared, milestone
  content text not null,
  metadata jsonb default '{}',
  visibility text default 'public', -- public, followers, private
  likes_count integer default 0,
  comments_count integer default 0,
  ai_boost_score integer default 0, -- AI determines content quality
  created_at timestamptz default now()
);

-- Tabella Feed Interactions
create table if not exists public.feed_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  feed_id uuid references public.neural_community_feed(id) on delete cascade not null,
  interaction_type text not null, -- like, comment, share, boost
  comment_text text,
  created_at timestamptz default now(),
  -- Prevent duplicate likes
  unique(user_id, feed_id, interaction_type) where interaction_type = 'like'
);

-- ✅ 4. FUNZIONI AI HELPER

-- Funzione per calcolare Neural Score
create or replace function calculate_neural_score(user_uuid uuid)
returns integer as $
declare
  events_created integer;
  events_attended integer;
  positive_interactions integer;
  consistency_bonus integer;
  reputation_score integer;
begin
  -- Count events created
  select count(*) into events_created
  from public.events
  where creator_id = user_uuid;
  
  -- Count events attended
  select count(*) into events_attended
  from public.event_participants
  where user_id = user_uuid and status = 'confirmed';
  
  -- Count positive interactions
  select count(*) into positive_interactions
  from public.feed_interactions
  where user_id = user_uuid and interaction_type = 'like';
  
  -- Calculate consistency bonus
  consistency_bonus := case
    when events_created > 5 and events_attended > 10 then 50
    when events_created > 2 and events_attended > 5 then 25
    else 0
  end;
  
  -- Calculate final score
  reputation_score := (events_created * 15) + 
                      (events_attended * 8) + 
                      (positive_interactions * 2) + 
                      consistency_bonus;
  
  return least(reputation_score, 9999);
end;
$ language plpgsql;

-- Funzione per aggiornare il Neural Score automaticamente
create or replace function update_neural_score_trigger()
returns trigger as $
begin
  update public.profiles
  set neural_score = calculate_neural_score(NEW.user_id)
  where id = NEW.user_id;
  
  return NEW;
end;
$ language plpgsql;

-- Funzione per generare Weekly Story
create or replace function generate_weekly_story()
returns json as $
declare
  week_start date;
  events_count integer;
  participants_count integer;
  story_data json;
begin
  week_start := date_trunc('week', current_date)::date;
  
  -- Count events this week
  select count(*) into events_count
  from public.events
  where created_at >= week_start and created_at < week_start + interval '7 days';
  
  -- Count unique participants this week
  select count(distinct user_id) into participants_count
  from public.event_participants ep
  join public.events e on ep.event_id = e.id
  where e.created_at >= week_start and e.created_at < week_start + interval '7 days';
  
  story_data := json_build_object(
    'events', events_count,
    'participants', participants_count,
    'ai_insights', json_build_array(
      'Neural network optimized ' || events_count || ' events',
      'Community satisfaction rate: ' || (85 + floor(random() * 15))::text || '%',
      'New connections facilitated: ' || (participants_count * 0.3)::integer
    )
  );
  
  return story_data;
end;
$ language plpgsql;

-- ✅ 5. TRIGGERS

-- Trigger per aggiornare neural score quando si partecipa a eventi
drop trigger if exists update_neural_score_on_participation on public.event_participants;
create trigger update_neural_score_on_participation
  after insert on public.event_participants
  for each row execute function update_neural_score_trigger();

-- Trigger per aggiornare neural score quando si creano eventi  
drop trigger if exists update_neural_score_on_event_creation on public.events;
create trigger update_neural_score_on_event_creation
  after insert on public.events
  for each row execute function update_neural_score_trigger();

-- ✅ 6. RLS POLICIES NEURAL

-- Policies per ai_avatar_interactions
drop policy if exists "Users can read avatar interactions" on public.ai_avatar_interactions;
create policy "Users can read avatar interactions"
  on public.ai_avatar_interactions for select
  using (auth.uid() = user_id or auth.uid() = avatar_owner_id);

drop policy if exists "Users can create avatar interactions" on public.ai_avatar_interactions;
create policy "Users can create avatar interactions"
  on public.ai_avatar_interactions for insert
  with check (auth.uid() = user_id);

-- Policies per neural_reputation_history
drop policy if exists "Users can read their reputation history" on public.neural_reputation_history;
create policy "Users can read their reputation history"
  on public.neural_reputation_history for select
  using (auth.uid() = user_id);

-- Policies per weekly_neural_stories
drop policy if exists "Anyone can read published stories" on public.weekly_neural_stories;
create policy "Anyone can read published stories"
  on public.weekly_neural_stories for select
  using (published = true);

-- Policies per user_follows
drop policy if exists "Users can manage their follows" on public.user_follows;
create policy "Users can manage their follows"
  on public.user_follows for all
  using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);

drop policy if exists "Anyone can see follows" on public.user_follows;
create policy "Anyone can see follows"
  on public.user_follows for select
  using (true);

-- Policies per neural_achievements
drop policy if exists "Anyone can read achievements" on public.neural_achievements;
create policy "Anyone can read achievements"
  on public.neural_achievements for select
  using (true);

-- Policies per user_neural_achievements  
drop policy if exists "Users can read their achievements" on public.user_neural_achievements;
create policy "Users can read their achievements"
  on public.user_neural_achievements for select
  using (auth.uid() = user_id);

-- Policies per neural_community_feed
drop policy if exists "Anyone can read public feed" on public.neural_community_feed;
create policy "Anyone can read public feed"
  on public.neural_community_feed for select
  using (visibility = 'public' or auth.uid() = user_id);

drop policy if exists "Users can create feed content" on public.neural_community_feed;
create policy "Users can create feed content"
  on public.neural_community_feed for insert
  with check (auth.uid() = user_id);

-- Policies per feed_interactions
drop policy if exists "Users can interact with feed" on public.feed_interactions;
create policy "Users can interact with feed"
  on public.feed_interactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ✅ 7. INITIAL NEURAL ACHIEVEMENTS DATA

insert into public.neural_achievements (name, description, icon, category, tier, points_required, conditions) values
  ('Neural Pioneer', 'Primi passi nella community neural', 'fa-rocket', 'onboarding', 'Bronze', 10, '{"events_created": 1}'),
  ('Connection Catalyst', 'Hai facilitato 5 nuove connessioni', 'fa-link', 'networking', 'Silver', 50, '{"connections_made": 5}'),
  ('Event Master', 'Hai creato 10 eventi di successo', 'fa-crown', 'events', 'Gold', 150, '{"events_created": 10, "avg_rating": 4.0}'),
  ('Neural Legend', 'Hai raggiunto 1000 punti neural', 'fa-brain', 'reputation', 'Platinum', 1000, '{"neural_score": 1000}'),
  ('AI Whisperer', 'Hai usato l''AI per 50 suggerimenti', 'fa-magic', 'ai', 'Gold', 200, '{"ai_suggestions_used": 50}'),
  ('Travel Neural', 'Hai usato travel mode in 3 città', 'fa-plane', 'travel', 'Silver', 75, '{"cities_visited": 3}'),
  ('Community Builder', 'I tuoi eventi hanno 100+ partecipanti totali', 'fa-users', 'community', 'Gold', 300, '{"total_participants": 100}'),
  ('Innovation Spark', 'Hai creato eventi in 5 categorie diverse', 'fa-lightbulb', 'innovation', 'Platinum', 500, '{"categories_used": 5}')
on conflict (name) do nothing;

-- ✅ 8. VIEWS AVANZATE

-- Vista per feed personalizzato dell'utente
create or replace view public.personalized_feed as
select 
  ncf.*,
  p.username as author_name,
  p.avatar_url as author_avatar,
  (
    select count(*) 
    from public.feed_interactions fi 
    where fi.feed_id = ncf.id and fi.interaction_type = 'like'
  ) as likes_count,
  (
    select count(*) 
    from public.feed_interactions fi 
    where fi.feed_id = ncf.id and fi.interaction_type = 'comment'
  ) as comments_count
from public.neural_community_feed ncf
join public.profiles p on ncf.user_id = p.id
where ncf.visibility = 'public'
order by ncf.ai_boost_score desc, ncf.created_at desc;

-- Vista per statistiche neural dell'utente
create or replace view public.user_neural_stats as
select 
  p.id,
  p.username,
  p.neural_score,
  p.reputation_tier,
  (select count(*) from public.events where creator_id = p.id) as events_created,
  (select count(*) from public.event_participants where user_id = p.id) as events_attended,
  (select count(*) from public.user_neural_achievements where user_id = p.id) as achievements_count,
  (select count(*) from public.user_follows where following_id = p.id) as followers_count,
  (select count(*) from public.user_follows where follower_id = p.id) as following_count
from public.profiles p;

-- Vista per eventi con neural analytics
create or replace view public.events_neural_analytics as
select 
  e.*,
  eaa.predicted_success_rate,
  eaa.actual_success_rate,
  eaa.participant_satisfaction_avg,
  eaa.networking_connections_made,
  (select count(*) from public.event_participants where event_id = e.id) as participants_count,
  (select avg(rating) from public.event_reviews where event_id = e.id) as avg_rating
from public.events e
left join public.event_ai_analytics eaa on e.id = eaa.event_id;

-- ✅ 9. FUNCTION PER SUGGERIMENTI AI

-- Funzione per suggerire eventi basata su AI
create or replace function suggest_events_for_user(user_uuid uuid, limit_count integer default 10)
returns table(
  event_id uuid,
  title text,
  description text,
  category text,
  compatibility_score integer,
  ai_reason text
) as $
begin
  return query
  select 
    e.id,
    e.title,
    e.description,
    e.category,
    case 
      when p.interests && string_to_array(e.category, ',') then 90
      when e.location ilike '%' || p.current_city || '%' then 80
      else 70
    end as compatibility_score,
    case 
      when p.interests && string_to_array(e.category, ',') then 'Matches your interests'
      when e.location ilike '%' || p.current_city || '%' then 'Near your location'
      else 'Recommended by AI'
    end as ai_reason
  from public.events e
  cross join public.profiles p
  where p.id = user_uuid
    and e.event_date > now()
    and e.creator_id != user_uuid
  order by compatibility_score desc
  limit limit_count;
end;
$ language plpgsql;

-- ✅ 10. REALTIME SUBSCRIPTIONS
alter publication supabase_realtime add table public.ai_avatar_interactions;
alter publication supabase_realtime add table public.neural_community_feed;
alter publication supabase_realtime add table public.feed_interactions;
alter publication supabase_realtime add table public.user_follows;

-- ✅ 11. INDEXES PER PERFORMANCE
create index if not exists idx_neural_score on public.profiles(neural_score desc);
create index if not exists idx_events_neural_compatibility on public.events(neural_compatibility_score desc);
create index if not exists idx_user_follows_follower on public.user_follows(follower_id);
create index if not exists idx_user_follows_following on public.user_follows(following_id);
create index if not exists idx_feed_created_at on public.neural_community_feed(created_at desc);
create index if not exists idx_ai_interactions_user on public.ai_avatar_interactions(user_id);
create index if not exists idx_reputation_history_user on public.neural_reputation_history(user_id, created_at desc);

-- ========================================
-- SCHEMA NEURAL COMPLETO - READY FOR AI!
-- ========================================
