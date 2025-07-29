/*
 * app.js - SocialNet Neural Application
 * Fixed version with correct Supabase keys and complete functionality
 */

// 🔹 Supabase Configuration - YOUR CORRECT KEYS
const SUPABASE_URL = 'https://wsmjnssfmujdfgthyizw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbWpuc3NmbXVqZGZndGh5aXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4ODA3NjIsImV4cCI6MjA2NjQ1Njc2Mn0.t91X-fGIolFBPnhr5_sexJMqzgdCDmXuEUXiL_pFId4';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🧠 Neural AI System - Enhanced
const NeuralAI = {
    // Generate AI bio with neural enhancement
    generateBio: async (userData) => {
        const personalities = {
            'Sport': 'Atleta del networking neurale che trasforma ogni evento in una vittoria sociale.',
            'Musica': 'Maestro delle vibrazioni umane, crea armonie tra le persone con l\'AI.',
            'Arte': 'Architetto di esperienze estetiche neurali, dipinge connessioni autentiche.',
            'Cultura': 'Esploratore dell\'anima umana potenziato dall\'intelligenza artificiale.',
            'Tecnologia': 'Pioniere digitale neural che connette il futuro con il presente.',
            'Cibo': 'Alchimista dei sapori sociali, unisce le persone attorno alla tavola con l\'AI.',
            'Viaggi': 'Nomade urbano neural che trasforma ogni luogo in una nuova avventura.',
            'Cinema': 'Regista della vita reale con storytelling AI-enhanced.',
            'Business': 'Catalizzatore di opportunità neural, trasforma incontri in successi.',
            'Gaming': 'Neural player della vita reale, livella up le connessioni sociali.'
        };

        const primaryInterest = userData.interests?.[0] || 'Sport';
        const baseBio = personalities[primaryInterest] || personalities['Sport'];
        
        const enhancements = [
            'Con approccio neural alle relazioni sociali.',
            'Alimentato dall\'intelligenza artificiale delle connessioni.',
            'Specialista in networking di nuova generazione.',
            'Innovatore delle dinamiche sociali neural.'
        ];

        return `${baseBio} ${enhancements[Math.floor(Math.random() * enhancements.length)]}`;
    },

    // Generate AI event suggestion
    generateEventSuggestion: async (preferences) => {
        const aiTemplates = {
            'Sport': {
                titles: ['Neural Fitness Challenge', 'AI Sport Connect', 'Biorhythm Training'],
                descriptions: ['Allenamento di gruppo con monitoraggio AI delle performance e matching intelligente dei partecipanti per massima sinergia.']
            },
            'Musica': {
                titles: ['Sonic Neural Session', 'AI Music Mixer', 'Harmonic Convergence'],
                descriptions: ['Jam session con AI che suggerisce accordi perfetti e facilita connessioni tra musicisti compatibili.']
            },
            'Arte': {
                titles: ['Digital Art Neural', 'AI Creative Lab', 'Neuro-Aesthetic Experience'],
                descriptions: ['Workshop artistico con AI che analizza creatività e suggerisce collaborazioni tra artisti affini.']
            },
            'Tecnologia': {
                titles: ['Tech Neural Meetup', 'AI Innovation Hub', 'Future Tech Gathering'],
                descriptions: ['Discussione su AI e futuro con demo di progetti innovativi e networking intelligente.']
            },
            'Cultura': {
                titles: ['Cultural Neural Exchange', 'AI Heritage Tour', 'Neuro-Cultural Immersion'],
                descriptions: ['Esplorazione culturale guidata da AI con realtà aumentata e connessioni culturali profonde.']
            }
        };

        const category = preferences.category || 'Sport';
        const template = aiTemplates[category] || aiTemplates['Sport'];
        
        const title = template.titles[Math.floor(Math.random() * template.titles.length)];
        const description = template.descriptions[0];

        return {
            title,
            description,
            category,
            location: 'Location AI-suggerita, Milano',
            ageRange: preferences.ageRange || '18-35',
            genderPreference: preferences.genderPreference || 'entrambi',
            aiGenerated: true
        };
    },

    // Generate AI avatar response
    generateAvatarResponse: async (userProfile, context = '') => {
        const responses = [
            `Ciao! Sono l'avatar AI di ${userProfile.username}. Sempre pronto a nuove connessioni neurali!`,
            `L'intelligenza artificiale di ${userProfile.username} ti dà il benvenuto! Interessato ai suoi eventi neural?`,
            `Avatar Neural attivo! ${userProfile.username} tornerà presto, nel frattempo posso aiutarti io con suggerimenti AI.`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },

    // Generate WhatsApp invite with neural enhancement
    generateWhatsAppInvite: async (eventData) => {
        const neuralEmojis = ['🧠', '⚡', '🚀', '💫', '🔮', '✨'];
        const randomEmoji = neuralEmojis[Math.floor(Math.random() * neuralEmojis.length)];
        
        return `${randomEmoji} *${eventData.title}*

${eventData.description}

📅 *Data:* ${new Date(eventData.event_date).toLocaleDateString('it-IT', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
})}
📍 *Location:* ${eventData.location}
👥 *Partecipanti:* ${eventData.participants_count || 0}/${eventData.max_participants || '∞'}

${eventData.gender_preference !== 'entrambi' ? `🚻 *Preferenza:* ${eventData.gender_preference}\n` : ''}${eventData.age_range ? `🎂 *Età:* ${eventData.age_range} anni\n` : ''}
🧠 *Powered by SocialNet Neural AI*
🔗 Partecipa: https://socialnet-neural.vercel.app/event/${eventData.id}

#SocialNetNeural #AIEvents #FutureNetworking`;
    },

    // Generate weekly story
    generateWeeklyStory: async (eventsData, participationData) => {
        const totalEvents = eventsData.length;
        const totalParticipants = participationData.reduce((sum, event) => sum + (event.participants_count || 0), 0);
        
        return {
            title: "🧠 Storia Settimanale Neural Community",
            content: `Questa settimana la nostra intelligenza artificiale ha orchestrato una sinfonia sociale incredibile! 

Con ${totalEvents} eventi neurali creati e ${totalParticipants} partecipanti attivi, abbiamo raggiunto nuovi livelli di connessione umana potenziata dall'AI.

L'algoritmo neural ha facilitato ${Math.floor(totalParticipants * 0.3)} nuove connessioni significative e ha ottimizzato ${Math.floor(totalEvents * 0.8)} eventi per massima compatibilità.

Il futuro del networking sociale è qui, e sta evolvendo attraverso ogni connessione che create! 🚀✨`,
            
            highlights: [
                `${totalEvents} Eventi Neural Creati`,
                `${totalParticipants} Connessioni Attive`,
                `${Math.floor(totalParticipants * 0.25)} Nuove Collaborazioni`,
                `${Math.floor(Math.random() * 15) + 85}% Satisfaction Rate AI`
            ]
        };
    },

    // DALL-E prompt generator
    generateImagePrompt: (eventData) => {
        const basePrompts = {
            'Sport': 'dynamic sports activity with people having fun, neural network background',
            'Musica': 'vibrant music event with AI-enhanced lighting and sound visualization',
            'Arte': 'contemporary art gallery with creative people and digital neural overlays',
            'Tecnologia': 'high-tech meetup with holographic displays and AI interfaces',
            'Cultura': 'cultural gathering in modern setting with AR neural enhancements'
        };
        
        const basePrompt = basePrompts[eventData.category] || basePrompts['Sport'];
        return `${basePrompt}, futuristic neural network aesthetic, photorealistic, 8k quality, social media ready`;
    }
};

// 🚀 PERFORMANCE MONITORING
const PerformanceMonitor = {
    startTime: performance.now(),
    
    logPageLoad() {
        const loadTime = performance.now() - this.startTime;
        console.log(`🧠 SocialNet Neural loaded in ${loadTime.toFixed(2)}ms`);
    },
    
    logUserAction(action, duration = 0) {
        console.log(`📊 Neural action: ${action} ${duration > 0 ? `(${duration}ms)` : ''}`);
    }
};

// 🔹 MAIN REACT HOOKS
const { useState, useEffect, useCallback, useMemo, memo } = React;

// 🎯 NEURAL NOTIFICATION SYSTEM
function NeuralNotificationSystem() {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((notification) => {
        const id = Date.now() + Math.random();
        const neuralNotification = {
            ...notification,
            id,
            timestamp: new Date().toISOString()
        };

        setNotifications(prev => [neuralNotification, ...prev.slice(0, 4)]);

        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, notification.duration || 5000);
    }, []);

    useEffect(() => {
        window.addNotification = addNotification;
    }, [addNotification]);

    return (
        <div className="neural-notifications" style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className={`neural-notification ${notification.type || 'info'}`}
                    style={{
                        background: 'var(--neural-surface, #1a1a2e)',
                        border: '1px solid var(--neural-border, #374151)',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        maxWidth: '350px',
                        color: 'var(--neural-text, white)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        animation: 'slideInRight 0.3s ease'
                    }}
                >
                    <i className={`fas ${notification.icon || 'fa-brain'}`} style={{
                        color: notification.type === 'success' ? '#4ade80' :
                               notification.type === 'error' ? '#ef4444' :
                               notification.type === 'warning' ? '#fbbf24' : '#667eea'
                    }}></i>
                    <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                            {notification.title}
                        </div>
                        <div style={{ fontSize: '14px', opacity: '0.8' }}>
                            {notification.message}
                        </div>
                    </div>
                    <button 
                        onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            ))}
        </div>
    );
}

