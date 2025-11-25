// 🔹 AUTH E COMPONENTI
const Auth = React.memo(({ supabase, setUser }) => {
    const [isSignIn, setIsSignIn] = React.useState(true);
    const [formData, setFormData] = React.useState({
        email: '', 
        password: '',
        fullName: '',
        interests: []
    });
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [passwordStrength, setPasswordStrength] = React.useState(0);

    const calculatePasswordStrength = React.useCallback((password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        return strength;
    }, []);

    React.useEffect(() => {
        setPasswordStrength(calculatePasswordStrength(formData.password));
    }, [formData.password, calculatePasswordStrength]);

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
                if (formData.interests.length === 0) {
                    setError('Seleziona almeno un interesse');
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
                            bio: '',
                            avatar_url: null
                        };
                        
                        const { error: profileError } = await supabase
                            .from('profiles')
                            .insert(profileData);
                            
                        if (profileError) {
                            console.error('Errore creazione profilo:', profileError);
                        }
                    } catch (profileErr) {
                        console.error('Errore inserimento profilo:', profileErr);
                    }
                }
            }
            
            if (result.error) {
                setError(result.error.message);
            } else if (result.data.user) {
                setUser(result.data.user);
                window.addNotification?.({
                    type: 'success',
                    icon: 'fas fa-check-circle',
                    title: isSignIn ? 'Accesso effettuato!' : 'Registrazione completata!',
                    message: isSignIn ? 'Bentornato!' : 'Benvenuto in SocialSpot!'
                });
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
        'Viaggi', 'Arte', 'Lettura', 'Gaming', 'Fitness',
        'Fotografia', 'Moda', 'Nature'
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
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Il tuo indirizzo email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                placeholder="La tua password"
                                required
                            />
                            {!isSignIn && formData.password && (
                                <div className="password-strength">
                                    <div 
                                        className="strength-bar" 
                                        style={{ width: `${passwordStrength}%` }}
                                    ></div>
                                    <span className="strength-text">
                                        {passwordStrength < 50 ? 'Debole' : passwordStrength < 80 ? 'Media' : 'Forte'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {!isSignIn && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Nome completo</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        placeholder="Il tuo nome completo"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Interessi ({formData.interests.length}/5)</label>
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
                                                <span>{interest}</span>
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

// 🔹 EVENT FEED
function EventFeed({ supabase, user }) {
    const [events, setEvents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedEvent, setSelectedEvent] = React.useState(null);
    const [favorites, setFavorites] = React.useState([]);
    const [participants, setParticipants] = React.useState({});

    React.useEffect(() => {
        loadEvents();
        loadFavorites();
        loadParticipants();
        
        const channel = supabase
            .channel('events_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, loadEvents)
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const loadEvents = async () => {
        const { data, error } = await supabase
            .from('events')
            .select(`
                *,
                profiles!events_creator_id_fkey(username, location)
            `)
            .order('event_date', { ascending: false });

        if (!error) setEvents(data || []);
        setLoading(false);
    };

    const loadFavorites = async () => {
        const { data } = await supabase
            .from('event_favorites')
            .select('event_id')
            .eq('user_id', user.id);
        setFavorites(data ? data.map(f => f.event_id) : []);
    };

    const loadParticipants = async () => {
        const { data } = await supabase
            .from('event_participants')
            .select('event_id, user_id');
        
        const counts = {};
        const userParticipations = [];
        
        (data || []).forEach(p => {
            counts[p.event_id] = (counts[p.event_id] || 0) + 1;
            if (p.user_id === user.id) {
                userParticipations.push(p.event_id);
            }
        });
        
        setParticipants({ counts, userParticipations });
    };

    const toggleFavorite = async (eventId) => {
        const isFavorite = favorites.includes(eventId);
        if (isFavorite) {
            await supabase.from('event_favorites').delete().eq('event_id', eventId).eq('user_id', user.id);
            setFavorites(favorites.filter(id => id !== eventId));
        } else {
            await supabase.from('event_favorites').insert({ event_id: eventId, user_id: user.id });
            setFavorites([...favorites, eventId]);
        }
    };

    const toggleJoin = async (eventId) => {
        const isJoined = participants.userParticipations?.includes(eventId);
        if (isJoined) {
            await supabase.from('event_participants').delete().eq('event_id', eventId).eq('user_id', user.id);
        } else {
            await supabase.from('event_participants').insert({ event_id: eventId, user_id: user.id });
        }
        loadParticipants();
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <div className="loading-text">Caricamento eventi...</div>
            </div>
        );
    }

    return (
        <div className="feed-wrapper">
            <div className="feed-header">
                <h1 className="feed-title">Eventi</h1>
                <p className="feed-subtitle">Scopri cosa succede vicino a te</p>
            </div>
            
            <div className="event-list">
                {events.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-calendar-times"></i>
                        <h3>Nessun evento</h3>
                        <p>Crea il primo evento nella tua zona!</p>
                    </div>
                ) : (
                    events.map(event => (
                        <div key={event.id} className="event-card">
                            <div className="event-header">
                                <div className="event-avatar">
                                    {event.profiles?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="event-info">
                                    <div className="event-creator">{event.profiles?.username || 'Utente'}</div>
                                    <div className="event-location">
                                        <i className="fas fa-map-marker-alt"></i>
                                        {event.location}
                                    </div>
                                </div>
                                <div className="event-category">{event.category}</div>
                            </div>
                            
                            <div className="event-content">
                                <h3 className="event-title">{event.title}</h3>
                                <p className="event-description">{event.description}</p>
                                
                                <div className="event-meta">
                                    <div className="event-meta-item">
                                        <i className="fas fa-calendar"></i>
                                        <span>{new Date(event.event_date).toLocaleDateString('it-IT')}</span>
                                    </div>
                                    <div className="event-meta-item">
                                        <i className="fas fa-users"></i>
                                        <span>{participants.counts?.[event.id] || 0} partecipanti</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="event-actions">
                                <button 
                                    className={`btn-secondary ${favorites.includes(event.id) ? 'active' : ''}`}
                                    onClick={() => toggleFavorite(event.id)}
                                >
                                    <i className={favorites.includes(event.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                                    <span>Mi piace</span>
                                </button>
                                <button 
                                    className={`btn-secondary ${participants.userParticipations?.includes(event.id) ? 'active' : ''}`}
                                    onClick={() => toggleJoin(event.id)}
                                >
                                    <i className="fas fa-user-plus"></i>
                                    <span>{participants.userParticipations?.includes(event.id) ? 'Iscritto' : 'Partecipa'}</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// 🔹 CREATE EVENT
function CreateEvent({ supabase, user, onEventCreated }) {
    const [formData, setFormData] = React.useState({
        title: '',
        description: '',
        category: '',
        location: '',
        event_date: ''
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const CATEGORIES = ['Sport', 'Musica', 'Cinema', 'Tecnologia', 'Cucina', 'Viaggi', 'Arte', 'Gaming', 'Altro'];

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.from('events').insert({
                ...formData,
                creator_id: user.id
            });

            if (error) throw error;

            window.addNotification?.({
                type: 'success',
                icon: 'fas fa-check-circle',
                title: 'Evento creato!',
                message: 'Il tuo evento è stato pubblicato'
            });
            
            onEventCreated();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-wrapper">
            <div className="create-header">
                <h1 className="create-title">Crea Evento</h1>
                <p className="create-subtitle">Organizza qualcosa di speciale</p>
            </div>
            
            <form onSubmit={handleSubmit} className="create-form">
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Titolo</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Nome evento"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Categoria</label>
                        <select
                            className="form-input form-select"
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            required
                        >
                            <option value="">Seleziona</option>
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
                
                <div className="form-group form-group-full">
                    <label className="form-label">Descrizione</label>
                    <textarea
                        className="form-input form-textarea"
                        placeholder="Racconta di cosa si tratta..."
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        required
                    />
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Luogo</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Dove si terrà"
                            value={formData.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Data/Ora</label>
                        <input
                            type="datetime-local"
                            className="form-input"
                            value={formData.event_date}
                            onChange={(e) => handleChange('event_date', e.target.value)}
                            required
                        />
                    </div>
                </div>
                
                {error && (
                    <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                )}
                
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>Creazione...</span>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-plus-circle"></i>
                            <span>Crea Evento</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

// 🔹 PROFILE PAGE
function ProfilePage({ supabase, user, theme, onToggleTheme }) {
    const [stats, setStats] = React.useState({ events: 0, joined: 0, points: 0 });

    React.useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const { data: created } = await supabase.from('events').select('id').eq('creator_id', user.id);
        const { data: joined } = await supabase.from('event_participants').select('event_id').eq('user_id', user.id);
        
        const eventsCount = created?.length || 0;
        const joinedCount = joined?.length || 0;
        const points = eventsCount * 5 + joinedCount * 2;
        
        setStats({ events: eventsCount, joined: joinedCount, points });
    };

    return (
        <div className="profile-wrapper">
            <div className="profile-header">
                <div className="profile-avatar">
                    {user.email[0].toUpperCase()}
                </div>
                <div className="profile-name">{user.email}</div>
                <div className="profile-email">Membro SocialSpot</div>
                
                <div className="profile-stats">
                    <div className="stat-item">
                        <div className="stat-number">{stats.events}</div>
                        <div className="stat-label">Eventi Creati</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{stats.joined}</div>
                        <div className="stat-label">Partecipazioni</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{stats.points}</div>
                        <div className="stat-label">Punti</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

window.Auth = Auth;
window.EventFeed = EventFeed;
window.CreateEvent = CreateEvent;
window.ProfilePage = ProfilePage;
