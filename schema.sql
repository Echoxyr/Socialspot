– ========================================
– SOCIALNET NEURAL - SCHEMA SQL COMPLETO
– ========================================

– PASSO 1: ELIMINA TABELLE ESISTENTI (se ci sono conflitti)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.user_badges CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.private_messages CASCADE;
DROP TABLE IF EXISTS public.event_chats CASCADE;
DROP TABLE IF EXISTS public.event_comments CASCADE;
DROP TABLE IF EXISTS public.event_favorites CASCADE;
DROP TABLE IF EXISTS public.event_participants CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

– PASSO 2: CREA TABELLE PRINCIPALI

– Tabella profili utente
CREATE TABLE public.profiles (
id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
username text UNIQUE,
avatar_url text,
bio text,
interests text[] DEFAULT ‘{}’,
location text,
website text,
social_links jsonb DEFAULT ‘{}’,
privacy_settings jsonb DEFAULT ‘{“profile_visible”: true, “events_visible”: true}’,
notification_settings jsonb DEFAULT ‘{“email”: true, “push”: true, “event_reminders”: true}’,
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
);

– Tabella eventi
CREATE TABLE public.events (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
title text NOT NULL,
description text,
category text,
event_date timestamptz NOT NULL,
end_date timestamptz,
location text NOT NULL,
latitude double precision,
longitude double precision,
max_participants integer,
is_private boolean DEFAULT false,
requirements text,
tags text[] DEFAULT ‘{}’,
images text[] DEFAULT ‘{}’,
status text DEFAULT ‘active’ CHECK (status IN (‘active’, ‘cancelled’, ‘completed’)),
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
);

– Tabella partecipanti eventi
CREATE TABLE public.event_participants (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
status text DEFAULT ‘confirmed’ CHECK (status IN (‘confirmed’, ‘pending’, ‘cancelled’)),
joined_at timestamptz DEFAULT now(),
UNIQUE(event_id, user_id)
);

– Tabella favoriti eventi
CREATE TABLE public.event_favorites (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
created_at timestamptz DEFAULT now(),
UNIQUE(event_id, user_id)
);

– Tabella commenti eventi
CREATE TABLE public.event_comments (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
parent_id uuid REFERENCES public.event_comments(id) ON DELETE CASCADE,
content text NOT NULL,
likes integer DEFAULT 0,
is_edited boolean DEFAULT false,
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
);

– Tabella chat di gruppo eventi
CREATE TABLE public.event_chats (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
content text NOT NULL,
message_type text DEFAULT ‘text’ CHECK (message_type IN (‘text’, ‘image’, ‘file’, ‘system’)),
metadata jsonb DEFAULT ‘{}’,
is_deleted boolean DEFAULT false,
created_at timestamptz DEFAULT now()
);

– Tabella messaggi privati
CREATE TABLE public.private_messages (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
content text NOT NULL,
is_read boolean DEFAULT false,
is_deleted_by_sender boolean DEFAULT false,
is_deleted_by_receiver boolean DEFAULT false,
created_at timestamptz DEFAULT now()
);

– Tabella badge
CREATE TABLE public.badges (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
name text NOT NULL UNIQUE,
description text,
icon text,
category text,
points integer DEFAULT 0,
requirements jsonb,
created_at timestamptz DEFAULT now()
);

– Tabella badge utente
CREATE TABLE public.user_badges (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
badge_id uuid REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
earned_at timestamptz DEFAULT now(),
UNIQUE(user_id, badge_id)
);

– Tabella notifiche
CREATE TABLE public.notifications (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
type text NOT NULL CHECK (type IN (‘event_reminder’, ‘new_participant’, ‘new_comment’, ‘new_message’, ‘badge_earned’, ‘event_cancelled’)),
title text NOT NULL,
content text,
data jsonb DEFAULT ‘{}’,
is_read boolean DEFAULT false,
created_at timestamptz DEFAULT now()
);

– PASSO 3: INDICI PER PERFORMANCE
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_events_creator ON public.events(creator_id);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_location ON public.events(location);
CREATE INDEX idx_event_participants_event ON public.event_participants(event_id);
CREATE INDEX idx_event_participants_user ON public.event_participants(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);

– PASSO 4: ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

– Policy per profiles
CREATE POLICY “Profiles sono pubblicamente leggibili” ON public.profiles FOR SELECT USING (true);
CREATE POLICY “Gli utenti possono modificare il proprio profilo” ON public.profiles FOR ALL USING (auth.uid() = id);