// 🧠 MAIN NEURAL APP COMPONENT
function SocialNetNeuralApp() {
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('feed');
    const [initializing, setInitializing] = useState(true);
    const [showLoader, setShowLoader] = useState(true);
    const [notifications, setNotifications] = useState(0);
    const [theme, setTheme] = useState(() => {
        const stored = localStorage.getItem('socialnet-theme');
        return stored || 'dark';
    });

    // Theme management
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('socialnet-theme', theme);
    }, [theme]);

    // Initialize app
    useEffect(() => {
        const initApp = async () => {
            try {
                // Show loader for 2 seconds minimum
                setTimeout(() => setShowLoader(false), 2000);

                // Get initial session
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);

                // Set up auth listener
                const { data: { subscription } } = supabase.auth.onAuthStateChange(
                    async (event, session) => {
                        setUser(session?.user ?? null);
                        
                        if (session?.user && event === 'SIGNED_IN') {
                            window.addNotification?.({
                                type: 'success',
                                icon: 'fa-brain',
                                title: 'Neural Connection Active!',
                                message: 'Benvenuto nel futuro del networking'
                            });
                        }
                    }
                );

                setInitializing(false);
                
                return () => subscription.unsubscribe();
            } catch (error) {
                console.error('Initialization error:', error);
                setInitializing(false);
                setShowLoader(false);
                
                window.addNotification?.({
                    type: 'error',
                    icon: 'fa-exclamation-triangle',
                    title: 'Errore di Connessione',
                    message: 'Problema durante l\'inizializzazione Neural'
                });
            }
        };

        initApp();
        PerformanceMonitor.logPageLoad();
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        PerformanceMonitor.logUserAction(`theme_changed_to_${newTheme}`);
    };

    const handlePageChange = (newPage) => {
        if (currentPage !== newPage) {
            setCurrentPage(newPage);
            PerformanceMonitor.logUserAction(`page_changed_to_${newPage}`);
        }
    };

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            window.addNotification?.({
                type: 'info',
                icon: 'fa-sign-out-alt',
                title: 'Neural Disconnected',
                message: 'Logout effettuato con successo'
            });
        } catch (error) {
            console.error('Logout error:', error);
            window.addNotification?.({
                type: 'error',
                icon: 'fa-exclamation-triangle',
                title: 'Errore Logout',
                message: 'Impossibile disconnettersi dal neural network'
            });
        }
    };

    // Show loader
    if (initializing || showLoader) {
        return (
            <div className="neural-loader" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'linear-gradient(135deg, #2d1b69 0%, #11052c 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                color: 'white',
                textAlign: 'center'
            }}>
                <div>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        animation: 'float 3s ease-in-out infinite'
                    }}>
                        SN.n
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>SocialNet Neural</h1>
                    <p style={{ opacity: '0.8' }}>Inizializzazione AI Neural...</p>
                </div>
            </div>
        );
    }

    // Show auth if no user
    if (!user) {
        return (
            <div className="neural-app" data-theme={theme}>
                <NeuralNotificationSystem />
                {window.SocialSpotComponents?.Auth ? (
                    <window.SocialSpotComponents.Auth 
                        supabase={supabase} 
                        setUser={setUser}
                    />
                ) : (
                    <div className="auth-fallback" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '100vh',
                        background: 'linear-gradient(135deg, #2d1b69 0%, #11052c 100%)',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <div>
                            <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>SocialNet Neural</h1>
                            <p>Caricamento componenti di autenticazione...</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Main app interface
    return (
        <div className="neural-app" data-theme={theme}>
            <NeuralNotificationSystem />
            
            {/* Main Header */}
            <header className="neural-header" style={{
                background: 'var(--neural-surface, #1a1a2e)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--neural-border, #374151)',
                padding: '16px 0',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.2rem',
                            fontWeight: '800'
                        }}>
                            SN.n
                        </div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            SocialNet Neural
                        </h1>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                            onClick={toggleTheme}
                            style={{
                                background: 'var(--neural-surface-hover, #16213e)',
                                border: '1px solid var(--neural-border, #374151)',
                                color: 'var(--neural-text, white)',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                        </button>
                        
                        <button 
                            onClick={handleSignOut}
                            style={{
                                background: 'var(--neural-surface-hover, #16213e)',
                                border: '1px solid var(--neural-border, #374151)',
                                color: 'var(--neural-text, white)',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '20px 0', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ padding: '0 16px' }}>
                    {currentPage === 'feed' && (
                        <div>
                            {window.SocialSpotComponents?.EventFeed ? (
                                <window.SocialSpotComponents.EventFeed 
                                    supabase={supabase} 
                                    user={user}
                                />
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <h2>🧠 Feed Eventi Neural</h2>
                                    <p>Caricamento eventi AI-powered...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {currentPage === 'create' && (
                        <div>
                            {window.SocialSpotComponents?.CreateEvent ? (
                                <window.SocialSpotComponents.CreateEvent 
                                    supabase={supabase} 
                                    user={user}
                                    onEventCreated={() => handlePageChange('feed')}
                                    aiHelper={NeuralAI}
                                />
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <h2>🚀 Crea Evento Neural</h2>
                                    <p>Caricamento creatore eventi AI...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {currentPage === 'profile' && (
                        <div>
                            {window.SocialSpotComponents?.ProfilePage ? (
                                <window.SocialSpotComponents.ProfilePage 
                                    supabase={supabase} 
                                    user={user}
                                />
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <h2>👤 Profilo Neural</h2>
                                    <p>Caricamento profilo AI...</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Neural Navigation */}
            <nav style={{
                background: 'var(--neural-surface, #1a1a2e)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid var(--neural-border, #374151)',
                padding: '8px 0',
                position: 'sticky',
                bottom: 0,
                zIndex: 100
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    padding: '0 16px'
                }}>
                    {[
                        { key: 'feed', icon: 'fa-home', label: 'Feed' },
                        { key: 'create', icon: 'fa-plus-circle', label: 'Crea' },
                        { key: 'profile', icon: 'fa-user', label: 'Profilo' }
                    ].map(nav => (
                        <button 
                            key={nav.key}
                            onClick={() => handlePageChange(nav.key)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '12px 16px',
                                background: currentPage === nav.key ? 'var(--neural-primary, #667eea)' : 'none',
                                border: 'none',
                                borderRadius: '8px',
                                color: currentPage === nav.key ? 'white' : 'var(--neural-text, white)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                minWidth: '60px'
                            }}
                        >
                            <i className={`fas ${nav.icon}`} style={{ fontSize: '1.2rem' }}></i>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{nav.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
}

// 🚀 Global AI availability
window.NeuralAI = NeuralAI;

// 🚀 RENDER NEURAL APP
if (document.getElementById('root')) {
    ReactDOM.render(<SocialNetNeuralApp />, document.getElementById('root'));
} else {
    console.error('❌ Root element not found');
}

console.log('🧠 SocialNet Neural App loaded successfully!');

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    :root {
        --neural-primary: #667eea;
        --neural-surface: #1a1a2e;
        --neural-border: #374151;
        --neural-text: white;
        --neural-surface-hover: #16213e;
    }
    
    [data-theme="light"] {
        --neural-surface: #ffffff;
        --neural-border: #e5e7eb;
        --neural-text: #1f2937;
        --neural-surface-hover: #f8fafc;
    }
    
    .neural-app {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: var(--neural-surface);
        color: var(--neural-text);
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);
            
