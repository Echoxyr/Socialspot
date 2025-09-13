// Using Supabase client and React hooks defined in components.js
const EventFeed = ({ user }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [participants, setParticipants] = useState({});
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        loadEvents();
        loadFavorites();
        loadParticipants();
        
        const eventsChannel = supabase.channel('events_feed')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'events'
            }, loadEvents)
            .subscribe();

        const participantsChannel = supabase.channel('participants_feed')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'event_participants'
            }, loadParticipants)
            .subscribe();

        return () => {
            supabase.removeChannel(eventsChannel);
            supabase.removeChannel(participantsChannel);
        };
    }, []);

    const loadEvents = async () => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select(`
                    *,
                    profiles!events_creator_id_fkey(username, location)
                `)
                .order('created_at', { ascending: false });
            
            if (!error) {
                setEvents(data || []);
            }
        } catch (err) {
            console.error('Errore caricamento eventi:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadFavorites = async () => {
        try {
            const { data } = await supabase
                .from('event_favorites')
                .select('event_id')
                .eq('user_id', user.id);
            setFavorites(data ? data.map(f => f.event_id) : []);
        } catch (err) {
            console.error('Errore caricamento favoriti:', err);
        }
    };

    const loadParticipants = async () => {
        try {
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
        } catch (err) {
            console.error('Errore caricamento partecipanti:', err);
        }
    };

    const toggleFavorite = async (eventId) => {
        const isFavorite = favorites.includes(eventId);
        try {
            if (isFavorite) {
                await supabase
                    .from('event_favorites')
                    .delete()
                    .eq('event_id', eventId)
                    .eq('user_id', user.id);
                setFavorites(favorites.filter(id => id !== eventId));
            } else {
                await supabase
                    .from('event_favorites')
                    .insert({ event_id: eventId, user_id: user.id });
                setFavorites([...favorites, eventId]);
            }
        } catch (err) {
            console.error('Errore toggle favorito:', err);
        }
    };

    const toggleJoin = async (eventId) => {
        const isJoined = participants.userParticipations?.includes(eventId);
        try {
            if (isJoined) {
                await supabase
                    .from('event_participants')
                    .delete()
                    .eq('event_id', eventId)
                    .eq('user_id', user.id);
            } else {
                await supabase
                    .from('event_participants')
                    .insert({ event_id: eventId, user_id: user.id });
            }
            loadParticipants();
        } catch (err) {
            console.error('Errore toggle partecipazione:', err);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                <p className="feed-subtitle">Scopri esperienze interessanti nella tua zona</p>
            </div>
            
            <div className="event-list">
                {events.length === 0 ? (
                    <div className="empty-state">
                        <i className="empty-icon fas fa-calendar-alt"></i>
                        <h4>Nessun evento ancora</h4>
                        <p>Sii il primo a creare un evento nella tua zona!</p>
                    </div>
                ) : (
                    events.map(event => (
                        <div key={event.id} className="event-card">
                            <div className="event-image">
                                <i className="fas fa-calendar-alt"></i>
                            </div>
                            <div className="event-content">
                                <div className="event-header">
                                    <div>
                                        <h3 className="event-title">{event.title}</h3>
                                        <span className="event-category">{event.category}</span>
                                    </div>
                                    <button 
                                        className={`favorite-btn ${favorites.includes(event.id) ? 'favorited' : ''}`}
                                        onClick={() => toggleFavorite(event.id)}
                                    >
                                        <i className={favorites.includes(event.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                                    </button>
                                </div>
                                
                                <div className="event-meta">
                                    <div className="event-meta-item">
                                        <i className="fas fa-calendar"></i>
                                        <span>{formatDate(event.event_date)}</span>
                                    </div>
                                    <div className="event-meta-item">
                                        <i className="fas fa-map-marker-alt"></i>
                                        <span>{event.location}</span>
                                    </div>
                                    <div className="event-meta-item">
                                        <i className="fas fa-user"></i>
                                        <span>da {event.profiles?.username || 'Utente'}</span>
                                    </div>
                                    <div className="event-meta-item">
                                        <i className="fas fa-users"></i>
                                        <span>{participants.counts?.[event.id] || 0} partecipanti</span>
                                    </div>
                                </div>
                                
                                <p className="event-description">{event.description}</p>
                                
                                <div className="event-actions">
                                    <button 
                                        className={`btn-secondary ${participants.userParticipations?.includes(event.id) ? 'active' : ''}`}
                                        onClick={() => toggleJoin(event.id)}
                                    >
                                        <i className="fas fa-user-plus"></i>
                                        {participants.userParticipations?.includes(event.id) ? 'Iscritto' : 'Partecipa'}
                                    </button>
                                    <button 
                                        className="btn-outline"
                                        onClick={() => setSelectedEvent(event)}
                                    >
                                        <i className="fas fa-info-circle"></i>
                                        <span>Dettagli</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedEvent && (
                <EventModal 
                    event={selectedEvent} 
                    onClose={() => setSelectedEvent(null)} 
                    user={user}
                    onJoinToggle={loadParticipants}
                />
            )}
        </div>
    );
};

// Event Modal Component
const EventModal = ({ event, onClose, user, onJoinToggle }) => {
    const [participants, setParticipants] = useState([]);
    const [isJoined, setIsJoined] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadParticipants();
    }, []);

    const loadParticipants = async () => {
        try {
            const { data, error } = await supabase
                .from('event_participants')
                .select(`
                    user_id,
                    profiles!event_participants_user_id_fkey(username)
                `)
                .eq('event_id', event.id);

            if (!error) {
                setParticipants(data || []);
                setIsJoined(data?.some(p => p.user_id === user.id) || false);
            }
        } catch (err) {
            console.error('Errore caricamento partecipanti:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinToggle = async () => {
        try {
            if (isJoined) {
                await supabase
                    .from('event_participants')
                    .delete()
                    .eq('event_id', event.id)
                    .eq('user_id', user.id);
            } else {
                await supabase
                    .from('event_participants')
                    .insert({
                        event_id: event.id,
                        user_id: user.id
                    });
            }
            loadParticipants();
            if (onJoinToggle) onJoinToggle();
        } catch (err) {
            console.error('Errore toggle partecipazione:', err);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{event.title}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="event-category" style={{marginBottom: '20px'}}>
                        {event.category}
                    </div>
                    <p style={{marginBottom: '20px', lineHeight: '1.6'}}>
                        {event.description}
                    </p>
                    
                    <div className="event-meta">
                        <div className="event-meta-item">
                            <i className="fas fa-calendar"></i>
                            <span>{new Date(event.event_date).toLocaleString('it-IT')}</span>
                        </div>
                        <div className="event-meta-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{event.location}</span>
                        </div>
                        {event.profiles && (
                            <div className="event-meta-item">
                                <i className="fas fa-user"></i>
                                <span>Organizzato da {event.profiles.username}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="participant-count">
                        <i className="fas fa-users"></i>
                        <span>{participants.length} partecipanti</span>
                    </div>
                    
                    <button 
                        className={`btn-primary ${isJoined ? 'secondary' : ''}`}
                        onClick={handleJoinToggle}
                        disabled={loading}
                        style={{marginTop: '25px'}}
                    >
                        <i className={isJoined ? 'fas fa-user-minus' : 'fas fa-user-plus'}></i>
                        {isJoined ? 'Abbandona evento' : 'Partecipa all\'evento'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// CreateEvent Component
const CreateEvent = ({ user, onEventCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const CATEGORIES = [
        'Sport', 'Musica', 'Arte', 'Cultura', 'Tecnologia', 
        'Cibo', 'Viaggi', 'Cinema', 'All\'aperto', 'Business'
    ];

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);
        
        try {
            const { error } = await supabase.from('events').insert({
                title,
                description,
                location,
                event_date: date,
                category,
                creator_id: user.id
            });
            
            if (error) {
                setError(error.message);
            } else {
                setTitle('');
                setDescription('');
                setLocation('');
                setDate('');
                setCategory('');
                setSuccess(true);
                
                setTimeout(() => {
                    setSuccess(false);
                    if (onEventCreated) onEventCreated();
                }, 2000);
            }
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
                <p className="create-subtitle">Condividi un'esperienza con la community</p>
            </div>
            
            <form onSubmit={handleCreate} className="create-form">
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Titolo evento</label>
                        <input 
                            type="text" 
                            className="form-input"
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required 
                            placeholder="Inserisci un titolo" 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Categoria</label>
                        <select 
                            className="form-input"
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)} 
                            required
                        >
                            <option value="" disabled>Seleziona categoria</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="form-group full-width">
                    <label className="form-label">Descrizione</label>
                    <textarea 
                        className="form-input form-textarea"
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        required 
                        placeholder="Descrivi il tuo evento..."
                    />
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Luogo</label>
                        <input 
                            type="text" 
                            className="form-input"
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)} 
                            required 
                            placeholder="Seleziona una location"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Data e ora</label>
                        <input 
                            type="datetime-local" 
                            className="form-input"
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            required 
                        />
                    </div>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">Evento creato con successo!</div>}
                
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Creazione in corso...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-plus"></i>
                            Crea evento
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

// ProfilePage Component
const ProfilePage = ({ user, onSignOut }) => {
    const [profile, setProfile] = useState({ username: '', location: '', interests: [] });
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ events: 0, followers: 0, following: 0 });

    useEffect(() => {
        loadProfile();
        loadMyEvents();
        loadStats();
    }, []);

    const loadProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (data) {
                setProfile(data);
            }
        } catch (err) {
            console.error('Errore caricamento profilo:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadMyEvents = async () => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('creator_id', user.id)
                .order('event_date', { ascending: false });
            
            if (!error) {
                setMyEvents(data || []);
            }
        } catch (err) {
            console.error('Errore caricamento eventi:', err);
        }
    };

    const loadStats = async () => {
        try {
            const { data: myEvents } = await supabase
                .from('events')
                .select('id')
                .eq('creator_id', user.id);
            
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
                .eq('user_id', user.id);
            
            const followingCount = myParticipations?.length || 0;
            
            setStats({
                events: eventsCount,
                followers: followersCount,
                following: followingCount
            });
        } catch (err) {
            console.error('Errore calcolo statistiche:', err);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <div className="loading-text">Caricamento profilo...</div>
            </div>
        );
    }

    return (
        <div className="profile-wrapper">
            <div className="profile-header">
                <div className="profile-avatar">
                    {profile.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <div className="profile-name">{profile.username || 'Utente'}</div>
                <div className="profile-email">{user.email}</div>
                
                <div className="gamification-wrapper">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-value">{stats.events}</div>
                            <div className="stat-label">Eventi Creati</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{stats.followers}</div>
                            <div className="stat-label">Followers</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{stats.following}</div>
                            <div className="stat-label">Following</div>
                        </div>
                    </div>
                </div>
                
                <button className="btn-primary" onClick={onSignOut} style={{marginTop: '20px'}}>
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>

            {myEvents.length > 0 && (
                <div className="my-events-section">
                    <h3>I miei eventi ({myEvents.length})</h3>
                    <div className="my-events-list">
                        {myEvents.slice(0, 3).map(event => (
                            <div key={event.id} className="my-event-item">
                                <div className="event-info">
                                    <div className="event-title">{event.title}</div>
                                    <div className="event-details">
                                        <div className="event-date">
                                            <i className="fas fa-calendar"></i>
                                            {new Date(event.event_date).toLocaleDateString('it-IT')}
                                        </div>
                                        <div className="event-location">
                                            <i className="fas fa-map-marker-alt"></i>
                                            {event.location}
                                        </div>
                                    </div>
                                </div>
                                <div className="event-status futuro">
                                    <i className="fas fa-clock"></i>
                                    Futuro
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Main App Component
const App = () => {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState('feed');
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setInitializing(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setPage('feed');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    if (initializing) {
        return (
            <div className="loader-screen">
                <div className="loader-content">
                    <div className="app-logo-loading">
                        <div className="logo-icon-loading">
                            <span className="logo-text-loading">SS</span>
                        </div>
                        <h1 className="brand-name-loading">SocialSpot</h1>
                        <p className="brand-tagline">Connetti • Scopri • Partecipa</p>
                    </div>
                    <div className="loading-progress">
                        <div className="progress-bar-loading"></div>
                        <p className="loading-text">Caricamento...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return React.createElement(window.SocialSpotComponents.Auth, { setUser: setUser });
    }

    return (
        <div className="app-container">
            <header className="main-header">
                <div className="header-container">
                    <div className="app-logo-header">
                        <div className="logo-icon">
                            <span className="logo-text">SS</span>
                        </div>
                        <span className="app-name">SocialSpot</span>
                    </div>

                    <nav className="header-nav">
                        <button 
                            className={`nav-btn ${page === 'feed' ? 'active' : ''}`}
                            onClick={() => setPage('feed')}
                        >
                            <i className="fas fa-home"></i>
                            <span>Eventi</span>
                        </button>
                        <button 
                            className={`nav-btn ${page === 'create' ? 'active' : ''}`}
                            onClick={() => setPage('create')}
                        >
                            <i className="fas fa-plus"></i>
                            <span>Crea</span>
                        </button>
                        <button 
                            className={`nav-btn ${page === 'profile' ? 'active' : ''}`}
                            onClick={() => setPage('profile')}
                        >
                            <i className="fas fa-user"></i>
                            <span>Profilo</span>
                        </button>
                    </nav>
                </div>
            </header>

            <main className="main-content">
                {page === 'feed' && <EventFeed user={user} />}
                {page === 'create' && <CreateEvent user={user} onEventCreated={() => setPage('feed')} />}
                {page === 'profile' && <ProfilePage user={user} onSignOut={handleSignOut} />}
            </main>
        </div>
    );
};

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
