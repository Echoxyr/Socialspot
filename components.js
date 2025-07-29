/*
 * components.js - SocialNet Neural Enhanced Components
 * Componenti AI-powered con funzionalità neurali avanzate
 */

const { useState, useEffect, useCallback, useMemo, memo } = React;

// 🧠 NEURAL AI UTILITIES
const NeuralUtils = {
    // Generate badge narratives
    generateBadgeNarrative: (userActivity) => {
        const narratives = [
            'Esploratore Urbano',
            'Connettore Sociale',
            'Innovatore Eventi',
            'Catalyst Neurale',
            'Architetto Esperienze',
            'Pioneer Community'
        ];
        return narratives[Math.floor(Math.random() * narratives.length)];
    },

    // Calculate AI reputation score
    calculateNeuralScore: (events, participations, interactions) => {
        const baseScore = events * 10 + participations * 5 + interactions * 2;
        const networkEffect = Math.log(baseScore + 1) * 15;
        return Math.min(Math.floor(baseScore + networkEffect), 999);
    },

    // Generate event suggestions based on user data
    suggestEventLocation: (userLocation, preferences) => {
        const locations = [
            'Parco Sempione, Milano',
            'Navigli, Milano', 
            'Brera, Milano',
            'Porta Nuova, Milano',
            'Isola, Milano'
        ];
        return locations[Math.floor(Math.random() * locations.length)];
    }
};

