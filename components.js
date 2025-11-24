// Configurazione Supabase
const SUPABASE_URL = 'https://dtplarkoscdbmqbondri.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGxhcmtvc2NkYm1xYm9uZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzQ0NDYsImV4cCI6MjA3MjMxMDQ0Nn0.QKwzKbookhedLVK1kxjCVMVMUbz7GWt-eqzHuOkhNSU';
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
    const [isSignIn, setIsSignIn] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        interests: []
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError(null);
    };

    const handleInterestToggle = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

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
                if (!formData.fullName.trim()) {
                    setError('Inserisci il nome completo');
                    setLoading(false);
                    return;
                }
                
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
                
                if (result.data?.user && !result.error) {
                    try {
                        const profileData = {
                            id: result.data.user.id,
                            username: formData.fullName.trim(),
                            interests: formData.interests,
                            location: '',
                            bio: ''
                        };
                        
                        await supabase
                            .from('profiles')
                            .insert(profileData);
                    } catch (profileErr) {
                        console.error('Errore inserimento profilo:', profileErr);
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

    const availableInterests = [
        'Sport', 'Musica', 'Cinema', 'Tecnologia', 'Cucina', 
        'Viaggi', 'Arte', 'Lettura', 'Gaming', 'Fitness'
    ];

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="logo-icon">
                        <span className="logo-text">SS</span>
                    </div>
                    <h1>SocialSpot</h1>
                    <p>Connetti, Crea, Condividi</p>
                </div>

                <div className="auth-content">
                    <div className="auth-tabs">
                        <button 
                            className={`auth-tab ${isSignIn ? 'active' : ''}`} 
                            onClick={() => setIsSignIn(true)}
                        >
                            Accedi
                        </button>
                        <button 
                            className={`auth-tab ${!isSignIn ? 'active' : ''}`} 
                            onClick={() => setIsSignIn(false)}
                        >
                            Registrati
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="auth-form">
                        <div className="form-group">
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                required
                            />
                        </div>

                        {!isSignIn && (
                            <>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Nome completo"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Interessi ({formData.interests.length}/5)</label>
                                    <div className="interests-grid">
                                        {availableInterests.map(interest => (
                                            <button
                                                key={interest}
                                                type="button"
                                                className={`interest-chip ${
                                                    formData.interests.includes(interest) ? 'selected' : ''
                                                }`}
                                                onClick={() => handleInterestToggle(interest)}
                                                disabled={
                                                    !formData.interests.includes(interest) && 
                                                    formData.interests.length >= 5
                                                }
                                            >
                                                {interest}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {error && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-triangle"></i>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    {isSignIn ? 'Accesso...' : 'Registrazione...'}
                                </>
                            ) : (
                                <>
                                    <i className={`fas ${isSignIn ? 'fa-sign-in-alt' : 'fa-user-plus'}`}></i>
                                    {isSignIn ? 'Accedi' : 'Registrati'}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
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
