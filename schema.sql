-- ========================================
-- SOCIALSPOT - DATABASE SCHEMA CORRETTO
-- ========================================

-- 1. ELIMINA TABELLE ESISTENTI (se necessario)
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

-- 2. CREA TABELLA PROFILI CON TUTTI I CAMPI NECESSARI
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  location TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{"profile_visible": true, "events_visible": true}',
  notification_settings JSONB DEFAULT '{"email": true, "push": true, "event_reminders": true}',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREA TABELLA EVENTI
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  max_participants INTEGER,
  is_private BOOLEAN DEFAULT FALSE,
  requirements TEXT,
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREA TABELLA PARTECIPANTI
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 5. CREA TABELLA FAVORITI
CREATE TABLE IF NOT EXISTS public.event_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 6. CREA TABELLA COMMENTI
CREATE TABLE IF NOT EXISTS public.event_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.event_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CREA TABELLA CHAT EVENTI
CREATE TABLE IF NOT EXISTS public.event_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  metadata JSONB DEFAULT '{}',
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CREA TABELLA MESSAGGI PRIVATI
CREATE TABLE IF NOT EXISTS public.private_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_deleted_by_sender BOOLEAN DEFAULT FALSE,
  is_deleted_by_receiver BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CREA TABELLA BADGES
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  category TEXT,
  points INTEGER DEFAULT 0,
  requirements JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CREA TABELLA USER BADGES
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 11. CREA TABELLA NOTIFICHE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('event_reminder', 'new_participant', 'new_comment', 'new_message', 'badge_earned', 'event_cancelled')),
  title TEXT NOT NULL,
  content TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. CREA INDICI PER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_events_creator_id ON public.events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_favorites_user_id ON public.event_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_event_chats_event_id ON public.event_chats(event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- 13. FUNZIONE PER AGGIORNARE UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. TRIGGER PER PROFILES
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 15. TRIGGER PER EVENTS
DROP TRIGGER IF EXISTS events_updated_at ON public.events;
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 16. ABILITA ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 17. POLICY PER PROFILES
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
CREATE POLICY "Anyone can read profiles" 
  ON public.profiles FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert their profile" ON public.profiles;
CREATE POLICY "Users can insert their profile"
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their profile" ON public.profiles;
CREATE POLICY "Users can update their profile"
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 18. POLICY PER EVENTS
DROP POLICY IF EXISTS "Anyone can read events" ON public.events;
CREATE POLICY "Anyone can read events" 
  ON public.events FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert events" ON public.events;
CREATE POLICY "Users can insert events" 
  ON public.events FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can update their events" ON public.events;
CREATE POLICY "Users can update their events" 
  ON public.events FOR UPDATE 
  USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can delete their events" ON public.events;
CREATE POLICY "Users can delete their events" 
  ON public.events FOR DELETE 
  USING (auth.uid() = creator_id);

-- 19. POLICY PER EVENT_PARTICIPANTS
DROP POLICY IF EXISTS "Anyone can read participants" ON public.event_participants;
CREATE POLICY "Anyone can read participants" 
  ON public.event_participants FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert their participation" ON public.event_participants;
CREATE POLICY "Users can insert their participation" 
  ON public.event_participants FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their participation" ON public.event_participants;
CREATE POLICY "Users can delete their participation" 
  ON public.event_participants FOR DELETE 
  USING (auth.uid() = user_id);

-- 20. POLICY PER EVENT_FAVORITES
DROP POLICY IF EXISTS "Anyone can read favorites" ON public.event_favorites;
CREATE POLICY "Anyone can read favorites" 
  ON public.event_favorites FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can manage their favorites" ON public.event_favorites;
CREATE POLICY "Users can manage their favorites" 
  ON public.event_favorites FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- 21. POLICY PER EVENT_COMMENTS
DROP POLICY IF EXISTS "Anyone can read comments" ON public.event_comments;
CREATE POLICY "Anyone can read comments" 
  ON public.event_comments FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert comments" ON public.event_comments;
CREATE POLICY "Users can insert comments" 
  ON public.event_comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their comments" ON public.event_comments;
CREATE POLICY "Users can update their comments" 
  ON public.event_comments FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their comments" ON public.event_comments;
CREATE POLICY "Users can delete their comments" 
  ON public.event_comments FOR DELETE 
  USING (auth.uid() = user_id);

-- 22. POLICY PER EVENT_CHATS
DROP POLICY IF EXISTS "Anyone can read chats" ON public.event_chats;
CREATE POLICY "Anyone can read chats" 
  ON public.event_chats FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert chats" ON public.event_chats;
CREATE POLICY "Users can insert chats" 
  ON public.event_chats FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 23. POLICY PER NOTIFICATIONS
DROP POLICY IF EXISTS "Users can read their notifications" ON public.notifications;
CREATE POLICY "Users can read their notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 24. POLICY PER BADGES
DROP POLICY IF EXISTS "Anyone can read badges" ON public.badges;
CREATE POLICY "Anyone can read badges"
  ON public.badges FOR SELECT
  USING (true);

-- 25. POLICY PER USER_BADGES
DROP POLICY IF EXISTS "Anyone can read user badges" ON public.user_badges;
CREATE POLICY "Anyone can read user badges"
  ON public.user_badges FOR SELECT
  USING (true);

-- 26. FUNZIONE PER CREARE PROFILO DOPO REGISTRAZIONE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, date_of_birth, gender)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, CURRENT_DATE),
    COALESCE(NEW.raw_user_meta_data->>'gender', 'prefer_not_to_say')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 27. TRIGGER PER CREAZIONE AUTO PROFILO
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 28. INSERISCI BADGES INIZIALI
INSERT INTO public.badges (name, description, icon, category, points) VALUES
  ('Primo Evento', 'Hai creato il tuo primo evento!', 'fa-calendar-plus', 'eventi', 10),
  ('Prima Partecipazione', 'Hai partecipato al tuo primo evento!', 'fa-user-check', 'partecipazione', 5),
  ('Organizzatore Esperto', 'Hai creato 10 eventi!', 'fa-star', 'eventi', 50),
  ('Partecipante Attivo', 'Hai partecipato a 10 eventi!', 'fa-users', 'partecipazione', 25)
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- FINE SCHEMA - PRONTO PER L'USO
-- ========================================
