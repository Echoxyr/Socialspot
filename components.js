// 🔹 AUTH UNIFICATO E CORRETTO
const { useState, useEffect, memo, useCallback } = React;

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

    return React.createElement('div', { className: 'auth-wrapper' },
        React.createElement('div', { className: 'auth-container' },
            React.createElement('div', { className: 'auth-header' },
                React.createElement('div', { className: 'logo-icon' },
                    React.createElement('span', { className: 'logo-text' }, 'SS')
                ),
                React.createElement('h1', null, 'SocialSpot'),
                React.createElement('p', null, 'Connetti, Crea, Condividi')
            ),

            React.createElement('div', { className: 'auth-content' },
                React.createElement('div', { className: 'auth-tabs' },
                    React.createElement('button', {
                        className: `auth-tab ${isSignIn ? 'active' : ''}`,
                        onClick: () => setIsSignIn(true)
                    }, 'Accedi'),
                    React.createElement('button', {
                        className: `auth-tab ${!isSignIn ? 'active' : ''}`,
                        onClick: () => setIsSignIn(false)
                    }, 'Registrati')
                ),

                React.createElement('form', { 
                    onSubmit: handleAuth, 
                    className: 'auth-form' 
                },
                    !isSignIn && React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' },
                            React.createElement('i', { className: 'fas fa-user' }),
                            ' Nome completo'
                        ),
                        React.createElement('input', {
                            type: 'text',
                            className: 'form-input',
                            value: formData.fullName,
                            onChange: (e) => handleInputChange('fullName', e.target.value),
                            placeholder: 'Il tuo nome completo',
                            required: !isSignIn
                        })
                    ),

                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' },
                            React.createElement('i', { className: 'fas fa-envelope' }),
                            ' Email'
                        ),
                        React.createElement('input', {
                            type: 'email',
                            className: 'form-input',
                            value: formData.email,
                            onChange: (e) => handleInputChange('email', e.target.value),
                            placeholder: 'Il tuo indirizzo email',
                            required: true
                        })
                    ),

                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' },
                            React.createElement('i', { className: 'fas fa-lock' }),
                            ' Password'
                        ),
                        React.createElement('input', {
                            type: 'password',
                            className: 'form-input',
                            value: formData.password,
                            onChange: (e) => handleInputChange('password', e.target.value),
                            placeholder: 'La tua password',
                            required: true
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
                                    background: passwordStrength < 50 ? 'var(--color-error-500)' : 
                                               passwordStrength < 80 ? 'var(--color-warning-500)' : 
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
                            }, passwordStrength < 50 ? 'Debole' : passwordStrength < 80 ? 'Media' : 'Forte')
                        )
                    ),

                    !isSignIn && React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' },
                            React.createElement('i', { className: 'fas fa-star' }),
                            ` Interessi (${formData.interests.length}/5)`
                        ),
                        React.createElement('div', { className: 'interests-grid' },
                            availableInterests.map(interest =>
                                React.createElement('button', {
                                    key: interest,
                                    type: 'button',
                                    className: `interest-chip ${formData.interests.includes(interest) ? 'selected' : ''}`,
                                    onClick: () => handleInterestToggle(interest),
                                    disabled: !formData.interests.includes(interest) && formData.interests.length >= 5
                                }, interest)
                            )
                        )
                    ),

                    error && React.createElement('div', { className: 'error-message' },
                        React.createElement('i', { className: 'fas fa-exclamation-triangle' }),
                        ' ',
                        error
                    ),

                    React.createElement('button', {
                        type: 'submit',
                        className: 'btn-primary',
                        disabled: loading
                    },
                        loading ? [
                            React.createElement('i', { className: 'fas fa-spinner fa-spin', key: 'icon' }),
                            isSignIn ? ' Accesso...' : ' Registrazione...'
                        ] : [
                            React.createElement('i', { 
                                className: `fas ${isSignIn ? 'fa-sign-in-alt' : 'fa-user-plus'}`,
                                key: 'icon'
                            }),
                            isSignIn ? ' Accedi' : ' Registrati'
                        ]
                    )
                )
            )
        )
    );
});

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

    return React.createElement('button', {
        onClick: handleToggle,
        disabled: loading,
        className: `btn-sm ${following ? 'btn-outline' : 'btn-primary'}`,
        style: { minWidth: '100px' }
    }, 
        loading ? React.createElement('i', { className: 'fas fa-spinner fa-spin' }) :
        following ? [
            React.createElement('i', { className: 'fas fa-user-check', key: 'icon' }),
            ' Segui già'
        ] : [
            React.createElement('i', { className: 'fas fa-user-plus', key: 'icon' }),
            ' Segui'
        ]
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

    return React.createElement('div', {
        style: {
            marginTop: 'var(--space-6)',
            padding: 'var(--space-6)',
            background: 'var(--color-warning-50)',
            border: '1px solid var(--color-warning-200)',
            borderRadius: 'var(--radius-2xl)'
        }
    },
        React.createElement('h4', {
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-4)',
                fontWeight: 'var(--font-weight-bold)'
            }
        },
            React.createElement('i', { className: 'fas fa-clock' }),
            ` Richieste in attesa (${pending.length})`
        ),
        pending.map(p => React.createElement('div', {
            key: p.id,
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-4)',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                marginBottom: 'var(--space-3)'
            }
        },
            React.createElement('div', null,
                React.createElement('div', { 
                    style: { fontWeight: 'var(--font-weight-semibold)' } 
                }, p.profiles?.username || 'Utente'),
                React.createElement('div', { 
                    style: { fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' } 
                }, new Date(p.joined_at).toLocaleString('it-IT'))
            ),
            React.createElement('div', { style: { display: 'flex', gap: 'var(--space-2)' } },
                React.createElement('button', {
                    onClick: () => handleApproval(p.id, true),
                    className: 'btn-sm btn-primary'
                },
                    React.createElement('i', { className: 'fas fa-check' }),
                    ' Approva'
                ),
                React.createElement('button', {
                    onClick: () => handleApproval(p.id, false),
                    className: 'btn-sm btn-outline',
                    style: { color: 'var(--color-error-600)', borderColor: 'var(--color-error-600)' }
                },
                    React.createElement('i', { className: 'fas fa-times' }),
                    ' Rifiuta'
                )
            )
        ))
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

    return React.createElement('div', { style: { position: 'relative' } },
        React.createElement('button', {
            onClick: () => setShowDropdown(!showDropdown),
            style: {
                position: 'relative',
                padding: 'var(--space-3)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--font-size-xl)',
                color: 'var(--color-text)'
            }
        },
            React.createElement('i', { className: 'fas fa-bell' }),
            unread > 0 && React.createElement('span', {
                style: {
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
                }
            }, unread)
        ),
        showDropdown && [
            React.createElement('div', {
                key: 'overlay',
                style: { position: 'fixed', inset: 0, zIndex: 999 },
                onClick: () => setShowDropdown(false)
            }),
            React.createElement('div', {
                key: 'dropdown',
                style: {
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
                }
            },
                React.createElement('div', {
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--space-4)',
                        borderBottom: '1px solid var(--color-border)'
                    }
                },
                    React.createElement('h4', { style: { fontWeight: 'var(--font-weight-bold)' } }, 'Notifiche'),
                    unread > 0 && React.createElement('button', {
                        onClick: markAllRead,
                        style: {
                            padding: 'var(--space-2) var(--space-3)',
                            fontSize: 'var(--font-size-xs)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-primary-600)',
                            cursor: 'pointer',
                            fontWeight: 'var(--font-weight-semibold)'
                        }
                    }, 'Segna tutte lette')
                ),
                notifications.length === 0 ? 
                    React.createElement('div', {
                        style: {
                            padding: 'var(--space-12)',
                            textAlign: 'center',
                            color: 'var(--color-text-muted)'
                        }
                    },
                        React.createElement('i', { 
                            className: 'fas fa-bell-slash', 
                            style: { fontSize: '2rem', marginBottom: 'var(--space-4)' } 
                        }),
                        React.createElement('p', null, 'Nessuna notifica')
                    ) :
                    notifications.map(n => React.createElement('div', {
                        key: n.id,
                        onClick: () => { if (!n.is_read) markAsRead(n.id); },
                        style: {
                            padding: 'var(--space-4)',
                            borderBottom: '1px solid var(--color-border)',
                            cursor: 'pointer',
                            background: n.is_read ? 'transparent' : 'var(--color-primary-50)',
                            transition: 'var(--transition-colors)'
                        }
                    },
                        React.createElement('div', {
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: 'var(--space-2)'
                            }
                        },
                            React.createElement('div', { 
                                style: { fontWeight: 'var(--font-weight-semibold)', flex: 1 } 
                            }, n.title),
                            !n.is_read && React.createElement('div', {
                                style: {
                                    width: '8px',
                                    height: '8px',
                                    background: 'var(--color-primary-600)',
                                    borderRadius: '50%'
                                }
                            })
                        ),
                        React.createElement('div', {
                            style: {
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-muted)',
                                marginBottom: 'var(--space-1)'
                            }
                        }, n.content),
                        React.createElement('div', {
                            style: {
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--color-text-muted)'
                            }
                        }, new Date(n.created_at).toLocaleString('it-IT'))
                    ))
            )
        ]
    );
});
// ========================================
// AGGIUNGI QUESTO ALLA FINE DI components.js
// ========================================

