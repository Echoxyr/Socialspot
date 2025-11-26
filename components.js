/*
 * SocialSpot - React Components
 * Version: 3.0.0
 */

const { useState, useEffect, useCallback, useRef, memo } = React;

// 🔹 CONSTANTS
const CATEGORIES = [
    'Sport', 'Musica', 'Arte', 'Cultura', 'Tecnologia', 
    'Cibo', 'Viaggi', 'Cinema', 'All\'aperto', 'Business'
];

const ITALIAN_CITIES = [
    'Roma, Lazio', 'Milano, Lombardia', 'Napoli, Campania', 'Torino, Piemonte',
    'Palermo, Sicilia', 'Genova, Liguria', 'Bologna, Emilia-Romagna', 'Firenze, Toscana',
    'Bari, Puglia', 'Catania, Sicilia', 'Venezia, Veneto', 'Verona, Veneto',
    'Messina, Sicilia', 'Padova, Veneto', 'Trieste, Friuli-Venezia Giulia', 'Taranto, Puglia',
    'Brescia, Lombardia', 'Prato, Toscana', 'Parma, Emilia-Romagna', 'Modena, Emilia-Romagna',
    'Reggio Calabria, Calabria', 'Reggio Emilia, Emilia-Romagna', 'Perugia, Umbria', 'Livorno, Toscana',
    'Ravenna, Emilia-Romagna', 'Cagliari, Sardegna', 'Foggia, Puglia', 'Rimini, Emilia-Romagna',
    'Salerno, Campania', 'Ferrara, Emilia-Romagna', 'Sassari, Sardegna', 'Latina, Lazio'
];

const AVAILABLE_INTERESTS = [
    'Sport', 'Musica', 'Cinema', 'Tecnologia', 'Cucina', 
    'Viaggi', 'Arte', 'Lettura', 'Gaming', 'Fitness',
    'Fotografia', 'Moda', 'Natura', 'Business', 'Benessere'
];

const GENDER_OPTIONS = [
    { value: 'male', label: 'Uomo' },
    { value: 'female', label: 'Donna' },
    { value: 'other', label: 'Altro' },
    { value: 'prefer_not_to_say', label: 'Preferisco non dirlo' }
];

