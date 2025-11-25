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


        // Follow Button Component
const FollowButton = memo(({ supabase, currentUserId, targetUserId, initialFollowing = false }) => {
    const [following, setFollowing] = useState(initialFollowing);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        if (loading) return;
        setLoading(true);

        try {
            if (following) {
                await supabase
                    .from('user_follows')
                    .delete()
                    .eq('follower_id', currentUserId)
                    .eq('following_id', targetUserId);
                setFollowing(false);
            } else {
                await supabase
                    .from('user_follows')
                    .insert({ follower_id: currentUserId, following_id: targetUserId });
                setFollowing(true);
                
                await supabase
                    .from('notifications')
                    .insert({
                        user_id: targetUserId,
                        type: 'new_follower',
                        title: 'Nuovo follower',
                        content: 'Qualcuno ha iniziato a seguirti',
                        data: { follower_id: currentUserId }
                    });
            }
        } catch (err) {
            console.error('Follow toggle error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`btn-sm ${following ? 'btn-outline' : 'btn-primary'}`}
            style={{ minWidth: '100px' }}
        >
            {loading ? (
                <i className="fas fa-spinner fa-spin"></i>
            ) : following ? (
                <>
                    <i className="fas fa-user-check"></i>
                    Segui già
                </>
            ) : (
                <>
                    <i className="fas fa-user-plus"></i>
                    Segui
                </>
            )}
        </button>
    );
});

// Pending Approvals Component
const PendingApprovals = memo(({ supabase, event, user, onUpdate }) => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (event.creator_id === user.id && event.requires_approval) {
            loadPending();

            const channel = supabase
                .channel(`approvals_${event.id}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'event_participants',
                    filter: `event_id=eq.${event.id}`
                }, loadPending)
                .subscribe();

            return () => supabase.removeChannel(channel);
        }
    }, [event.id, event.creator_id, event.requires_approval, user.id]);

    const loadPending = async () => {
        const { data, error } = await supabase
            .from('event_participants')
            .select(`
                id,
                user_id,
                joined_at,
                profiles!event_participants_user_id_fkey(username, location)
            `)
            .eq('event_id', event.id)
            .eq('status', 'pending');

        if (!error) {
            setPending(data || []);
        }
        setLoading(false);
    };

    const handleApproval = async (participantId, approve) => {
        await supabase
            .from('event_participants')
            .update({ status: approve ? 'approved' : 'rejected' })
            .eq('id', participantId);

        loadPending();
        if (onUpdate) onUpdate();
    };

    if (!event.requires_approval || event.creator_id !== user.id || loading) return null;
    if (pending.length === 0) return null;

    return (
        <div style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-6)',
            background: 'var(--color-warning-50)',
            border: '1px solid var(--color-warning-200)',
            borderRadius: 'var(--radius-2xl)'
        }}>
            <h4 style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-4)',
                fontWeight: 'var(--font-weight-bold)'
            }}>
                <i className="fas fa-clock"></i>
                Richieste in attesa ({pending.length})
            </h4>
            {pending.map(p => (
                <div key={p.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-4)',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-xl)',
                    marginBottom: 'var(--space-3)'
                }}>
                    <div>
                        <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                            {p.profiles?.username || 'Utente'}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                            {new Date(p.joined_at).toLocaleString('it-IT')}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                            onClick={() => handleApproval(p.id, true)}
                            className="btn-sm btn-primary"
                        >
                            <i className="fas fa-check"></i>
                            Approva
                        </button>
                        <button
                            onClick={() => handleApproval(p.id, false)}
                            className="btn-sm btn-outline"
                            style={{ color: 'var(--color-error-600)', borderColor: 'var(--color-error-600)' }}
                        >
                            <i className="fas fa-times"></i>
                            Rifiuta
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
});

// Notifications Bell Component
const NotificationsBell = memo(({ supabase, user }) => {
    const [unread, setUnread] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        loadNotifications();

        const channel = supabase
            .channel('notifications_realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, () => {
                loadNotifications();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [user.id]);

    const loadNotifications = async () => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (!error && data) {
            setNotifications(data);
            setUnread(data.filter(n => !n.is_read).length);
        }
    };

    const markAsRead = async (id) => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);
        loadNotifications();
    };

    const markAllRead = async () => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
        loadNotifications();
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                    position: 'relative',
                    padding: 'var(--space-3)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-xl)',
                    color: 'var(--color-text)'
                }}
            >
                <i className="fas fa-bell"></i>
                {unread > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        background: 'var(--color-error-500)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold'
                    }}>
                        {unread}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 999
                        }}
                        onClick={() => setShowDropdown(false)}
                    />
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: 'var(--space-2)',
                        width: '350px',
                        maxHeight: '500px',
                        overflowY: 'auto',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-2xl)',
                        boxShadow: 'var(--shadow-2xl)',
                        zIndex: 1000
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--space-4)',
                            borderBottom: '1px solid var(--color-border)'
                        }}>
                            <h4 style={{ fontWeight: 'var(--font-weight-bold)' }}>Notifiche</h4>
                            {unread > 0 && (
                                <button
                                    onClick={markAllRead}
                                    style={{
                                        padding: 'var(--space-2) var(--space-3)',
                                        fontSize: 'var(--font-size-xs)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-primary-600)',
                                        cursor: 'pointer',
                                        fontWeight: 'var(--font-weight-semibold)'
                                    }}
                                >
                                    Segna tutte lette
                                </button>
                            )}
                        </div>

                        {notifications.length === 0 ? (
                            <div style={{
                                padding: 'var(--space-12)',
                                textAlign: 'center',
                                color: 'var(--color-text-muted)'
                            }}>
                                <i className="fas fa-bell-slash" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}></i>
                                <p>Nessuna notifica</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => {
                                        if (!n.is_read) markAsRead(n.id);
                                    }}
                                    style={{
                                        padding: 'var(--space-4)',
                                        borderBottom: '1px solid var(--color-border)',
                                        cursor: 'pointer',
                                        background: n.is_read ? 'transparent' : 'var(--color-primary-50)',
                                        transition: 'var(--transition-colors)'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'var(--color-primary-50)'}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: 'var(--space-2)'
                                    }}>
                                        <div style={{ fontWeight: 'var(--font-weight-semibold)', flex: 1 }}>
                                            {n.title}
                                        </div>
                                        {!n.is_read && (
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                background: 'var(--color-primary-600)',
                                                borderRadius: '50%'
                                            }} />
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--color-text-muted)',
                                        marginBottom: 'var(--space-1)'
                                    }}>
                                        {n.content}
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        {new Date(n.created_at).toLocaleString('it-IT')}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
});
