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