// 🔹 HOOK: STATISTICHE TOTALI CORRETTE
function useRealTimeStats(userId, supabase) {
    const [stats, setStats] = useState({ 
        eventsCreated: 0, 
        totalParticipants: 0, 
        eventsJoined: 0 
    });
    const [loading, setLoading] = useState(true);

    const calculateStats = useCallback(async () => {
        if (!userId || !supabase) return;
        
        try {
            // Eventi creati dall'utente (TOTALI)
            const { data: myEvents } = await supabase
                .from('events')
                .select('id')
                .eq('creator_id', userId);
            
            const eventsCreated = myEvents?.length || 0;
            
            // Partecipanti TOTALI agli eventi creati dall'utente
            let totalParticipants = 0;
            if (eventsCreated > 0) {
                const { data: participants } = await supabase
                    .from('event_participants')
                    .select('user_id')
                    .in('event_id', myEvents.map(e => e.id));
                
                const uniqueParticipants = new Set(participants?.map(p => p.user_id) || []);
                totalParticipants = uniqueParticipants.size;
            }
            
            // Eventi a cui l'utente partecipa (TOTALI)
            const { data: myParticipations } = await supabase
                .from('event_participants')
                .select('event_id')
                .eq('user_id', userId);
            
            const eventsJoined = myParticipations?.length || 0;
            
            setStats({
                eventsCreated,
                totalParticipants,
                eventsJoined
            });
        } catch (err) {
            console.error('❌ Errore calcolo statistiche:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, supabase]);

    useEffect(() => {
        calculateStats();
        
        if (!supabase) return;
        
        // Real-time updates
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
                table: 'event_participants'
            }, calculateStats)
            .subscribe();

        return () => {
            supabase.removeChannel(eventsChannel);
            supabase.removeChannel(participantsChannel);
        };
    }, [calculateStats, userId, supabase]);

    return { stats, loading, refresh: calculateStats };
}

// 🔹 COMPONENT: HEADER
function Header({ user, theme, toggleTheme, onSignOut }) {
    const [showMenu, setShowMenu] = useState(false);

    return React.createElement('header', { className: 'main-header' },
        React.createElement('div', { className: 'header-container' },
            React.createElement('button', {
                className: 'hamburger-menu',
                onClick: () => setShowMenu(true)
            },
                React.createElement('i', { className: 'fas fa-bars' })
            ),
            React.createElement('div', { className: 'app-logo-header' },
                React.createElement('div', { className: 'logo-icon' },
                    React.createElement('span', null, 'SS')
                ),
                React.createElement('span', { className: 'app-name' }, 'SocialSpot')
            )
        ),
        showMenu && React.createElement(SideMenu, {
            user,
            theme,
            toggleTheme,
            onClose: () => setShowMenu(false),
            onSignOut
        })
    );
}

// 🔹 COMPONENT: SIDE MENU
function SideMenu({ user, theme, toggleTheme, onClose, onSignOut }) {
    return React.createElement('div', null,
        React.createElement('div', {
            className: 'side-menu-overlay',
            onClick: onClose
        }),
        React.createElement('div', { className: 'side-menu' },
            React.createElement('div', { className: 'side-menu-header' },
                React.createElement('div', { className: 'user-info' },
                    React.createElement('div', { className: 'user-avatar' },
                        user.email[0].toUpperCase()
                    ),
                    React.createElement('div', { className: 'user-details' },
                        React.createElement('h3', null, user.email.split('@')[0]),
                        React.createElement('p', null, user.email)
                    )
                ),
                React.createElement('button', {
                    className: 'side-menu-close',
                    onClick: onClose
                },
                    React.createElement('i', { className: 'fas fa-times' })
                )
            ),
            React.createElement('div', { className: 'side-menu-content' },
                React.createElement('div', { className: 'theme-section' },
                    React.createElement('div', { className: 'theme-toggle-section' },
                        React.createElement('div', { className: 'theme-info' },
                            React.createElement('i', { className: theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun' }),
                            React.createElement('span', null, theme === 'dark' ? 'Tema Scuro' : 'Tema Chiaro')
                        ),
                        React.createElement('button', {
                            className: 'theme-switch',
                            onClick: toggleTheme
                        },
                            React.createElement('i', { 
                                className: theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon' 
                            })
                        )
                    )
                )
            ),
            React.createElement('div', { className: 'side-menu-footer' },
                React.createElement('p', null, 'SocialSpot v3.0.0'),
                React.createElement('p', null, '© 2024 - Made with ❤️')
            )
        )
    );
}

// 🔹 COMPONENT: BOTTOM NAV
function BottomNav({ currentPage, setPage }) {
    const navItems = [
        { id: 'feed', icon: 'fa-home', label: 'Feed' },
        { id: 'search', icon: 'fa-search', label: 'Cerca' },
        { id: 'create', icon: 'fa-plus-circle', label: 'Crea' },
        { id: 'notifications', icon: 'fa-bell', label: 'Notifiche' },
        { id: 'profile', icon: 'fa-user', label: 'Profilo' }
    ];

    return React.createElement('nav', { className: 'bottom-nav' },
        navItems.map(item =>
            React.createElement('button', {
                key: item.id,
                className: `nav-btn ${currentPage === item.id ? 'active' : ''}`,
                onClick: () => setPage(item.id)
            },
                React.createElement('i', { className: `fas ${item.icon}` }),
                React.createElement('span', null, item.label)
            )
        )
    );
}

// 🔹 COMPONENT: AUTH
const Auth = memo(({ supabase, setUser }) => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        username: '',
        dateOfBirth: '',
        gender: '',
        phone: '',
        interests: []
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const calculatePasswordStrength = useCallback((password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 10;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 15;
        return Math.min(strength, 100);
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
        setSuccess(null);
    };

    const handleInterestToggle = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const validateForm = () => {
        if (!isSignIn) {
            if (!formData.fullName.trim()) {
                setError('Inserisci il tuo nome completo');
                return false;
            }
            if (!formData.username.trim()) {
                setError('Inserisci un username');
                return false;
            }
            if (formData.username.length < 3) {
                setError('L\'username deve essere di almeno 3 caratteri');
                return false;
            }
            if (!formData.dateOfBirth) {
                setError('Inserisci la tua data di nascita');
                return false;
            }
            
            const birthDate = new Date(formData.dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (age < 13 || (age === 13 && monthDiff < 0)) {
                setError('Devi avere almeno 13 anni per registrarti');
                return false;
            }
            
            if (!formData.gender) {
                setError('Seleziona il tuo genere');
                return false;
            }
            
            if (formData.password !== formData.confirmPassword) {
                setError('Le password non corrispondono');
                return false;
            }
            
            if (formData.password.length < 8) {
                setError('La password deve essere di almeno 8 caratteri');
                return false;
            }
            
            if (formData.interests.length === 0) {
                setError('Seleziona almeno un interesse');
                return false;
            }
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Inserisci un indirizzo email valido');
            return false;
        }
        
        return true;
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            let result;
            
            if (isSignIn) {
                result = await supabase.auth.signInWithPassword({ 
                    email: formData.email, 
                    password: formData.password 
                });
                
                if (result.error) {
                    setError(result.error.message === 'Invalid login credentials' 
                        ? 'Email o password non corretti' 
                        : result.error.message);
                    return;
                }
                
                if (result.data.user) {
                    setUser(result.data.user);
                    window.addNotification?.({
                        type: 'success',
                        icon: 'fas fa-check-circle',
                        title: 'Accesso effettuato!',
                        message: 'Bentornato su SocialSpot!'
                    });
                }
            } else {
                result = await supabase.auth.signUp({ 
                    email: formData.email, 
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName.trim(),
                            username: formData.username.trim().toLowerCase(),
                            date_of_birth: formData.dateOfBirth,
                            gender: formData.gender,
                            phone: formData.phone || null,
                            interests: formData.interests
                        },
                        emailRedirectTo: window.location.origin
                    }
                });
                
                if (result.error) {
                    if (result.error.message.includes('already registered')) {
                        setError('Questa email è già registrata. Prova ad effettuare il login.');
                    } else if (result.error.message.includes('Username')) {
                        setError('Questo username è già in uso. Scegline un altro.');
                    } else {
                        setError(result.error.message);
                    }
                    return;
                }
                
                if (result.data.user) {
                    setSuccess('Registrazione completata! Controlla la tua email per verificare il tuo account.');
                    
                    window.addNotification?.({
                        type: 'success',
                        icon: 'fas fa-envelope-open-text',
                        title: 'Registrazione completata!',
                        message: 'Ti abbiamo inviato un\'email di conferma.'
                    });
                    
                    setFormData({
                        email: '',
                        password: '',
                        confirmPassword: '',
                        fullName: '',
                        username: '',
                        dateOfBirth: '',
                        gender: '',
                        phone: '',
                        interests: []
                    });
                    
                    setTimeout(() => {
                        setIsSignIn(true);
                        setSuccess(null);
                    }, 3000);
                }
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError('Errore di connessione. Riprova.');
        } finally {
            setLoading(false);
        }
    };

    return React.createElement('div', { className: 'auth-wrapper' },
        React.createElement('div', { className: 'auth-container' },
            React.createElement('div', { className: 'auth-header' },
                React.createElement('div', { className: 'logo-icon' },
                    React.createElement('span', { className: 'logo-text' }, 'SS')
                ),
                React.createElement('h1', null, 'SocialSpot'),
                React.createElement('p', null, '✨ La tua community per eventi locali')
            ),
            React.createElement('div', { className: 'auth-content' },
                React.createElement('div', { className: 'auth-tabs' },
                    React.createElement('button', {
                        className: `auth-tab ${isSignIn ? 'active' : ''}`,
                        onClick: () => {
                            setIsSignIn(true);
                            setError(null);
                            setSuccess(null);
                        }
                    }, 'Accedi'),
                    React.createElement('button', {
                        className: `auth-tab ${!isSignIn ? 'active' : ''}`,
                        onClick: () => {
                            setIsSignIn(false);
                            setError(null);
                            setSuccess(null);
                        }
                    }, 'Registrati')
                ),
                React.createElement('form', { 
                    onSubmit: handleAuth, 
                    className: 'auth-form' 
                },
                    !isSignIn && React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' },
                            React.createElement('i', { className: 'fas fa-user' }),
                            ' Nome completo *'
                        ),
                        React.createElement('input', {
                            type: 'text',
                            className: 'form-input',
                            value: formData.fullName,
                            onChange: (e) => handleInputChange('fullName', e.target.value),
                            placeholder: 'Es: Mario Rossi',
                            required: !isSignIn
                        })
                    ),
                    !isSignIn && React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' },
                            React.createElement('i', { className: 'fas fa-at' }),
                            ' Username *'
                        ),
                        React.createElement('input', {
                            type: 'text',
                            className: 'form-input',
                            value: formData.username,
                            onChange: (e) => handleInputChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')),
                            placeholder: 'Es: mario_rossi',
                            required: !isSignIn,
                            minLength: 3
                        })
                    ),
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' },
                            React.createElement('i', { className: 'fas fa-envelope' }),
                            ' Email *'
                        ),
                        React.createElement('input', {
                            type: 'email',
                            className: 'form-input',
                            value: formData.email,
                            onChange: (e) => handleInputChange('email', e.target.value),
                            placeholder: 'il-tuo-indirizzo@email.com',
                            required: true,
                            autoComplete: 'email'
                        })
                    ),
                    !isSignIn && React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' },
                            React.createElement('i', { className: 'fas fa-calendar' }),
                            ' Data di nascita *'
                        ),
                        React.createElement('input', {
                            type: 'date',
                            className: 'form-input',
                            value: formData.dateOfBirth,
                            onChange: (e) => handleInputChange('dateOfBirth', e.target.value),
                            max: new Date().toISOString().split('T')[0],
                            required: !isSignIn
                        })
                    ),
                    !isSignIn && React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' },
                            React.createElement('i', { className: 'fas fa-venus-mars' }),
                            ' Genere *'
                        ),
                        React.createElement('select', {
                            className: 'form-input',
                            value: formData.gender,
                            onChange: (e) => handleInputChange('gender', e.target.value),
                            required: !isSignIn
                        },
                            React.createElement('option', { value: '', disabled: true }, 'Seleziona...'),
                            GENDER_OPTIONS.map(opt =>
                                React.createElement('option', { key: opt.value, value: opt.value }, opt.label)
                            )
                        )
                    ),
                    !isSignIn && React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' },
                            React.createElement('i', { className: 'fas fa-phone' }),
                            ' Telefono (opzionale)'
                        ),
                        React.createElement('input', {
                            type: 'tel',
                            className: 'form-input',
                            value: formData.phone,
                            onChange: (e) => handleInputChange('phone', e.target.value),
                            placeholder: '+39 123 456 7890'
                        })
                    ),
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' },
                            React.createElement('i', { className: 'fas fa-lock' }),
                            ' Password *'
                        ),
                        React.createElement('input', {
                            type: 'password',
                            className: 'form-input',
                            value: formData.password,
                            onChange: (e) => handleInputChange('password', e.target.value),
                            placeholder: '••••••••',
                            required: true,
                            minLength: 8,
                            autoComplete: isSignIn ? 'current-password' : 'new-password'
                        }),
                        !isSignIn && formData.password && React.createElement('div', { 
                            className: 'password-strength',
                            style: {
                                marginTop: 'var(--space-2)',
                                height: '4px',
                                background: 'var(--color-border)',
                                borderRadius: 'var(--radius-full)',
                                overflow: 'hidden'
                            }
                        },
                            React.createElement('div', {
                                className: 'strength-bar',
                                style: {
                                    width: `${passwordStrength}%`,
                                    height: '100%',
                                    background: passwordStrength < 40 ? 'var(--color-error-500)' : 
                                               passwordStrength < 70 ? 'var(--color-warning-500)' : 
                                               'var(--color-success-500)',
                                    transition: 'var(--transition-all)'
                                }
                            }),
                            React.createElement('span', {
                                className: 'strength-text',
                                style: {
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--color-text-muted)',
                                    marginTop: 'var(--space-1)',
                                    display: 'block'
                                }
                            }, passwordStrength < 40 ? 'Debole' : passwordStrength < 70 ? 'Media' : 'Forte')
                        )
                    ),
                    !isSignIn && React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' },
                            React.createElement('i', { className: 'fas fa-lock' }),
                            ' Conferma Password *'
                        ),
                        React.createElement('input', {
                            type: 'password',
                            className: 'form-input',
                            value: formData.confirmPassword,
                            onChange: (e) => handleInputChange('confirmPassword', e.target.value),
                            placeholder: '••••••••',
                            required: !isSignIn,
                            minLength: 8,
                            autoComplete: 'new-password'
                        })
                    ),
                    !isSignIn && React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' },
                            React.createElement('i', { className: 'fas fa-star' }),
                            ` Interessi (${formData.interests.length} selezionati) *`
                        ),
                        React.createElement('div', { className: 'interests-grid' },
                            AVAILABLE_INTERESTS.map(interest =>
                                React.createElement('button', {
                                    key: interest,
                                    type: 'button',
                                    className: `interest-chip ${formData.interests.includes(interest) ? 'selected' : ''}`,
                                    onClick: () => handleInterestToggle(interest)
                                }, interest)
                            )
                        )
                    ),
                    error && React.createElement('div', { className: 'error-message' },
                        React.createElement('i', { className: 'fas fa-exclamation-triangle' }),
                        ' ',
                        error
                    ),
                    success && React.createElement('div', { className: 'success-message' },
                        React.createElement('i', { className: 'fas fa-check-circle' }),
                        ' ',
                        success
                    ),
                    React.createElement('button', {
                        type: 'submit',
                        className: 'btn-primary',
                        disabled: loading
                    },
                        loading ? [
                            React.createElement('i', { className: 'fas fa-spinner fa-spin', key: 'icon' }),
                            isSignIn ? ' Accesso in corso...' : ' Registrazione in corso...'
                        ] : [
                            React.createElement('i', { 
                                className: `fas ${isSignIn ? 'fa-sign-in-alt' : 'fa-user-plus'}`,
                                key: 'icon'
                            }),
                            isSignIn ? ' Accedi' : ' Registrati'
                        ]
                    ),
                    !isSignIn && React.createElement('p', {
                        style: {
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-text-muted)',
                            textAlign: 'center',
                            marginTop: 'var(--space-4)',
                            lineHeight: '1.6'
                        }
                    }, 'Registrandoti accetti i nostri Termini di Servizio e la Privacy Policy')
                )
            )
        )
    );
});