– Policy per events
CREATE POLICY “Eventi pubblici sono leggibili da tutti” ON public.events FOR SELECT USING (NOT is_private OR creator_id = auth.uid());
CREATE POLICY “Gli utenti possono creare eventi” ON public.events FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY “I creatori possono modificare i propri eventi” ON public.events FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY “I creatori possono eliminare i propri eventi” ON public.events FOR DELETE USING (auth.uid() = creator_id);

– Policy per event_participants
CREATE POLICY “I partecipanti sono visibili a tutti” ON public.event_participants FOR SELECT USING (true);
CREATE POLICY “Gli utenti possono partecipare agli eventi” ON public.event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY “Gli utenti possono gestire le proprie partecipazioni” ON public.event_participants FOR ALL USING (auth.uid() = user_id);

– Policy per event_favorites
CREATE POLICY “Gli utenti vedono i propri favoriti” ON public.event_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY “Gli utenti possono gestire i propri favoriti” ON public.event_favorites FOR ALL USING (auth.uid() = user_id);

– Policy per event_comments
CREATE POLICY “I commenti sono pubblicamente leggibili” ON public.event_comments FOR SELECT USING (true);
CREATE POLICY “Gli utenti autenticati possono commentare” ON public.event_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY “Gli utenti possono modificare i propri commenti” ON public.event_comments FOR UPDATE USING (auth.uid() = user_id);

– Policy per event_chats
CREATE POLICY “Chat visibili ai partecipanti dell’evento” ON public.event_chats
FOR SELECT USING (
EXISTS (
SELECT 1 FROM public.event_participants
WHERE event_id = event_chats.event_id AND user_id = auth.uid()
)
);
CREATE POLICY “I partecipanti possono inviare messaggi” ON public.event_chats
FOR INSERT WITH CHECK (
auth.uid() = user_id AND
EXISTS (
SELECT 1 FROM public.event_participants
WHERE event_id = event_chats.event_id AND user_id = auth.uid()
)
);

– Policy per private_messages
CREATE POLICY “Gli utenti vedono i propri messaggi” ON public.private_messages
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY “Gli utenti possono inviare messaggi” ON public.private_messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

– Policy per notifications
CREATE POLICY “Gli utenti vedono le proprie notifiche” ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY “Gli utenti possono aggiornare le proprie notifiche” ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

– PASSO 5: TRIGGER E FUNZIONI
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
INSERT INTO public.profiles (id, username)
VALUES (new.id, new.raw_user_meta_data->>‘full_name’);
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

– Funzione per aggiornare updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

– Trigger per updated_at
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER set_updated_at_events BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

– PASSO 6: VISTE UTILI
CREATE OR REPLACE VIEW public.events_with_stats AS
SELECT
e.*,
p.username as creator_name,
p.avatar_url as creator_avatar,
(SELECT COUNT(*) FROM public.event_participants WHERE event_id = e.id AND status = ‘confirmed’) as participants_count,
(SELECT COUNT(*) FROM public.event_favorites WHERE event_id = e.id) as favorites_count,
(SELECT COUNT(*) FROM public.event_comments WHERE event_id = e.id) as comments_count
FROM public.events e
JOIN public.profiles p ON e.creator_id = p.id;

– PASSO 7: DATI INIZIALI BADGE
INSERT INTO public.badges (name, description, icon, category, points) VALUES
(‘Primo Evento’, ‘Hai creato il tuo primo evento!’, ‘fa-calendar-plus’, ‘eventi’, 10),
(‘Prima Partecipazione’, ‘Hai partecipato al tuo primo evento!’, ‘fa-user-check’, ‘partecipazione’, 5),
(‘Organizzatore Esperto’, ‘Hai creato 10 eventi!’, ‘fa-star’, ‘eventi’, 50),
(‘Partecipante Attivo’, ‘Hai partecipato a 10 eventi!’, ‘fa-users’, ‘partecipazione’, 25),
(‘Social Butterfly’, ‘Hai fatto 50 commenti!’, ‘fa-comments’, ‘social’, 20),
(‘Popolare’, ‘I tuoi eventi hanno 100 partecipanti totali!’, ‘fa-fire’, ‘popolarita’, 100)
ON CONFLICT (name) DO NOTHING;

– PASSO 8: ABILITA REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.private_messages;

– ========================================
– FINE SCHEMA - PRONTO PER L’USO!
– ========================================
