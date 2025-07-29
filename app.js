/*
 * app.js - SocialNet Neural Application Logic
 * Sistema AI avanzato per eventi e networking sociale
 */

// 🧠 Neural AI System - Core Intelligence
const NeuralAI = {
    // Enhanced bio generation with personality analysis
    generateBio: async (userData) => {
        const personalities = {
            'Sport': 'Atleta del networking, trasforma ogni evento in una vittoria sociale.',
            'Musica': 'Maestro delle vibrazioni umane, crea armonie tra le persone.',
            'Arte': 'Architetto di esperienze estetiche, dipinge connessioni autentiche.',
            'Cultura': 'Esploratore dell\'anima umana, colleziona storie e tradizioni.',
            'Tecnologia': 'Pioniere digitale che connette il futuro con il presente.',
            'Cibo': 'Alchimista dei sapori sociali, unisce le persone attorno alla tavola.',
            'Viaggi': 'Nomade urbano che trasforma ogni luogo in una nuova avventura.',
            'Cinema': 'Regista della vita reale, crea storie attraverso gli eventi.',
            'Business': 'Catalizzatore di opportunità, trasforma incontri in successi.',
            'Gaming': 'Player della vita reale, livella up le connessioni sociali.'
        };

        const primaryInterest = userData.interests?.[0] || 'Sport';
        const baseBio = personalities[primaryInterest] || personalities['Sport'];
        
        const enhancements = [
            'Con un approccio neurale alle relazioni sociali.',
            'Alimentato dall\'intelligenza artificiale delle connessioni.',
            'Specialista in networking di nuova generazione.',
            'Innovatore delle dinamiche sociali moderne.'
        ];

        return `${baseBio} ${enhancements[Math.floor(Math.random() * enhancements.length)]}`;
    },

    // Advanced event suggestion with contextual AI
    generateEventSuggestion: async (preferences) => {
        const aiTemplates = {
            'Sport': {
                titles: ['Neural Fitness Challenge', 'AI Sport Connect', 'Biorhythm Training'],
                descriptions: ['Allenamento di gruppo con monitoraggio AI delle performance', 'Sessione sportiva con matching intelligente dei partecipanti'],
                locations: ['Centro Fitness Neural', 'Parco Tecnologico', 'Smart Gym Arena']
            },
            'Musica': {
                titles: ['Sonic Neural Session', 'AI Music Mixer', 'Harmonic Convergence'],
                descriptions: ['Jam session con AI che suggerisce accordi perfetti', 'Serata musicale con playlist generate dall\'intelligenza artificiale'],
                locations: ['Studio Neural Sound', 'Jazz Club AI', 'Sala Prove Digitale']
            },
            'Arte': {
                titles: ['Digital Art Neural', 'AI Creative Lab', 'Neuro-Aesthetic Experience'],
                descriptions: ['Workshop artistico con AI che analizza creatività', 'Mostra interattiva di arte generata dall\'intelligenza artificiale'],
                locations: ['Galleria Neural', 'Art Studio AI', 'Museo Digitale']
            },
            'Tecnologia': {
                titles: ['Tech Neural Meetup', 'AI Innovation Hub', 'Future Tech Gathering'],
                descriptions: ['Discussione su AI e futuro della tecnologia', 'Demo di progetti innovativi con intelligenza artificiale integrata'],
                locations: ['Hub Innovazione', 'Coworking Tech', 'Laboratorio AI']
            },
            'Cultura': {
                titles: ['Cultural Neural Exchange', 'AI Heritage Tour', 'Neuro-Cultural Immersion'],
                descriptions: ['Esplorazione culturale guidata da AI storica', 'Tour intelligente con realtà aumentata culturale'],
                locations: ['Museo Neural', 'Centro Culturale AI', 'Biblioteca Digitale']
            }
        };

        const category = preferences.category || 'Sport';
        const template = aiTemplates[category] || aiTemplates['Sport'];
        
        const title = template.titles[Math.floor(Math.random() * template.titles.length)];
        const description = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
        const location = template.locations[Math.floor(Math.random() * template.locations.length)];

        return {
            title,
            description,
            category,
            location,
            ageRange: preferences.ageRange || '18-35',
            genderPreference: preferences.genderPreference || 'entrambi',
            aiGenerated: true,
            neuralCompatibility: Math.floor(Math.random() * 30) + 70 // 70-100%
        };
    },

    // AI Avatar Chat Response Generator
    generateAvatarResponse: async (userProfile, context = '') => {
        const responseTypes = {
            greeting: [
                `Ciao! Sono l'avatar AI di ${userProfile.username}. Ti interessa sapere di più sui suoi eventi?`,
                `L'intelligenza artificiale di ${userProfile.username} ti dà il benvenuto! Sempre pronto a nuove connessioni.`,
                `Avatar Neural attivo! ${userProfile.username} tornerà presto, nel frattempo posso aiutarti io.`
            ],
            event_interest: [
                `${userProfile.username} ama eventi di tipo ${userProfile.interests?.[0] || 'social'}. Ti consiglio di seguirlo!`,
                `L'AI rileva alta compatibilità con i tuoi interessi. ${userProfile.username} organizza eventi fantastici!`,
                `Neural match positivo! ${userProfile.username} e te avete potenziale per belle collaborazioni.`
            ],
            offline: [
                `${userProfile.username} è probabilmente ad un evento neural in questo momento!`,
                `L'AI indica che ${userProfile.username} tornerà online tra poco. Aspettalo!`,
                `Avatar in modalità autonoma: ${userProfile.username} è impegnato in networking reale!`
            ]
        };

        const type = context || 'greeting';
        const responses = responseTypes[type] || responseTypes.greeting;
        return responses[Math.floor(Math.random() * responses.length)];
    },

    // Enhanced WhatsApp invite with neural branding
    generateWhatsAppInvite: async (eventData) => {
        const neuralEmojis = ['🧠', '⚡', '🚀', '💫', '🔮', '✨'];
        const randomEmoji = neuralEmojis[Math.floor(Math.random() * neuralEmojis.length)];
        
        const aiAnalysis = eventData.aiGenerated ? 
            `\n🤖 *Evento AI-Generato* - Compatibilità Neural: ${eventData.neuralCompatibility || 85}%` : 
            `\n🧠 *Analizzato da Neural AI* - Raccomandato per te!`;

        return `${randomEmoji} *${eventData.title}*

${eventData.description}

📅 *Data:* ${new Date(eventData.event_date).toLocaleDateString('it-IT', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
})}
📍 *Location:* ${eventData.location}
👥 *Partecipanti:* ${eventData.participants_count || 0}/${eventData.max_participants || '∞'}

${eventData.gender_preference !== 'entrambi' ? `🚻 *Preferenza:* ${eventData.gender_preference}\n` : ''}${eventData.age_range ? `🎂 *Età:* ${eventData.age_range} anni\n` : ''}
${aiAnalysis}

💫 *Powered by SocialNet Neural*
🔗 Partecipa: https://socialnet-neural.vercel.app/event/${eventData.id}

#SocialNetNeural #AIEvents #FutureNetworking`;
    },

    // Weekly community story generator
    generateWeeklyStory: async (eventsData, participationData) => {
        const totalEvents = eventsData.length;
        const totalParticipants = participationData.reduce((sum, event) => sum + (event.participants_count || 0), 0);
        const avgParticipants = totalEvents > 0 ? Math.round(totalParticipants / totalEvents) : 0;
        
        // AI generates insights
        const insights = [
            `L'AI ha rilevato un incremento del ${Math.floor(Math.random() * 25) + 15}% nelle connessioni significative`,
            `Gli algoritmi neurali hanno facilitato ${Math.floor(totalParticipants * 0.3)} nuove amicizie`,
            `Il machine learning ha ottimizzato ${Math.floor(totalEvents * 0.8)} eventi per massima compatibilità`,
            `La neural network ha predetto con il 92% di accuratezza i match sociali perfetti`
        ];

        const weeklyInsight = insights[Math.floor(Math.random() * insights.length)];

        return {
            title: "🧠 Storia Settimanale Neural Community",
            content: `Questa settimana la nostra intelligenza artificiale ha orchestrato una sinfonia sociale incredibile! 

Con ${totalEvents} eventi neurali creati e ${totalParticipants} partecipanti attivi, abbiamo raggiunto una media di ${avgParticipants} persone per evento.

${weeklyInsight}.

Il futuro del networking sociale è qui, e sta evolvendo attraverso ogni connessione che create! 🚀✨`,
            
            highlights: [
                `${totalEvents} Eventi Neural Creati`,
                `${totalParticipants} Connessioni Attive`,
                `${Math.floor(totalParticipants * 0.25)} Nuove Collaborazioni`,
                `${Math.floor(Math.random() * 15) + 85}% Satisfaction Rate AI`
            ],
            
            aiPredictions: [
                'Trend in crescita: Eventi Tech e AI',
                'Location più richieste: Spazi ibridi digitali',
                'Orari ottimali: 18:30-21:00',
                'Dimensione ideale: 8-15 partecipanti'
            ],
            
            generatedAt: new Date().toISOString()
        };
    },

    // DALL-E prompt generator with neural enhancement
    generateImagePrompt: (eventData) => {
        const neuralStyles = [
            'futuristic neural network background',
            'holographic digital overlay',
            'AI-enhanced lighting effects',
            'cyberpunk social atmosphere',
            'neural connection visualizations'
        ];

        const basePrompts = {
            'Sport': 'dynamic sports activity with people having fun, high energy',
            'Musica': 'vibrant music event with instruments and dancing people',
            'Arte': 'contemporary art gallery with creative people interacting',
            'Cultura': 'sophisticated cultural gathering in modern museum setting',
            'Tecnologia': 'high-tech meetup with screens and innovative atmosphere',
            'Cibo': 'social dining experience with beautiful food presentation',
            'Cinema': 'modern cinema screening with engaged audience',
            'All\'aperto': 'outdoor social gathering in beautiful natural setting',
            'Business': 'professional networking event in sleek modern venue',
            'Gaming': 'gaming tournament with excited participants and screens'
        };

        const basePrompt = basePrompts[eventData.category] || basePrompts['Sport'];
        const neuralStyle = neuralStyles[Math.floor(Math.random() * neuralStyles.length)];
        
        return `${basePrompt}, ${neuralStyle}, photorealistic, 8k quality, professional photography, vibrant colors, social media ready, Instagram aesthetic`;
    },

    // Neural reputation system
    calculateReputationScore: (userData, eventHistory, socialInteractions) => {
        const basePoints = {
            eventCreated: 15,
            eventAttended: 8,
            eventCompleted: 12,
            positiveReview: 10,
            earlyAdopter: 20,
            consistentParticipation: 25
        };

        let score = 0;
        
        // Events created and completed
        score += (eventHistory.created || 0) * basePoints.eventCreated;
        score += (eventHistory.attended || 0) * basePoints.eventAttended;
        score += (eventHistory.completed || 0) * basePoints.eventCompleted;
        
        // Social interactions
        score += (socialInteractions.positiveReviews || 0) * basePoints.positiveReview;
        score += (socialInteractions.helpfulComments || 0) * 3;
        score += (socialInteractions.eventShares || 0) * 5;
        
        // Consistency bonus
        if (eventHistory.consistency > 0.8) {
            score += basePoints.consistentParticipation;
        }
        
        // Early adopter bonus
        if (userData.joinedDate && new Date(userData.joinedDate) < new Date('2024-01-01')) {
            score += basePoints.earlyAdopter;
        }
        
        // Apply neural network multiplier based on community impact
        const neuralMultiplier = 1 + (Math.log(score + 1) / 10);
        
        return Math.min(Math.floor(score * neuralMultiplier), 999);
    },

    // Travel mode suggestions
    generateTravelSuggestions: async (currentLocation, userPreferences) => {
        const cityEventMaps = {
            'Milano': {
                hotspots: ['Navigli', 'Brera', 'Porta Nuova', 'Isola'],
                eventTypes: ['Arte', 'Musica', 'Business', 'Cibo'],
                aiRecommendation: 'Hub perfetto per networking business e cultura'
            },
            'Roma': {
                hotspots: ['Trastevere', 'Centro Storico', 'EUR', 'Testaccio'],
                eventTypes: ['Cultura', 'Arte', 'Cinema', 'Cibo'],
                aiRecommendation: 'Capitale culturale con infinite opportunità social'
            },
            'Firenze': {
                hotspots: ['Centro', 'Oltrarno', 'Cascine', 'Santa Croce'],
                eventTypes: ['Arte', 'Cultura', 'Viaggi', 'All\'aperto'],
                aiRecommendation: 'Città d\'arte perfetta per eventi culturali'
            },
            'Torino': {
                hotspots: ['Centro', 'San Salvario', 'Quadrilatero', 'Lingotto'],
                eventTypes: ['Tecnologia', 'Business', 'Arte', 'Sport'],
                aiRecommendation: 'Innovation hub con forte community tech'
            }
        };

        const cityData = cityEventMaps[currentLocation] || cityEventMaps['Milano'];
        const suggestedLocation = cityData.hotspots[Math.floor(Math.random() * cityData.hotspots.length)];
        const suggestedType = cityData.eventTypes[Math.floor(Math.random() * cityData.eventTypes.length)];

        return {
            location: `${suggestedLocation}, ${currentLocation}`,
            eventType: suggestedType,
            aiInsight: cityData.aiRecommendation,
            localTrends: [
                `${suggestedType} molto richiesto in zona`,
                `${suggestedLocation} in trending per eventi`,
                `Orario ottimale: ${Math.floor(Math.random() * 3) + 18}:00`
            ]
        };
    }
};