// EventFeed Component
function EventFeed({ supabase, user }) {
    const [events, setEvents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [favorites, setFavorites] = React.useState([]);
    const [participants, setParticipants] = React.useState({});
    const [selectedEvent, setSelectedEvent] = React.useState(null);

    React.useEffect(() => {
        loadEvents();
        loadFavorites();
        loadParticipants();
    }, []);

    const loadEvents = async () => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*, profiles!events_creator_id_fkey(username, location)')
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

    if (loading) {
        return React.createElement('div', { className: 'loading' },
            React.createElement('div', { className: 'spinner' }),
            React.createElement('div', { className: 'loading-text' }, 'Caricamento eventi...')
        );
    }

    return React.createElement('div', { className: 'feed-wrapper' },
        React.createElement('div', { className: 'feed-header' },
            React.createElement('h1', { className: 'feed-title' }, '🚀 Scopri Eventi'),
            React.createElement('p', { className: 'feed-subtitle' }, 'Trova esperienze nella tua zona')
        ),
        React.createElement('div', { className: 'event-list' },
            events.length === 0 ? 
                React.createElement('div', { className: 'empty-state' },
                    React.createElement('i', { className: 'fas fa-calendar-times empty-icon' }),
                    React.createElement('h4', null, 'Nessun evento ancora'),
                    React.createElement('p', null, 'Sii il primo a creare un evento!')
                ) :
                events.map(event => 
                    React.createElement('div', { key: event.id, className: 'event-card' },
                        React.createElement('div', { className: 'event-image' },
                            React.createElement('i', { className: 'fas fa-calendar-alt' })
                        ),
                        React.createElement('div', { className: 'event-content' },
                            React.createElement('div', { className: 'event-header' },
                                React.createElement('div', null,
                                    React.createElement('h3', { className: 'event-title' }, event.title),
                                    React.createElement('span', { className: 'event-category' }, event.category || 'Generale')
                                ),
                                React.createElement('button', {
                                    className: `favorite-btn ${favorites.includes(event.id) ? 'favorited' : ''}`,
                                    onClick: () => toggleFavorite(event.id)
                                },
                                    React.createElement('i', { 
                                        className: favorites.includes(event.id) ? 'fas fa-heart' : 'far fa-heart'
                                    })
                                )
                            ),
                            React.createElement('p', { className: 'event-description' }, event.description),
                            React.createElement('div', { className: 'event-meta' },
                                React.createElement('div', { className: 'event-meta-item' },
                                    React.createElement('i', { className: 'fas fa-user' }),
                                    React.createElement('span', null, event.profiles?.username || 'Utente')
                                ),
                                React.createElement('div', { className: 'event-meta-item' },
                                    React.createElement('i', { className: 'fas fa-map-marker-alt' }),
                                    React.createElement('span', null, event.location || 'Online')
                                ),
                                React.createElement('div', { className: 'event-meta-item' },
                                    React.createElement('i', { className: 'fas fa-calendar' }),
                                    React.createElement('span', null, event.event_date ? new Date(event.event_date).toLocaleDateString('it-IT') : 'Data da definire')
                                ),
                                React.createElement('div', { className: 'event-meta-item' },
                                    React.createElement('i', { className: 'fas fa-users' }),
                                    React.createElement('span', null, `${participants.counts?.[event.id] || 0} partecipanti`)
                                )
                            ),
                            React.createElement('div', { className: 'event-actions' },
                                React.createElement('button', {
                                    className: `btn-primary ${participants.userParticipations?.includes(event.id) ? 'btn-outline' : ''}`,
                                    onClick: () => toggleJoin(event.id)
                                },
                                    React.createElement('i', { className: 'fas fa-user-plus' }),
                                    participants.userParticipations?.includes(event.id) ? ' Iscritto' : ' Partecipa'
                                ),
                                React.createElement('button', {
                                    className: 'btn-outline',
                                    onClick: () => setSelectedEvent(event)
                                },
                                    React.createElement('i', { className: 'fas fa-info-circle' }),
                                    ' Dettagli'
                                )
                            )
                        )
                    )
                )
        )
    );
}

// CreateEvent Component
function CreateEvent({ supabase, user, onEventCreated }) {
    const [formData, setFormData] = React.useState({
        title: '',
        description: '',
        location: '',
        event_date: '',
        category: ''
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const { error: insertError } = await supabase
                .from('events')
                .insert({
                    title: formData.title,
                    description: formData.description,
                    location: formData.location,
                    event_date: formData.event_date,
                    category: formData.category,
                    creator_id: user.id
                });
            
            if (insertError) {
                setError(insertError.message);
            } else {
                setSuccess(true);
                setFormData({
                    title: '',
                    description: '',
                    location: '',
                    event_date: '',
                    category: ''
                });
                
                setTimeout(() => {
                    if (onEventCreated) onEventCreated();
                }, 1500);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['Sport', 'Musica', 'Arte', 'Cultura', 'Tecnologia', 'Cibo', 'Viaggi', 'Cinema', 'All\'aperto', 'Business'];

    return React.createElement('div', { className: 'create-wrapper' },
        React.createElement('div', { className: 'create-header' },
            React.createElement('h1', { className: 'create-title' }, '✨ Crea Nuovo Evento'),
            React.createElement('p', { className: 'create-subtitle' }, 'Condividi un\'esperienza unica con la community')
        ),
        React.createElement('form', { onSubmit: handleSubmit, className: 'create-form' },
            React.createElement('div', { className: 'form-row' },
                React.createElement('div', { className: 'form-group' },
                    React.createElement('label', { className: 'form-label' },
                        React.createElement('i', { className: 'fas fa-heading' }),
                        ' Titolo evento'
                    ),
                    React.createElement('input', {
                        type: 'text',
                        className: 'form-input',
                        value: formData.title,
                        onChange: (e) => handleChange('title', e.target.value),
                        placeholder: 'Es: Torneo di calcetto',
                        required: true
                    })
                ),
                React.createElement('div', { className: 'form-group' },
                    React.createElement('label', { className: 'form-label' },
                        React.createElement('i', { className: 'fas fa-tag' }),
                        ' Categoria'
                    ),
                    React.createElement('select', {
                        className: 'form-input form-select',
                        value: formData.category,
                        onChange: (e) => handleChange('category', e.target.value),
                        required: true
                    },
                        React.createElement('option', { value: '', disabled: true }, 'Seleziona categoria'),
                        categories.map(cat => 
                            React.createElement('option', { key: cat, value: cat }, cat)
                        )
                    )
                )
            ),
            React.createElement('div', { className: 'form-group full-width' },
                React.createElement('label', { className: 'form-label' },
                    React.createElement('i', { className: 'fas fa-align-left' }),
                    ' Descrizione'
                ),
                React.createElement('textarea', {
                    className: 'form-input form-textarea',
                    value: formData.description,
                    onChange: (e) => handleChange('description', e.target.value),
                    placeholder: 'Descrivi il tuo evento...',
                    required: true,
                    rows: 5
                })
            ),
            React.createElement('div', { className: 'form-row' },
                React.createElement('div', { className: 'form-group' },
                    React.createElement('label', { className: 'form-label' },
                        React.createElement('i', { className: 'fas fa-map-marker-alt' }),
                        ' Luogo'
                    ),
                    React.createElement('input', {
                        type: 'text',
                        className: 'form-input',
                        value: formData.location,
                        onChange: (e) => handleChange('location', e.target.value),
                        placeholder: 'Es: Milano, Piazza Duomo',
                        required: true
                    })
                ),
                React.createElement('div', { className: 'form-group' },
                    React.createElement('label', { className: 'form-label' },
                        React.createElement('i', { className: 'fas fa-calendar' }),
                        ' Data e ora'
                    ),
                    React.createElement('input', {
                        type: 'datetime-local',
                        className: 'form-input',
                        value: formData.event_date,
                        onChange: (e) => handleChange('event_date', e.target.value),
                        required: true
                    })
                )
            ),
            error && React.createElement('div', { className: 'error-message' },
                React.createElement('i', { className: 'fas fa-exclamation-triangle' }),
                ' ',
                error
            ),
            success && React.createElement('div', { className: 'success-message' },
                React.createElement('i', { className: 'fas fa-check-circle' }),
                ' Evento creato con successo!'
            ),
            React.createElement('button', {
                type: 'submit',
                className: 'btn-primary',
                disabled: loading
            },
                loading ? [
                    React.createElement('i', { className: 'fas fa-spinner fa-spin', key: 'icon' }),
                    ' Creazione in corso...'
                ] : [
                    React.createElement('i', { className: 'fas fa-plus-circle', key: 'icon' }),
                    ' Crea Evento'
                ]
            )
        )
    );
}

// ProfilePage Component
function ProfilePage({ supabase, user, theme, onToggleTheme }) {
    const [profile, setProfile] = React.useState(null);
    const [myEvents, setMyEvents] = React.useState([]);
    const [stats, setStats] = React.useState({ created: 0, joined: 0 });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadProfile();
        loadMyEvents();
        loadStats();
    }, []);

    const loadProfile = async () => {
        try {
            const { data } = await supabase
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
            const { data } = await supabase
                .from('events')
                .select('*')
                .eq('creator_id', user.id)
                .order('event_date', { ascending: false });
            
            setMyEvents(data || []);
        } catch (err) {
            console.error('Errore caricamento eventi:', err);
        }
    };

    const loadStats = async () => {
        try {
            const { data: created } = await supabase
                .from('events')
                .select('id')
                .eq('creator_id', user.id);
            
            const { data: joined } = await supabase
                .from('event_participants')
                .select('event_id')
                .eq('user_id', user.id);
            
            setStats({
                created: created?.length || 0,
                joined: joined?.length || 0
            });
        } catch (err) {
            console.error('Errore caricamento statistiche:', err);
        }
    };

    if (loading) {
        return React.createElement('div', { className: 'loading' },
            React.createElement('div', { className: 'spinner' }),
            React.createElement('div', { className: 'loading-text' }, 'Caricamento profilo...')
        );
    }

    return React.createElement('div', { className: 'profile-wrapper' },
        React.createElement('div', { className: 'profile-header' },
            React.createElement('div', { className: 'profile-avatar' },
                (profile?.username || user.email)[0].toUpperCase()
            ),
            React.createElement('h2', { className: 'profile-name' }, profile?.username || 'Utente'),
            React.createElement('p', { className: 'profile-email' }, user.email),
            React.createElement('div', { className: 'profile-stats' },
                React.createElement('div', { className: 'stat-item' },
                    React.createElement('div', { className: 'stat-number' }, stats.created),
                    React.createElement('div', { className: 'stat-label' }, 'Eventi Creati')
                ),
                React.createElement('div', { className: 'stat-item' },
                    React.createElement('div', { className: 'stat-number' }, stats.joined),
                    React.createElement('div', { className: 'stat-label' }, 'Partecipazioni')
                )
            )
        ),
        myEvents.length > 0 && React.createElement('div', { className: 'profile-section' },
            React.createElement('h3', { className: 'section-title-small' },
                React.createElement('i', { className: 'fas fa-calendar-check' }),
                ` I miei eventi (${myEvents.length})`
            ),
            React.createElement('div', { className: 'my-events-list' },
                myEvents.slice(0, 5).map(event =>
                    React.createElement('div', { key: event.id, className: 'my-event-item' },
                        React.createElement('div', { className: 'event-info' },
                            React.createElement('div', { className: 'event-title' }, event.title),
                            React.createElement('div', { className: 'event-details' },
                                React.createElement('span', { className: 'event-date' },
                                    React.createElement('i', { className: 'fas fa-calendar' }),
                                    ' ',
                                    new Date(event.event_date).toLocaleDateString('it-IT')
                                ),
                                React.createElement('span', { className: 'event-location' },
                                    React.createElement('i', { className: 'fas fa-map-marker-alt' }),
                                    ' ',
                                    event.location
                                )
                            )
                        )
                    )
                )
            )
        )
    );
}