// 🔹 ENHANCED AUTH COMPONENT WITH AI
const NeuralAuth = memo(({ supabase, setUser }) => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        interests: []
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);

    const availableInterests = [
        'Sport', 'Musica', 'Arte', 'Cultura', 'Tecnologia', 
        'Cibo', 'Viaggi', 'Cinema', 'All\'aperto', 'Business',
        'Gaming', 'Fotografia', 'Lettura', 'Yoga', 'Danza'
    ];

    // AI suggests interests based on email domain
    useEffect(() => {
        if (formData.email && !isSignIn) {
            const domain = formData.email.split('@')[1];
            let suggestions = [];
            
            if (domain?.includes('gmail')) suggestions = ['Tecnologia', 'Cinema'];
            else if (domain?.includes('outlook')) suggestions = ['Business', 'Cultura'];
            else if (domain?.includes('university') || domain?.includes('edu')) suggestions = ['Arte', 'Cultura'];
            else suggestions = ['Sport', 'Musica'];
            
            setAiSuggestions(suggestions);
        }
    }, [formData.email, isSignIn]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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

    const handleSubmit = async (e) => {
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
                result = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            username: formData.username,
                            interests: formData.interests
                        }
                    }
                });

                // Create profile with AI-generated bio
                if (result.data.user) {
                    const aiBio = `Un appassionato di ${formData.interests[0] || 'eventi'} che ama scoprire nuove avventure sociali. Connettore nato con spirito esplorativo.`;
                    
                    await supabase.from('profiles').insert({
                        id: result.data.user.id,
                        username: formData.username,
                        bio: aiBio,
                        interests: formData.interests,
                        location: 'Milano, IT'
                    });
                }
            }

            if (result.error) throw result.error;
            setUser(result.data.user);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="neural-auth">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="neural-logo-auth">
                        <span className="logo-text">SN.n</span>
                        <div className="neural-pulse"></div>
                    </div>
                    <h1>SocialNet Neural</h1>
                    <p>L'evoluzione del networking sociale</p>
                </div>

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

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="error-message">
                            <i className="fas fa-exclamation-triangle"></i>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>

                    {!isSignIn && (
                        <>
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="interests-section">
                                <h4>I tuoi interessi</h4>
                                {aiSuggestions.length > 0 && (
                                    <div className="ai-suggestions">
                                        <span className="ai-label">
                                            <i className="fas fa-brain"></i>
                                            AI Suggerisce:
                                        </span>
                                        {aiSuggestions.map(interest => (
                                            <button
                                                key={interest}
                                                type="button"
                                                className="suggestion-btn"
                                                onClick={() => handleInterestToggle(interest)}
                                            >
                                                {interest}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="interests-grid">
                                    {availableInterests.map(interest => (
                                        <button
                                            key={interest}
                                            type="button"
                                            className={`interest-btn ${
                                                formData.interests.includes(interest) ? 'selected' : ''
                                            }`}
                                            onClick={() => handleInterestToggle(interest)}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <button 
                        type="submit" 
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Elaborazione AI...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-brain"></i>
                                {isSignIn ? 'Accedi al Neural' : 'Entra nel Futuro'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
});

// 🔹 ENHANCED EVENT CARD WITH AI FEATURES
const NeuralEventCard = memo(({ event, user, supabase, onJoin, onChat }) => {
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [isJoined, setIsJoined] = useState(false);
    const [loading, setLoading] = useState(false);

    // AI analyzes event compatibility
    useEffect(() => {
        const analyzeEventCompatibility = async () => {
            if (!user || !event) return;

            // Simulate AI analysis
            const compatibility = Math.floor(Math.random() * 40) + 60; // 60-100%
            const reasons = [
                'Interessi allineati',
                'Fascia d\'età compatibile',
                'Location conveniente',
                'Orario ottimale'
            ];

            setAiAnalysis({
                compatibility,
                reasons: reasons.slice(0, Math.floor(Math.random() * 3) + 1),
                recommendation: compatibility > 80 ? 'Altamente consigliato' : 'Buona compatibilità'
            });
        };

        analyzeEventCompatibility();
    }, [event, user]);

    const handleJoin = async () => {
        setLoading(true);
        try {
            await onJoin?.(event.id);
            setIsJoined(true);
        } catch (error) {
            console.error('Join error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="neural-event-card">
            <div className="event-header">
                <div className="event-category-badge">
                    {event.category}
                </div>
                {aiAnalysis && (
                    <div className="ai-compatibility">
                        <i className="fas fa-brain"></i>
                        {aiAnalysis.compatibility}% match
                    </div>
                )}
            </div>

            <div className="event-content">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>
                
                <div className="event-details">
                    <div className="detail-item">
                        <i className="fas fa-calendar"></i>
                        {new Date(event.event_date).toLocaleDateString('it-IT')}
                    </div>
                    <div className="detail-item">
                        <i className="fas fa-map-marker-alt"></i>
                        {event.location}
                    </div>
                    <div className="detail-item">
                        <i className="fas fa-users"></i>
                        {event.participants_count || 0} partecipanti
                    </div>
                </div>

                {/* AI Required Fields Display */}
                <div className="event-preferences">
                    {event.gender_preference && (
                        <span className="preference-tag">
                            <i className="fas fa-venus-mars"></i>
                            {event.gender_preference}
                        </span>
                    )}
                    {event.age_range && (
                        <span className="preference-tag">
                            <i className="fas fa-birthday-cake"></i>
                            {event.age_range}
                        </span>
                    )}
                </div>

                {aiAnalysis && (
                    <div className="ai-analysis">
                        <h5>Analisi AI</h5>
                        <div className="analysis-reasons">
                            {aiAnalysis.reasons.map((reason, index) => (
                                <span key={index} className="reason-tag">
                                    <i className="fas fa-check"></i>
                                    {reason}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="event-actions">
                <button 
                    className={`action-btn ${isJoined ? 'joined' : 'primary'}`}
                    onClick={handleJoin}
                    disabled={loading || isJoined}
                >
                    {loading ? (
                        <i className="fas fa-spinner fa-spin"></i>
                    ) : isJoined ? (
                        <>
                            <i className="fas fa-check"></i>
                            Partecipo
                        </>
                    ) : (
                        <>
                            <i className="fas fa-plus"></i>
                            Unisciti
                        </>
                    )}
                </button>
                
                <button 
                    className="action-btn secondary"
                    onClick={() => onChat?.(event.id)}
                >
                    <i className="fas fa-comments"></i>
                    Chat
                </button>
            </div>
        </div>
    );
});

// 🔹 AI-POWERED CREATE EVENT COMPONENT
const NeuralCreateEvent = memo(({ supabase, user, onEventCreated, aiHelper }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        event_date: '',
        location: '',
        gender_preference: 'entrambi', // Required field
        age_range: '18-35', // Required field
        max_participants: 20
    });
    const [aiSuggestions, setAiSuggestions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAiHelper, setShowAiHelper] = useState(false);

    const categories = [
        'Sport', 'Musica', 'Arte', 'Cultura', 'Tecnologia',
        'Cibo', 'Viaggi', 'Cinema', 'All\'aperto', 'Business'
    ];

    const genderOptions = [
        { value: 'uomo', label: 'Solo Uomini' },
        { value: 'donna', label: 'Solo Donne' },
        { value: 'entrambi', label: 'Tutti' }
    ];

    const ageRanges = [
        '18-25', '26-35', '36-45', '46-55', '55+'
    ];

    // AI generates event suggestions
    const generateAISuggestions = async () => {
        setLoading(true);
        try {
            const suggestion = await aiHelper.generateEventSuggestion({
                category: formData.category,
                ageRange: formData.age_range,
                genderPreference: formData.gender_preference
            });

            const imagePrompt = aiHelper.generateImagePrompt(suggestion);
            
            setAiSuggestions({
                ...suggestion,
                imagePrompt,
                location: NeuralUtils.suggestEventLocation('Milano', {})
            });
            setShowAiHelper(true);
        } catch (error) {
            console.error('AI suggestion error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Apply AI suggestions to form
    const applyAISuggestions = () => {
        if (aiSuggestions) {
            setFormData(prev => ({
                ...prev,
                title: aiSuggestions.title,
                description: aiSuggestions.description,
                location: aiSuggestions.location,
                category: aiSuggestions.category
            }));
            setShowAiHelper(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const eventData = {
                ...formData,
                creator_id: user.id,
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('events')
                .insert([eventData])
                .select()
                .single();

            if (error) throw error;

            // Generate WhatsApp message
            const whatsappMessage = await aiHelper.generateWhatsAppInvite(data);
            
            // Copy to clipboard
            navigator.clipboard.writeText(whatsappMessage);
            
            // Show success notification
            window.addNotification?.({
                type: 'success',
                title: 'Evento creato!',
                message: 'Messaggio WhatsApp copiato negli appunti'
            });

            onEventCreated?.();
        } catch (error) {
            console.error('Create event error:', error);
            window.addNotification?.({
                type: 'error',
                title: 'Errore',
                message: 'Impossibile creare l\'evento'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="neural-create-event">
            <div className="create-header">
                <h2>
                    <i className="fas fa-brain"></i>
                    Crea Evento Neural
                </h2>
                <button 
                    className="ai-helper-btn"
                    onClick={generateAISuggestions}
                    disabled={loading}
                >
                    <i className="fas fa-magic"></i>
                    AI Assistant
                </button>
            </div>

            {showAiHelper && aiSuggestions && (
                <div className="ai-helper-panel">
                    <div className="ai-suggestion">
                        <h4>Suggerimento AI</h4>
                        <div className="suggestion-content">
                            <h5>{aiSuggestions.title}</h5>
                            <p>{aiSuggestions.description}</p>
                            <div className="suggestion-details">
                                <span>📍 {aiSuggestions.location}</span>
                                <span>🎯 {aiSuggestions.category}</span>
                            </div>
                            {aiSuggestions.imagePrompt && (
                                <div className="dalle-prompt">
                                    <strong>DALL-E Prompt:</strong>
                                    <code>{aiSuggestions.imagePrompt}</code>
                                </div>
                            )}
                        </div>
                        <div className="suggestion-actions">
                            <button 
                                className="apply-btn"
                                onClick={applyAISuggestions}
                            >
                                Applica Suggerimenti
                            </button>
                            <button 
                                className="close-btn"
                                onClick={() => setShowAiHelper(false)}
                            >
                                Chiudi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="event-form">
                <div className="form-group">
                    <label>Titolo Evento</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                        required
                        className="form-input"
                        placeholder="Dai un nome al tuo evento..."
                    />
                </div>

                <div className="form-group">
                    <label>Descrizione</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                        required
                        className="form-textarea"
                        placeholder="Descrivi cosa farete..."
                        rows="4"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Categoria</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                            required
                            className="form-select"
                        >
                            <option value="">Seleziona categoria</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Data e Ora</label>
                        <input
                            type="datetime-local"
                            value={formData.event_date}
                            onChange={(e) => setFormData(prev => ({...prev, event_date: e.target.value}))}
                            required
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Location</label>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                        required
                        className="form-input"
                        placeholder="Dove si svolgerà l'evento?"
                    />
                </div>

                {/* Required Neural Fields */}
                <div className="neural-preferences">
                    <h4>Preferenze Neural (Obbligatorie)</h4>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <i className="fas fa-venus-mars"></i>
                                Genere Preferito
                            </label>
                            <select
                                value={formData.gender_preference}
                                onChange={(e) => setFormData(prev => ({...prev, gender_preference: e.target.value}))}
                                required
                                className="form-select"
                            >
                                {genderOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>
                                <i className="fas fa-birthday-cake"></i>
                                Fascia d'Età
                            </label>
                            <select
                                value={formData.age_range}
                                onChange={(e) => setFormData(prev => ({...prev, age_range: e.target.value}))}
                                required
                                className="form-select"
                            >
                                {ageRanges.map(range => (
                                    <option key={range} value={range}>
                                        {range} anni
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Numero Massimo Partecipanti</label>
                    <input
                        type="number"
                        value={formData.max_participants}
                        onChange={(e) => setFormData(prev => ({...prev, max_participants: parseInt(e.target.value)}))}
                        min="2"
                        max="100"
                        className="form-input"
                    />
                </div>

                <button 
                    type="submit" 
                    className="create-event-btn"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Creazione Neural...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-rocket"></i>
                            Crea Evento Neural
                        </>
                    )}
                </button>
            </form>
        </div>
    );
});

// 🔹 AI PROFILE COMPONENT
const NeuralProfile = memo(({ supabase, user, aiProfile, onProfileUpdate }) => {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({});
    const [badges, setBadges] = useState([]);
    const [neuralScore, setNeuralScore] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, [user]);

    const loadProfile = async () => {
        try {
            // Load profile data
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            // Load user stats
            const { data: eventsData } = await supabase
                .from('events')
                .select('id')
                .eq('creator_id', user.id);

            const { data: participationsData } = await supabase
                .from('event_participants')
                .select('id')
                .eq('user_id', user.id);

            // Load badges
            const { data: badgesData } = await supabase
                .from('user_badges')
                .select('*, badges(*)')
                .eq('user_id', user.id);

            const userStats = {
                events: eventsData?.length || 0,
                participations: participationsData?.length || 0,
                badges: badgesData?.length || 0
            };

            // Calculate neural score
            const neural = NeuralUtils.calculateNeuralScore(
                userStats.events, 
                userStats.participations, 
                userStats.badges * 5
            );

            setProfile(profileData);
            setStats(userStats);
            setBadges(badgesData || []);
            setNeuralScore(neural);
        } catch (error) {
            console.error('Profile load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const regenerateAIBio = async () => {
        try {
            const newBio = await NeuralAI.generateBio(profile);
            
            await supabase
                .from('profiles')
                .update({ bio: newBio })
                .eq('id', user.id);

            setProfile(prev => ({ ...prev, bio: newBio }));
            
            window.addNotification?.({
                type: 'success',
                title: 'Bio rigenerata!',
                message: 'La tua bio è stata aggiornata dall\'AI'
            });
        } catch (error) {
            console.error('Bio regeneration error:', error);
        }
    };

    if (loading) {
        return (
            <div className="neural-profile loading">
                <div className="loading-spinner">
                    <i className="fas fa-brain fa-spin"></i>
                    <p>Caricamento profilo neural...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="neural-profile">
            <div className="profile-header">
                <div className="avatar-section">
                    <div className="neural-avatar">
                        <span>{profile?.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}</span>
                        <div className="neural-pulse"></div>
                    </div>
                    <div className="neural-score">
                        <div className="score-value">{neuralScore}</div>
                        <div className="score-label">Neural Score</div>
                    </div>
                </div>

                <div className="profile-info">
                    <h2>{profile?.username || 'Neural User'}</h2>
                    <p className="profile-email">{user.email}</p>
                    
                    <div className="ai-bio-section">
                        <div className="bio-header">
                            <h4>Bio Neural</h4>
                            <button 
                                className="regenerate-bio-btn"
                                onClick={regenerateAIBio}
                                title="Rigenera Bio con AI"
                            >
                                <i className="fas fa-sync"></i>
                            </button>
                        </div>
                        <p className="ai-bio">
                            {profile?.bio || 'Bio generata dall\'AI in caricamento...'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="neural-stats">
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-calendar-plus"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.events}</div>
                        <div className="stat-label">Eventi Creati</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-users"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.participations}</div>
                        <div className="stat-label">Partecipazioni</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-medal"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.badges}</div>
                        <div className="stat-label">Badge Neurali</div>
                    </div>
                </div>
            </div>

            {/* Dynamic Badge Narrative */}
            <div className="badge-narrative">
                <h4>Badge Narrativo Dinamico</h4>
                <div className="narrative-badge">
                    <i className="fas fa-star"></i>
                    {NeuralUtils.generateBadgeNarrative({
                        events: stats.events,
                        participations: stats.participations
                    })}
                </div>
            </div>

            {/* Badges Collection */}
            {badges.length > 0 && (
                <div className="badges-section">
                    <h4>Achievement Neurali</h4>
                    <div className="badges-grid">
                        {badges.map(userBadge => (
                            <div key={userBadge.id} className="badge-item">
                                <i className={`fas ${userBadge.badges.icon}`}></i>
                                <div className="badge-info">
                                    <div className="badge-name">{userBadge.badges.name}</div>
                                    <div className="badge-desc">{userBadge.badges.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Profile Actions */}
            <div className="profile-actions">
                <button className="action-btn primary">
                    <i className="fas fa-edit"></i>
                    Modifica Profilo
                </button>
                <button className="action-btn secondary">
                    <i className="fas fa-cog"></i>
                    Impostazioni
                </button>
            </div>
        </div>
    );
});

// Export all neural components
window.SocialSpotComponents = {
    Auth: NeuralAuth,
    EventCard: NeuralEventCard,
    CreateEvent: NeuralCreateEvent,
    ProfilePage: NeuralProfile,
    
    // Utility exports
    NeuralUtils,
    formatEventDate: (date) => {
        const eventDate = new Date(date);
        const now = new Date();
        const diffTime = eventDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Evento passato';
        if (diffDays === 0) return 'Oggi';
        if (diffDays === 1) return 'Domani';
        if (diffDays < 7) return `Tra ${diffDays} giorni`;
        
        return eventDate.toLocaleDateString('it-IT');
    }
};

console.log('🧠 SocialNet Neural Components loaded successfully!');
