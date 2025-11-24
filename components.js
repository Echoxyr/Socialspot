/// --- Configurazione Supabase ---
const SUPABASE_URL = 'https://apxtdtijqcpfzmlvxyzt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweHRkdGlqcWNwZnptbHZ4eXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTIyNDMsImV4cCI6MjA3OTU4ODI0M30.DPN_cG5s1oFxfM8v6Jozhq1pTmzXlbTsqHZ-2bR89JU';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// React hooks
const { useState, useEffect, useCallback, useRef, memo } = React;

// Dati costanti
const CATEGORIES = [
    'Sport', 'Musica', 'Arte', 'Cultura', 'Tecnologia', 
    'Cibo', 'Viaggi', 'Cinema', 'All\'aperto', 'Business'
];

const ITALIAN_CITIES = [
    'Roma, Lazio', 'Milano, Lombardia', 'Napoli, Campania', 'Torino, Piemonte',
    'Palermo, Sicilia', 'Genova, Liguria', 'Bologna, Emilia-Romagna', 'Firenze, Toscana',
    'Bari, Puglia', 'Catania, Sicilia', 'Venezia, Veneto', 'Verona, Veneto'
];

// Auth Component
const Auth = memo(({ setUser }) => {
  // ...

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (isSignIn) {
        result = await supabase.auth.signInWithPassword({ 
          email: formData.email, 
          password: formData.password 
        });
      } else {
        // Validazione signup
        if (!formData.fullName.trim()) {
          setError('Inserisci il nome completo');
          setLoading(false);
          return;
        }
        if (formData.interests.length === 0) {
          setError('Seleziona almeno un interesse');
          setLoading(false);
          return;
        }
        
        // Signup
        result = await supabase.auth.signUp({ 
          email: formData.email, 
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName.trim(),
              interests: formData.interests
            }
          }
        });
        
        // Crea profilo SOLO se signup OK
        if (result.data?.user && !result.error) {
          try {
            const profileData = {
              id: result.data.user.id,
              username: formData.fullName.trim(),
              interests: formData.interests,
              location: '',
              bio: '',
              avatar_url: null
            };
            
            const { error: profileError } = await supabase
              .from('profiles')
              .insert(profileData);
              
            if (profileError) {
              console.error('Errore creazione profilo:', profileError);
              // Non blocchiamo il login per questo
            }
          } catch (profileErr) {
            console.error('Errore inserimento profilo:', profileErr);
            // Non blocchiamo il login
          }
        }
      }
      
      if (result.error) {
        setError(result.error.message);
      } else if (result.data.user) {
        setUser(result.data.user);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Errore di connessione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  // ...
});
// Location Input Component
const LocationInput = ({ value, onChange, placeholder }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        onChange(inputValue);
        
        if (inputValue.length > 1) {
            const filtered = ITALIAN_CITIES.filter(city =>
                city.toLowerCase().includes(inputValue.toLowerCase())
            ).slice(0, 8);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (city) => {
        onChange(city);
        setShowSuggestions(false);
    };

    return (
        <div className="location-input-container">
            <input
                type="text"
                className="form-input"
                placeholder={placeholder}
                value={value}
                onChange={handleInputChange}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                required
            />
            {showSuggestions && suggestions.length > 0 && (
                <div className="location-suggestions">
                    {suggestions.map((city, index) => (
                        <div
                            key={index}
                            className="location-suggestion"
                            onClick={() => selectSuggestion(city)}
                        >
                            <i className="fas fa-map-marker-alt"></i>
                            {city}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


  // ...
});
// Location Input Component
const LocationInput = ({ value, onChange, placeholder }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        onChange(inputValue);
        
        if (inputValue.length > 1) {
            const filtered = ITALIAN_CITIES.filter(city =>
                city.toLowerCase().includes(inputValue.toLowerCase())
            ).slice(0, 8);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (city) => {
        onChange(city);
        setShowSuggestions(false);
    };

    return (
        <div className="location-input-container">
            <input
                type="text"
                className="form-input"
                placeholder={placeholder}
                value={value}
                onChange={handleInputChange}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                required
            />
            {showSuggestions && suggestions.length > 0 && (
                <div className="location-suggestions">
                    {suggestions.map((city, index) => (
                        <div
                            key={index}
                            className="location-suggestion"
                            onClick={() => selectSuggestion(city)}
                        >
                            <i className="fas fa-map-marker-alt"></i>
                            {city}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Hook per statistiche real-time
const useRealTimeStats = (userId) => {
    const [stats, setStats] = useState({ events: 0, followers: 0, following: 0 });
    const [loading, setLoading] = useState(true);

    const calculateStats = useCallback(async () => {
        if (!userId) return;
        
        try {
            const { data: myEvents } = await supabase
                .from('events')
                .select('id')
                .eq('creator_id', userId);
            
            const eventsCount = myEvents?.length || 0;
            
            let followersCount = 0;
            if (eventsCount > 0) {
                const { data: participants } = await supabase
                    .from('event_participants')
                    .select('user_id')
                    .in('event_id', myEvents.map(e => e.id));
                
                const uniqueParticipants = new Set(participants?.map(p => p.user_id) || []);
                followersCount = uniqueParticipants.size;
            }
            
            const { data: myParticipations } = await supabase
                .from('event_participants')
                .select('event_id')
                .eq('user_id', userId);
            
            const followingCount = myParticipations?.length || 0;
            
            setStats({
                events: eventsCount,
                followers: followersCount,
                following: followingCount
            });
        } catch (err) {
            console.error('Errore calcolo statistiche:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        calculateStats();
        
        const eventsChannel = supabase.channel('events_stats')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'events',
                filter: `creator_id=eq.${userId}`
            }, calculateStats)
            .subscribe();

        const participantsChannel = supabase.channel('participants_stats')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'event_participants',
                filter: `user_id=eq.${userId}`
            }, calculateStats)
            .subscribe();

        return () => {
            supabase.removeChannel(eventsChannel);
            supabase.removeChannel(participantsChannel);
        };
    }, [calculateStats]);

    return { stats, loading, refresh: calculateStats };
};

// Export components per app.js
window.SocialSpotComponents = {
    Auth,
    LocationInput,
    useRealTimeStats,
    supabase,
    CATEGORIES,
    ITALIAN_CITIES
};
