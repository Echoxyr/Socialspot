// 🔹 COMPONENTE AUTH CORRETTO CON TUTTI I CAMPI E VERIFICA EMAIL
const { useState, useEffect, memo, useCallback } = React;

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
    const [successMessage, setSuccessMessage] = useState(null);
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
        setSuccessMessage(null);
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
            // Validazione registrazione
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
            
            // Verifica età minima (13 anni)
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
        
        // Validazione email
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
        setSuccessMessage(null);
        
        try {
            let result;
            
            if (isSignIn) {
                // LOGIN
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
                // REGISTRAZIONE
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
                    // Mostra messaggio di conferma email
                    setSuccessMessage('Registrazione completata! Controlla la tua email per verificare il tuo account.');
                    
                    window.addNotification?.({
                        type: 'success',
                        icon: 'fas fa-envelope-open-text',
                        title: 'Registrazione completata!',
                        message: 'Ti abbiamo inviato un\'email di conferma. Controlla la tua casella di posta.'
                    });
                    
                    // Reset form
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
                    
                    // Switch a login dopo 3 secondi
                    setTimeout(() => {
                        setIsSignIn(true);
                        setSuccessMessage(null);
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

    const availableInterests = [
        'Sport', 'Musica', 'Cinema', 'Tecnologia', 'Cucina', 
        'Viaggi', 'Arte', 'Lettura', 'Gaming', 'Fitness',
        'Fotografia', 'Moda', 'Natura', 'Business', 'Benessere'
    ];

    const genderOptions = [
        { value: 'male', label: 'Uomo' },
        { value: 'female', label: 'Donna' },
        { value: 'other', label: 'Altro' },
        { value: 'prefer_not_to_say', label: 'Preferisco non dirlo' }
    ];

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
                            setSuccessMessage(null);
                        }
                    }, 'Accedi'),
                    React.createElement('button', {
                        className: `auth-tab ${!isSignIn ? 'active' : ''}`,
                        onClick: () => {
                            setIsSignIn(false);
                            setError(null);
                            setSuccessMessage(null);
                        }
                    }, 'Registrati')
                ),

                React.createElement('form', { 
                    onSubmit: handleAuth, 
                    className: 'auth-form' 
                },
                    // CAMPI REGISTRAZIONE
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

                    // EMAIL (sempre visibile)
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
                            genderOptions.map(opt =>
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

                    // PASSWORD
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
                            availableInterests.map(interest =>
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

                    successMessage && React.createElement('div', { className: 'success-message' },
                        React.createElement('i', { className: 'fas fa-check-circle' }),
                        ' ',
                        successMessage
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