// 🔹 COMPONENT: FEED (placeholder - to be implemented)
function Feed({ user, supabase }) {
    return React.createElement('div', { className: 'feed-wrapper' },
        React.createElement('h1', null, 'Feed - In costruzione'),
        React.createElement('p', null, 'Implementazione completa in arrivo...')
    );
}

// 🔹 COMPONENT: SEARCH (placeholder)
function Search({ user, supabase }) {
    return React.createElement('div', { className: 'search-wrapper' },
        React.createElement('h1', null, 'Cerca - In costruzione')
    );
}

// 🔹 COMPONENT: CREATE EVENT (placeholder)
function CreateEvent({ user, supabase, onEventCreated }) {
    return React.createElement('div', { className: 'create-wrapper' },
        React.createElement('h1', null, 'Crea Evento - In costruzione')
    );
}

// 🔹 COMPONENT: PROFILE
function Profile({ user, supabase, onSignOut }) {
    const { stats, loading: statsLoading } = useRealTimeStats(user.id, supabase);

    return React.createElement('div', { className: 'profile-wrapper' },
        React.createElement('div', { className: 'profile-header' },
            React.createElement('div', { className: 'profile-avatar' },
                user.email[0].toUpperCase()
            ),
            React.createElement('h1', { className: 'profile-name' }, user.email.split('@')[0]),
            React.createElement('p', { className: 'profile-email' }, user.email),
            React.createElement('div', { className: 'stats-grid' },
                React.createElement('div', { className: 'stat-item' },
                    React.createElement('div', { className: 'stat-value' },
                        statsLoading ? '...' : stats.eventsCreated
                    ),
                    React.createElement('div', { className: 'stat-label' }, 'Eventi Creati')
                ),
                React.createElement('div', { className: 'stat-item' },
                    React.createElement('div', { className: 'stat-value' },
                        statsLoading ? '...' : stats.totalParticipants
                    ),
                    React.createElement('div', { className: 'stat-label' }, 'Partecipanti Totali')
                ),
                React.createElement('div', { className: 'stat-item' },
                    React.createElement('div', { className: 'stat-value' },
                        statsLoading ? '...' : stats.eventsJoined
                    ),
                    React.createElement('div', { className: 'stat-label' }, 'Eventi Uniti')
                )
            ),
            React.createElement('button', {
                className: 'btn-primary',
                onClick: onSignOut,
                style: { marginTop: 'var(--space-6)' }
            },
                React.createElement('i', { className: 'fas fa-sign-out-alt' }),
                ' Logout'
            )
        )
    );
}

// 🔹 COMPONENT: NOTIFICATIONS (placeholder)
function Notifications({ user, supabase }) {
    return React.createElement('div', { className: 'notifications-wrapper' },
        React.createElement('h1', null, 'Notifiche - In costruzione')
    );
}
