/*
 * components.js - SocialSpot Enhanced Components
 * Componenti avanzati con animazioni, performance ottimizzate e UX migliorata
 */

const { useState, useEffect, useCallback, useMemo, memo } = React;

// 🔹 CONSTANTS
const AVAILABLE_CATEGORIES = [
    'Sport',
    'Musica', 
    'Arte',
    'Cultura',
    'Tecnologia',
    'Cibo',
    'Viaggi',
    'Cinema',
    'All\'aperto',
    'Business',
    'Salute',
    'Gaming'
];

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const EVENT_CACHE = new Map();

// 🔹 UTILITY FUNCTIONS
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const formatEventDate = (date) => {
    const eventDate = new Date(date);
    const now = new Date();
    const diffTime = eventDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Evento passato';
    if (diffDays === 0) return 'Oggi';
    if (diffDays === 1) return 'Domani';
    if (diffDays < 7) return `Tra ${diffDays} giorni`;
    
    return eventDate.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short',
        year: eventDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
};

const getCachedData = (key) => {
    const cached = EVENT_CACHE.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
};

const setCachedData = (key, data) => {
    EVENT_CACHE.set(key, {
        data,
        timestamp: Date.now()
    });
};

// 🔹 ENHANCED AUTH COMPONENT
const Auth = memo(({ supabase, setUser }) => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        interests: []
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const calculatePasswordStrength = useCallback((password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        return strength;
    }, []);

    useEffect(() => {
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
                if (formData.interests.length === 0) {
                    setError('Seleziona almeno un interesse');
                    setLoading(false);
                    return;
                }
                
                if (!formData.fullName.trim()) {
                    setError('Nome completo obbligatorio');
                    setLoading(false);
                    return;
                }
                
                result = await supabase.auth.signUp({ 
                    email: formData.email, 
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName,
                            interests: formData.interests
                        }
                    }
                });
                
                if (result.data?.user && !result.error) {
                    await supabase.from('profiles').insert({ 
                        id: result.data.user.id,
                        username: formData.fullName,
                        interests: formData.interests
                    });
                }
            }
            
            if (result.error) {
                setError(result.error.message);
            } else {
                setUser(result.data.user);
                window.addNotification?.({
                    type: 'success',
                    icon: 'fas fa-check-circle',
                    title: isSignIn ? 'Accesso effettuato!' : 'Registrazione completata!',
                    message: `Benvenuto in SocialSpot!`
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength < 25) return 'var(--color-error-500)';
        if (passwordStrength < 50) return 'var(--color-warning-500)';
        if (passwordStrength < 75) return 'var(--color-secondary-500)';
        return 'var(--color-success-500)';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength < 25) return 'Debole';
        if (passwordStrength < 50) return 'Moderata';
        if (passwordStrength < 75) return 'Buona';
        return 'Forte';
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container animate-scale-in">
                <div className="auth-header">
                    <div className="logo-icon float-animation">
                        <span className="logo-text">SS</span>
                    </div>
                    <h1>SocialSpot</h1>
                    <p>Connettiti con eventi e persone della tua zona</p>
                </div>
                
                <div className="auth-content">
                    <div className="auth-tabs">
                        <button 
                            className={`auth-tab ${isSignIn ? 'active' : ''}`}
                            onClick={() => {
                                setIsSignIn(true);
                                setError(null);
                            }}
                        >
                            Accedi
                        </button>
                        <button 
                            className={`auth-tab ${!isSignIn ? 'active' : ''}`}
                            onClick={() => {
                                setIsSignIn(false);
                                setError(null);
                            }}
                        >
                            Registrati
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">
                                <i className="fas fa-envelope"></i>
                                Email
                            </label>
                            <input 
                                type="email" 
                                className="form-input"
                                value={formData.email} 
                                onChange={(e) => handleInputChange('email', e.target.value)} 
                                required 
                                placeholder="inserisci@email.com"
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <i className="fas fa-lock"></i>
                                Password
                            </label>
                            <input 
                                type="password" 
                                className="form-input"
                                value={formData.password} 
                                onChange={(e) => handleInputChange('password', e.target.value)} 
                                required 
                                placeholder="••••••••"
                                autoComplete={isSignIn ? "current-password" : "new-password"}
                            />
                            {!isSignIn && formData.password && (
                                <div className="password-strength" style={{ marginTop: '8px' }}>
                                    <div className="strength-bar" style={{
                                        width: '100%',
                                        height: '4px',
                                        backgroundColor: 'var(--color-border)',
                                        borderRadius: '2px',
                                        overflow: 'hidden'
                                    }}>
                                        <div 
                                            className="strength-fill"
                                            style={{
                                                width: `${passwordStrength}%`,
                                                height: '100%',
                                                backgroundColor: getPasswordStrengthColor(),
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    </div>
                                    <div style={{ 
                                        fontSize: 'var(--font-size-xs)', 
                                        color: getPasswordStrengthColor(),
                                        marginTop: '4px',
                                        fontWeight: 'var(--font-weight-medium)'
                                    }}>
                                        Sicurezza: {getPasswordStrengthText()}
                                    </div>
                                </div>
                            )}
                        </div>

                        {!isSignIn && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">
                                        <i className="fas fa-user"></i>
                                        Nome completo
                                    </label>
                                    <input 
                                        type="text" 
                                        className="form-input"
                                        value={formData.fullName} 
                                        onChange={(e) => handleInputChange('fullName', e.target.value)} 
                                        placeholder="Il tuo nome" 
                                        required 
                                        autoComplete="name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <i className="fas fa-heart"></i>
                                        Interessi ({formData.interests.length} selezionati)
                                    </label>
                                    <div className="interests-grid">
                                        {AVAILABLE_CATEGORIES.map((cat) => (
                                            <label 
                                                key={cat} 
                                                className={`interest-chip ${formData.interests.includes(cat) ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={cat}
                                                    checked={formData.interests.includes(cat)}
                                                    onChange={() => handleInterestToggle(cat)}
                                                />
                                                <i className="fas fa-check"></i>
                                                <span>{cat}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {error && (
                            <div className="error-message animate-fade-in-up">
                                <i className="fas fa-exclamation-circle"></i> 
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
                                    <i className={isSignIn ? 'fas fa-sign-in-alt' : 'fas fa-user-plus'}></i>
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

// 🔹 ENHANCED EVENT CARD
const EventCard = memo(({ event, onJoin, isFavorite, onToggleFavorite, showParticipantCount = false }) => {
    const [participantCount, setParticipantCount] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    
    const eventDate = useMemo(() => new Date(event.event_date || event.date), [event.event_date, event.date]);
    const formattedDate = useMemo(() => formatEventDate(eventDate), [eventDate]);
    const isUpcoming = eventDate > new Date();
    
    useEffect(() => {
        if (showParticipantCount) {
            const loadParticipantCount = async () => {
                const cached = getCachedData(`participants_${event.id}`);
                if (cached !== null) {
                    setParticipantCount(cached);
                    return;
                }
                
                // This would be implemented with the supabase prop
                // For now, showing placeholder
                const count = Math.floor(Math.random() * 20) + 1;
                setParticipantCount(count);
                setCachedData(`participants_${event.id}`, count);
            };
            
            loadParticipantCount();
        }
    }, [event.id, showParticipantCount]);
    
    return (
        <div 
            className={`event-card ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="event-image">
                <i className="fas fa-calendar-alt"></i>
                {!isUpcoming && (
                    <div className="event-status-overlay" style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}>
                        CONCLUSO
                    </div>
                )}
            </div>
            
            <div className="event-content">
                <div className="event-header">
                    <div>
                        <h3 className="event-title">{event.title}</h3>
                        <span className="event-category">{event.category}</span>
                    </div>
                    <button
                        className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(event);
                        }}
                        title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                    >
                        <i className={isFavorite ? 'fas fa-star' : 'far fa-star'}></i>
                    </button>
                </div>

                <div className="event-meta">
                    <div className="event-meta-item">
                        <i className="fas fa-clock"></i>
                        <span>{formattedDate}</span>
                    </div>
                    <div className="event-meta-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{event.location}</span>
                    </div>
                    {showParticipantCount && (
                        <div className="event-meta-item">
                            <i className="fas fa-users"></i>
                            <span>{participantCount} partecipanti</span>
                        </div>
                    )}
                </div>

                <p className="event-description">
                    {event.description.length > 120 
                        ? `${event.description.substring(0, 120)}...` 
                        : event.description
                    }
                </p>

                <div className="event-actions">
                    <button 
                        className="btn-secondary" 
                        onClick={() => onJoin(event)}
                        disabled={!isUpcoming}
                    >
                        <i className="fas fa-info-circle"></i>
                        {isUpcoming ? 'Dettagli' : 'Visualizza'}
                    </button>
                </div>
            </div>
        </div>
    );
});

// 🔹 ENHANCED GAMIFICATION
const Gamification = memo(({ supabase, user }) => {
    const [stats, setStats] = useState({
        points: 0,
        level: 1,
        createdCount: 0,
        joinedCount: 0,
        loading: true
    });
    const [achievements, setAchievements] = useState([]);

    const ACHIEVEMENTS = [
        { id: 'first_event', name: 'Primo Evento', description: 'Crea il tuo primo evento', icon: 'fas fa-star', requirement: 'events_created >= 1' },
        { id: 'social_butterfly', name: 'Farfalla Sociale', description: 'Partecipa a 5 eventi', icon: 'fas fa-users', requirement: 'events_joined >= 5' },
        { id: 'organizer', name: 'Organizzatore', description: 'Crea 10 eventi', icon: 'fas fa-crown', requirement: 'events_created >= 10' },
        { id: 'level_master', name: 'Maestro', description: 'Raggiungi il livello 5', icon: 'fas fa-trophy', requirement: 'level >= 5' }
    ];

    useEffect(() => {
        const computeStats = async () => {
            try {
                const { data: created } = await supabase
                    .from('events')
                    .select('id')
                    .eq('creator_id', user.id);
                
                const { data: joined } = await supabase
                    .from('event_participants')
                    .select('event_id, events!inner(creator_id)')
                    .eq('user_id', user.id)
                    .neq('events.creator_id', user.id);
                    
                const createdEvents = created ? created.length : 0;
                const joinedEvents = joined ? joined.length : 0;
                const totalPoints = createdEvents * 5 + joinedEvents * 2;
                const level = Math.floor(totalPoints / 100) + 1;
                
                setStats({
                    points: totalPoints,
                    level,
                    createdCount: createdEvents,
                    joinedCount: joinedEvents,
                    loading: false
                });

                // Check achievements
                const unlockedAchievements = ACHIEVEMENTS.filter(achievement => {
                    switch (achievement.id) {
                        case 'first_event': return createdEvents >= 1;
                        case 'social_butterfly': return joinedEvents >= 5;
                        case 'organizer': return createdEvents >= 10;
                        case 'level_master': return level >= 5;
                        default: return false;
                    }
                });

                setAchievements(unlockedAchievements);
                
            } catch (error) {
                console.error('Errore calcolo statistiche:', error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        computeStats();
    }, [supabase, user.id]);

    const progressPercentage = (stats.points % 100);
    const pointsToNextLevel = 100 - progressPercentage;

    if (stats.loading) {
        return (
            <div className="gamification-wrapper">
                <div className="section-header">
                    <h3 className="section-title">
                        <i className="fas fa-trophy section-icon"></i>
                        I tuoi progressi
                    </h3>
                </div>
                <div className="text-center">
                    <div className="skeleton" style={{ height: '100px', marginBottom: '20px' }}></div>
                    <div className="skeleton" style={{ height: '60px' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="gamification-wrapper">
            <div className="section-header">
                <h3 className="section-title">
                    <i className="fas fa-trophy section-icon"></i>
                    I tuoi progressi
                </h3>
            </div>
            
            <div className="stats-grid">
                <div className="stat-item animate-scale-in">
                    <div className="stat-value">{stats.points}</div>
                    <div className="stat-label">Punti</div>
                </div>
                <div className="stat-item animate-scale-in" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-value">{stats.level}</div>
                    <div className="stat-label">Livello</div>
                </div>
                <div className="stat-item animate-scale-in" style={{ animationDelay: '0.2s' }}>
                    <div className="stat-value">{stats.createdCount}</div>
                    <div className="stat-label">Eventi creati</div>
                </div>
                <div className="stat-item animate-scale-in" style={{ animationDelay: '0.3s' }}>
                    <div className="stat-value">{stats.joinedCount}</div>
                    <div className="stat-label">Eventi partecipati</div>
                </div>
            </div>
            
            <div className="level-progress">
                <div 
                    className="progress-bar" 
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
            
            <div className="text-center">
                <small className="text-muted">
                    {pointsToNextLevel} punti al livello {stats.level + 1}
                </small>
            </div>

            {achievements.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                    <h4 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 'bold' }}>
                        <i className="fas fa-medal" style={{ marginRight: '8px', color: 'var(--color-secondary-500)' }}></i>
                        Achievement sbloccati ({achievements.length})
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className="achievement-badge"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 12px',
                                    background: 'linear-gradient(135deg, var(--color-primary-50), var(--color-secondary-50))',
                                    borderRadius: 'var(--radius-full)',
                                    border: '1px solid var(--color-primary-200)',
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: 'var(--font-weight-semibold)'
                                }}
                                title={achievement.description}
                            >
                                <i className={achievement.icon} style={{ color: 'var(--color-primary-600)' }}></i>
                                <span>{achievement.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

// Esporta tutti i componenti
window.SocialSpotComponents = {
    Auth,
    EventCard,
    Gamification
};
