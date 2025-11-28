// =====================================================
// components-addon.js - MODIFICATO CON NUOVE FUNZIONALITÀ
// =====================================================

const { useState, useEffect, useCallback, useRef } = React;

// 🔹 COMPONENTE DI AUTENTICAZIONE (ripristinato)
const Auth = React.memo(({ supabase, setUser }) => {
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
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
        setError(null);
    };

    const handleInterestToggle = (interest) => {
        setFormData((prev) => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter((i) => i !== interest)
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
        'Fotografia', 'Moda', 'Natura'
    ];

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="logo-icon">
                        <span className="logo-mark">
                            <i className="fas fa-search"></i>
                            <i className="fas fa-map-marker-alt logo-pin"></i>
                        </span>
                    </div>
                    <h1>SocialSpot</h1>
                    <p>Un nuovo modo di incontrarsi</p>
                </div>

                <div className="auth-content">
                    <div className="auth-tabs">
                        <button
                            className={`auth-tab ${isSignIn ? 'active' : ''}`}
                            onClick={() => setIsSignIn(true)}
                            type="button"
                        >
                            Accedi
                        </button>
                        <button
                            className={`auth-tab ${!isSignIn ? 'active' : ''}`}
                            onClick={() => setIsSignIn(false)}
                            type="button"
                        >
                            Registrati
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="auth-form">
                        {!isSignIn && (
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
                                    placeholder="Il tuo nome completo"
                                    required={!isSignIn}
                                />
                            </div>
                        )}

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
                                placeholder="Il tuo indirizzo email"
                                required
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
                                placeholder="La tua password"
                                required
                            />
                            {!isSignIn && formData.password && (
                                <div className="password-strength" style={{ marginTop: 'var(--space-2)' }}>
                                    <div
                                        className="strength-bar"
                                        style={{
                                            width: `${passwordStrength}%`,
                                            height: '4px',
                                            background:
                                                passwordStrength < 50
                                                    ? 'var(--color-error-500)'
                                                    : passwordStrength < 80
                                                        ? 'var(--color-warning-500)'
                                                        : 'var(--color-success-500)',
                                            transition: 'var(--transition-all)',
                                            borderRadius: 'var(--radius-full)'
                                        }}
                                    />
                                    <span className="strength-text">
                                        {passwordStrength < 50 && 'Debole'}
                                        {passwordStrength >= 50 && passwordStrength < 80 && 'Media'}
                                        {passwordStrength >= 80 && 'Forte'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {!isSignIn && (
                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fas fa-star"></i>
                                    Interessi principali
                                </label>
                                <div className="interests-grid">
                                    {availableInterests.map((interest) => (
                                        <button
                                            key={interest}
                                            type="button"
                                            className={`interest-chip ${formData.interests.includes(interest) ? 'selected' : ''}`}
                                            onClick={() => handleInterestToggle(interest)}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="alert error">
                                <i className="fas fa-exclamation-triangle"></i>
                                {error}
                            </div>
                        )}

                        <button className="btn-primary w-full" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <i className="fas fa-circle-notch fa-spin"></i>
                                    {isSignIn ? 'Accesso in corso...' : 'Creazione account...'}
                                </>
                            ) : (
                                <>
                                    <i className={isSignIn ? 'fas fa-sign-in-alt' : 'fas fa-user-plus'}></i>
                                    {isSignIn ? 'Accedi' : 'Registrati'}
                                </>
                            )}
                        </button>

                        <div className="auth-footer">
                            <div className="security-badges">
                                <span><i className="fas fa-shield-alt"></i> Dati protetti</span>
                                <span><i className="fas fa-lock"></i> Password cifrate</span>
                                <span><i className="fas fa-user-check"></i> Verifica email</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
});

// 🌟 DATI E COSTANTI
const CATEGORIES = [
    'Sport', 'Musica', 'Arte', 'Cultura', 'Tecnologia', 
    'Cibo', 'Viaggi', 'Cinema', 'All\'aperto', 'Business'
];

const AGE_RANGES = [
    { value: '18-25', label: '18-25 anni' },
    { value: '26-35', label: '26-35 anni' },
    { value: '36-50', label: '36-50 anni' },
    { value: '50+', label: '50+ anni' },
    { value: 'tutte', label: 'Tutte le età' }
];

const GENDER_OPTIONS = [
    { value: 'uomo', label: 'Uomo' },
    { value: 'donna', label: 'Donna' },
    { value: 'tutti', label: 'Tutti/Entrambi' }
];

// Lista completa città italiane (parziale - da espandere)
const ITALIAN_CITIES = [
    'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze',
    'Bari', 'Catania', 'Venezia', 'Verona', 'Messina', 'Padova', 'Trieste', 'Taranto',
    'Brescia', 'Prato', 'Parma', 'Modena', 'Reggio Calabria', 'Reggio Emilia', 'Perugia',
            
            window.addNotification?.({
                type: 'info',
                icon: 'fas fa-times-circle',
                title: 'Richiesta annullata',
                message: 'La tua richiesta è stata rimossa'
            });
            loadMyRequests();
        } catch (err) {
            console.error('Errore annullamento richiesta:', err);
        }
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
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '15px',
                    marginBottom: '20px'
                }}>
                    <i className="fas fa-search-location" style={{ 
                        fontSize: '48px',
                        color: '#2563eb',
                        animation: 'float 3s ease-in-out infinite'
                    }}></i>
                    <div className="handshake-graphic">
                        <i className="fas fa-user-friends base"></i>
                        <i className="fas fa-handshake handshake"></i>
                        <i className="fas fa-mobile-alt phone"></i>
                    </div>
                </div>
                <h1 className="feed-title">Un nuovo modo di incontrarsi</h1>
                <p className="feed-subtitle">Cerca, trova, partecipa</p>
            </div>
            
            <div className="event-list">
                {events.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-users" style={{ fontSize: '64px', marginBottom: '20px' }}></i>
                        <h3>Nessun evento disponibile</h3>
                        <p>Sii il primo a creare un evento nella tua zona!</p>
                        <p>Cerca, trova, partecipa</p>
                    </div>
                ) : (
                    events.map(event => {
                        const myStatus = getMyRequestStatus(event.id);
                        const isCreator = event.creator_id === user.id;
                        
                        return (
                            <div key={event.id} className="event-card">
                                <div className="event-image">
                                    <i className="fas fa-calendar-alt"></i>
                                    {event.event_status && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '20px',
                                            right: '20px',
                                            background: event.event_status === 'concluso' ? '#10b981' :
                                                       event.event_status === 'in_esecuzione' ? '#f59e0b' : '#6b7280',
                                            color: 'white',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '700'
                                        }}>
                                            {event.event_status === 'da_iniziare' && 'Da iniziare'}
                                            {event.event_status === 'in_esecuzione' && 'In corso'}
                    })
                )}
            </div>

            {selectedEvent && (
                <EventModal 
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    user={user}
                    supabase={supabase}
                    onUpdate={loadEvents}
                />
            )}
        </div>
    );
}