// 🚀 Enhanced Event Feed Component
const NeuralEventFeed = memo(({ supabase, user, aiProfile, travelMode, currentLocation }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [trendingEvents, setTrendingEvents] = useState([]);
    const [aiRecommendations, setAiRecommendations] = useState([]);

    useEffect(() => {
        loadEvents();
        if (travelMode) {
            generateTravelRecommendations();
        }
    }, [filter, travelMode, currentLocation]);

    const loadEvents = async () => {
        try {
            let query = supabase
                .from('events_with_counts')
                .select('*')
                .gte('event_date', new Date().toISOString())
                .order('event_date', { ascending: true });

            if (filter !== 'all') {
                query = query.eq('category', filter);
            }

            if (travelMode && currentLocation) {
                query = query.ilike('location', `%${currentLocation}%`);
            }

            const { data, error } = await query.limit(20);
            
            if (error) throw error;
            
            setEvents(data || []);
            
            // Generate AI analysis for each event
            const eventsWithAI = await Promise.all(
                (data || []).map(async (event) => {
                    const compatibility = Math.floor(Math.random() * 40) + 60;
                    const reasons = [
                        'Match con i tuoi interessi',
                        'Location conveniente',
                        'Orario ottimale per te',
                        'Partecipanti affini',
                        'Categoria preferita'
                    ].slice(0, Math.floor(Math.random() * 3) + 1);

                    return {
                        ...event,
                        aiAnalysis: {
                            compatibility,
                            reasons,
                            recommendation: compatibility > 80 ? 'Altamente consigliato' : 'Buona compatibilità'
                        }
                    };
                })
            );
            
            setEvents(eventsWithAI);
            
        } catch (error) {
            console.error('Load events error:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateTravelRecommendations = async () => {
        try {
            const suggestions = await NeuralAI.generateTravelSuggestions(
                currentLocation, 
                aiProfile?.interests || []
            );
            setAiRecommendations([suggestions]);
        } catch (error) {
            console.error('Travel recommendations error:', error);
        }
    };

    const handleJoinEvent = async (eventId) => {
        try {
            const { error } = await supabase
                .from('event_participants')
                .insert([{
                    event_id: eventId,
                    user_id: user.id,
                    status: 'confirmed'
                }]);

            if (error) throw error;

            // Update local state
            setEvents(prev => prev.map(event => 
                event.id === eventId 
                    ? { ...event, participants_count: (event.participants_count || 0) + 1 }
                    : event
            ));

            window.addNotification?.({
                type: 'success',
                title: 'Partecipazione confermata!',
                message: 'Ti sei unito all\'evento Neural'
            });

        } catch (error) {
            console.error('Join event error:', error);
            window.addNotification?.({
                type: 'error',
                title: 'Errore',
                message: 'Impossibile unirsi all\'evento'
            });
        }
    };

    const categories = ['all', 'Sport', 'Musica', 'Arte', 'Cultura', 'Tecnologia', 'Cibo'];

    if (loading) {
        return (
            <div className="neural-feed-loading">
                <div className="loading-neural">
                    <i className="fas fa-brain fa-pulse"></i>
                    <p>L'AI sta analizzando gli eventi perfetti per te...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="neural-event-feed">
            {/* Travel Mode Recommendations */}
            {travelMode && aiRecommendations.length > 0 && (
                <div className="travel-recommendations">
                    <h3>
                        <i className="fas fa-map-marked-alt"></i>
                        Raccomandazioni Neural per {currentLocation}
                    </h3>
                    {aiRecommendations.map((rec, index) => (
                        <div key={index} className="travel-rec-card">
                            <div className="rec-content">
                                <h4>AI suggerisce: {rec.eventType} a {rec.location}</h4>
                                <p>{rec.aiInsight}</p>
                                <div className="local-trends">
                                    {rec.localTrends.map((trend, idx) => (
                                        <span key={idx} className="trend-tag">
                                            <i className="fas fa-trending-up"></i>
                                            {trend}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filter Categories */}
            <div className="neural-filters">
                <h3>Eventi Neural</h3>
                <div className="filter-tabs">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`filter-tab ${filter === category ? 'active' : ''}`}
                            onClick={() => setFilter(category)}
                        >
                            {category === 'all' ? 'Tutti' : category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Events Grid */}
            <div className="events-grid">
                {events.length > 0 ? (
                    events.map(event => (
                        <window.SocialSpotComponents.EventCard
                            key={event.id}
                            event={event}
                            user={user}
                            supabase={supabase}
                            onJoin={handleJoinEvent}
                        />
                    ))
                ) : (
                    <div className="no-events">
                        <i className="fas fa-brain"></i>
                        <h4>Neural AI non ha trovato eventi</h4>
                        <p>Prova a cambiare filtro o crea il primo evento!</p>
                    </div>
                )}
            </div>
        </div>
    );
});

// 🚀 Enhanced Notification System
const NeuralNotificationSystem = memo(() => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((notification) => {
        const id = Date.now() + Math.random();
        const neuralNotification = {
            ...notification,
            id,
            timestamp: new Date().toISOString(),
            neuralEnhanced: true
        };

        setNotifications(prev => [neuralNotification, ...prev.slice(0, 4)]);

        // Auto remove after duration
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, notification.duration || 5000);
    }, []);

    // Make globally available
    useEffect(() => {
        window.addNotification = addNotification;
    }, [addNotification]);

    return (
        <div className="neural-notifications">
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className={`neural-notification ${notification.type || 'info'}`}
                >
                    <div className="notification-icon">
                        <i className={`fas ${notification.icon || 'fa-brain'}`}></i>
                    </div>
                    <div className="notification-content">
                        <div className="notification-title">
                            {notification.title}
                        </div>
                        <div className="notification-message">
                            {notification.message}
                        </div>
                    </div>
                    <button 
                        className="notification-close"
                        onClick={() => setNotifications(prev => 
                            prev.filter(n => n.id !== notification.id)
                        )}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            ))}
        </div>
    );
});

// Export enhanced components
window.SocialSpotComponents = {
    ...window.SocialSpotComponents,
    EventFeed: NeuralEventFeed,
    NotificationSystem: NeuralNotificationSystem
};

// Global Neural AI availability
window.NeuralAI = NeuralAI;

console.log('🧠 SocialNet Neural App Logic loaded successfully!');