// Continua nella PARTE 2...
// =====================================================
// components-addon.js PARTE 2 - EventModal completo
// =====================================================

// 🔹 COMPONENT: EventModal (NUOVO - gestione completa evento)
function EventModal({ event, onClose, user, supabase, onUpdate }) {
    const [participants, setParticipants] = useState([]);
    const [pending Requests, setPendingRequests] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [myStatus, setMyStatus] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [presenceValidated, setPresenceValidated] = useState(false);
    
    const isCreator = event.creator_id === user.id;

    useEffect(() => {
        loadParticipants();
        loadPendingRequests();
        loadReviews();
        checkMyStatus();
        
        // Real-time updates
        const channel = supabase.channel(`event_${event.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'event_participants',
                filter: `event_id=eq.${event.id}`
            }, () => {
                loadParticipants();
                loadPendingRequests();
                                        marginTop: '8px',
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        background: event.event_status === 'concluso' ? '#10b981' :
                                                   event.event_status === 'in_esecuzione' ? '#f59e0b' : '#6b7280',
                                        color: 'white',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: '600'
                                    }}>
                                        {event.event_status === 'da_iniziare' && 'Da iniziare'}
                                        {event.event_status === 'in_esecuzione' && 'In corso'}
                                        {event.event_status === 'concluso' && 'Concluso'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// EXPORT dei componenti
window.Auth = Auth;
window.EventFeed = EventFeed;
window.CreateEvent = CreateEvent;
window.ProfilePage = ProfilePage;
index.html
+36
-7564

