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

// 🔹 ENHANCED MY EVENTS LIST
const MyEventsList = memo(({ supabase, user }) => {
   const [myEvents, setMyEvents] = useState([]);
   const [loading, setLoading] = useState(true);
   const [filter, setFilter] = useState('all'); // all, upcoming, past

   useEffect(() => {
       const loadMyEvents = async () => {
           try {
               const { data, error } = await supabase
                   .from('events')
                   .select('*')
                   .eq('creator_id', user.id)
                   .order('event_date', { ascending: false });
               
               if (!error && data) {
                   setMyEvents(data);
               }
           } catch (error) {
               console.error('Errore caricamento eventi:', error);
           } finally {
               setLoading(false);
           }
       };

       loadMyEvents();
   }, [supabase, user.id]);

   const filteredEvents = useMemo(() => {
       const now = new Date();
       return myEvents.filter(event => {
           const eventDate = new Date(event.event_date);
           switch (filter) {
               case 'upcoming': return eventDate > now;
               case 'past': return eventDate <= now;
               default: return true;
           }
       });
   }, [myEvents, filter]);

   const formatEventDate = (date) => {
       return new Date(date).toLocaleDateString('it-IT', {
           day: 'numeric',
           month: 'short',
           year: 'numeric',
           hour: '2-digit',
           minute: '2-digit'
       });
   };

   const getEventStatus = (date) => {
       const eventDate = new Date(date);
       const now = new Date();
       return eventDate > now ? 'futuro' : 'passato';
   };

   if (loading) {
       return (
           <div className="my-events-section">
               <div className="section-header">
                   <h3 className="section-title">
                       <i className="fas fa-calendar-check section-icon"></i>
                       I miei eventi
                   </h3>
               </div>
               <div className="skeleton" style={{ height: '200px' }}></div>
           </div>
       );
   }

   return (
       <div className="my-events-section">
           <div className="section-header">
               <h3 className="section-title">
                   <i className="fas fa-calendar-check section-icon"></i>
                   I miei eventi ({myEvents.length})
               </h3>
           </div>

           {myEvents.length > 0 && (
               <div className="event-filters" style={{ marginBottom: '20px' }}>
                   <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                       {[
                           { key: 'all', label: 'Tutti', count: myEvents.length },
                           { key: 'upcoming', label: 'In arrivo', count: myEvents.filter(e => new Date(e.event_date) > new Date()).length },
                           { key: 'past', label: 'Passati', count: myEvents.filter(e => new Date(e.event_date) <= new Date()).length }
                       ].map(filterOption => (
                           <button
                               key={filterOption.key}
                               className={`filter-btn ${filter === filterOption.key ? 'active' : ''}`}
                               onClick={() => setFilter(filterOption.key)}
                               style={{
                                   padding: '6px 12px',
                                   border: '1px solid var(--color-border)',
                                   borderRadius: 'var(--radius-full)',
                                   background: filter === filterOption.key ? 'var(--color-primary-600)' : 'var(--color-surface)',
                                   color: filter === filterOption.key ? 'white' : 'var(--color-text)',
                                   fontSize: 'var(--font-size-sm)',
                                   fontWeight: 'var(--font-weight-medium)',
                                   cursor: 'pointer',
                                   transition: 'all 0.2s ease'
                               }}
                           >
                               {filterOption.label} ({filterOption.count})
                           </button>
                       ))}
                   </div>
               </div>
           )}
           
           {filteredEvents.length === 0 ? (
               <div className="empty-state">
                   <i className="fas fa-calendar-times empty-icon"></i>
                   <h4>
                       {filter === 'upcoming' && 'Nessun evento in arrivo'}
                       {filter === 'past' && 'Nessun evento passato'}
                       {filter === 'all' && 'Nessun evento creato'}
                   </h4>
                   <p>
                       {filter === 'all' 
                           ? 'Non hai ancora creato nessun evento. Inizia ora!' 
                           : 'Cambia filtro per vedere altri eventi.'
                       }
                   </p>
               </div>
           ) : (
               <div className="my-events-list">
                   {filteredEvents.map((event, index) => (
                       <div key={event.id} className="my-event-item animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                           <div className="event-info">
                               <h4 className="event-title">{event.title}</h4>
                               <div className="event-details">
                                   <span className="event-date">
                                       <i className="fas fa-calendar"></i>
                                       {formatEventDate(event.event_date)}
                                   </span>
                                   <span className="event-location">
                                       <i className="fas fa-map-marker-alt"></i>
                                       {event.location}
                                   </span>
                                   <span className={`event-status ${getEventStatus(event.event_date)}`}>
                                       <i className={`fas ${getEventStatus(event.event_date) === 'futuro' ? 'fa-clock' : 'fa-check'}`}></i>
                                       {getEventStatus(event.event_date) === 'futuro' ? 'In arrivo' : 'Concluso'}
                                   </span>
                               </div>
                           </div>
                           <div className="event-actions">
                               <button className="btn-outline btn-sm">
                                   <i className="fas fa-eye"></i>
                                   Dettagli
                               </button>
                               {getEventStatus(event.event_date) === 'futuro' && (
                                   <button className="btn-outline btn-sm" style={{ color: 'var(--color-secondary-600)', borderColor: 'var(--color-secondary-600)' }}>
                                       <i className="fas fa-edit"></i>
                                       Modifica
                                   </button>
                               )}
                           </div>
                       </div>
                   ))}
               </div>
           )}
       </div>
   );
});

// 🔹 ENHANCED EVENT FEED
const EventFeed = memo(({ supabase, user }) => {
   const [events, setEvents] = useState([]);
   const [filteredEvents, setFilteredEvents] = useState([]);
   const [favoriteIds, setFavoriteIds] = useState([]);
   const [trendingEvents, setTrendingEvents] = useState([]);
   const [recommendedEvents, setRecommendedEvents] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [search, setSearch] = useState('');
   const [selectedCategories, setSelectedCategories] = useState([]);
   const [viewEvent, setViewEvent] = useState(null);
   const [sortBy, setSortBy] = useState('date'); // date, popularity, alphabetical

   const debouncedSearch = useCallback(
       debounce((searchTerm) => {
           setSearch(searchTerm);
       }, 300),
       []
   );

   useEffect(() => {
       loadData();
   }, [supabase, user.id]);

   useEffect(() => {
       filterAndSortEvents();
   }, [search, selectedCategories, events, sortBy]);

   const loadData = async () => {
       setLoading(true);
       setError(null);
       
       try {
           // Check cache first
           const cachedEvents = getCachedData('events');
           if (cachedEvents) {
               setEvents(cachedEvents);
               setFilteredEvents(cachedEvents);
               setLoading(false);
               return;
           }

           const { data: eventsData, error: eventsError } = await supabase
               .from('events')
               .select('*')
               .order('event_date', { ascending: true });
               
           if (eventsError) throw new Error(eventsError.message);
           
           const eventsList = eventsData || [];
           setEvents(eventsList);
           setFilteredEvents(eventsList);
           setCachedData('events', eventsList);

           // Load favorites
           const { data: favData } = await supabase
               .from('event_favorites')
               .select('event_id')
               .eq('user_id', user.id);
           setFavoriteIds(favData ? favData.map((f) => f.event_id) : []);

           // Load trending and recommended
           await Promise.all([
               loadTrendingEvents(eventsList),
               loadRecommendedEvents(eventsList)
           ]);

       } catch (err) {
           setError(err.message);
           window.addNotification?.({
               type: 'error',
               icon: 'fas fa-exclamation-triangle',
               title: 'Errore caricamento',
               message: 'Impossibile caricare gli eventi'
           });
       } finally {
           setLoading(false);
       }
   };

   const loadTrendingEvents = async (eventsList) => {
       try {
           const { data: participantsData } = await supabase
               .from('event_participants')
               .select('event_id, user_id');

           const counts = {};
           (participantsData || []).forEach((p) => {
               counts[p.event_id] = (counts[p.event_id] || 0) + 1;
           });

           const sorted = eventsList
               .map((evt) => ({ ...evt, participantCount: counts[evt.id] || 0 }))
               .sort((a, b) => b.participantCount - a.participantCount)
               .filter((evt) => evt.participantCount > 0)
               .slice(0, 4);
               
           setTrendingEvents(sorted);
       } catch (error) {
           console.error('Errore caricamento trending:', error);
       }
   };

   const loadRecommendedEvents = async (eventsList) => {
       try {
           const { data: profile } = await supabase
               .from('profiles')
               .select('interests')
               .eq('id', user.id)
               .single();
               
           const userInterests = profile?.interests || [];

          const { data: participantsData } = await supabase
               .from('event_participants')
               .select('event_id');

           const counts = {};
           (participantsData || []).forEach((p) => {
               counts[p.event_id] = (counts[p.event_id] || 0) + 1;
           });

           const recommended = eventsList
               .filter((evt) => userInterests.includes(evt.category))
               .map((evt) => ({ ...evt, participantCount: counts[evt.id] || 0 }))
               .sort((a, b) => b.participantCount - a.participantCount)
               .slice(0, 3);
               
           setRecommendedEvents(recommended);
       } catch (error) {
           console.error('Errore caricamento raccomandazioni:', error);
       }
   };

   const filterAndSortEvents = () => {
       let result = [...events];
       
       // Apply search filter
       if (search.trim()) {
           const searchLower = search.toLowerCase();
           result = result.filter((e) =>
               e.title.toLowerCase().includes(searchLower) ||
               e.description.toLowerCase().includes(searchLower) ||
               e.location.toLowerCase().includes(searchLower) ||
               e.category.toLowerCase().includes(searchLower)
           );
       }
       
       // Apply category filter
       if (selectedCategories.length > 0) {
           result = result.filter((e) => selectedCategories.includes(e.category));
       }
       
       // Apply sorting
       switch (sortBy) {
           case 'alphabetical':
               result.sort((a, b) => a.title.localeCompare(b.title));
               break;
           case 'popularity':
               // This would need participant data - placeholder for now
               result.sort((a, b) => Math.random() - 0.5);
               break;
           case 'date':
           default:
               result.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
               break;
       }
       
       setFilteredEvents(result);
   };

   const handleViewDetails = (event) => {
       setViewEvent(event);
   };

   const handleToggleFavorite = async (event) => {
       const isFav = favoriteIds.includes(event.id);
       
       try {
           if (isFav) {
               const { error } = await supabase
                   .from('event_favorites')
                   .delete()
                   .eq('event_id', event.id)
                   .eq('user_id', user.id);
                   
               if (!error) {
                   setFavoriteIds(favoriteIds.filter((id) => id !== event.id));
                   window.addNotification?.({
                       type: 'info',
                       icon: 'far fa-star',
                       title: 'Rimosso dai preferiti',
                       message: event.title
                   });
               }
           } else {
               const { error } = await supabase
                   .from('event_favorites')
                   .insert({ event_id: event.id, user_id: user.id });
                   
               if (!error) {
                   setFavoriteIds([...favoriteIds, event.id]);
                   window.addNotification?.({
                       type: 'success',
                       icon: 'fas fa-star',
                       title: 'Aggiunto ai preferiti',
                       message: event.title
                   });
               }
           }
       } catch (error) {
           console.error('Errore toggle preferito:', error);
           window.addNotification?.({
               type: 'error',
               icon: 'fas fa-exclamation-triangle',
               title: 'Errore',
               message: 'Impossibile aggiornare i preferiti'
           });
       }
   };

   const handleCategoryToggle = (category) => {
       setSelectedCategories(prev => 
           prev.includes(category)
               ? prev.filter(c => c !== category)
               : [...prev, category]
       );
   };

   const clearFilters = () => {
       setSearch('');
       setSelectedCategories([]);
       setSortBy('date');
   };

   if (loading) {
       return (
           <div className="feed-wrapper">
               <div className="feed-header">
                   <div className="skeleton" style={{ height: '60px', marginBottom: '16px' }}></div>
                   <div className="skeleton" style={{ height: '24px', width: '60%', margin: '0 auto' }}></div>
               </div>
               <div className="skeleton" style={{ height: '200px', marginBottom: '40px' }}></div>
               <div className="skeleton" style={{ height: '300px' }}></div>
           </div>
       );
   }

   return (
       <div className="feed-wrapper">
           <div className="feed-header animate-fade-in-up">
               <h1 className="feed-title">Scopri Eventi</h1>
               <p className="feed-subtitle">Trova eventi interessanti nella tua zona e connettiti con la community</p>
           </div>

           {/* Raccomandazioni personalizzate */}
           {recommendedEvents.length > 0 && (
               <div className="recommended-section animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                   <div className="section-header">
                       <h3 className="section-title">
                           <i className="fas fa-heart section-icon"></i>
                           Suggeriti per te
                       </h3>
                   </div>
                   <div className="horizontal-scroll">
                       {recommendedEvents.map((evt, index) => (
                           <div 
                               key={evt.id} 
                               className="recommendation-card animate-scale-in" 
                               style={{ animationDelay: `${index * 0.1}s` }}
                               onClick={() => handleViewDetails(evt)}
                           >
                               <h4 className="card-title">{evt.title}</h4>
                               <p className="card-meta">{evt.category}</p>
                               <div className="participants-count">
                                   <i className="fas fa-users"></i>
                                   <span>{evt.participantCount || 0} interessati</span>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           )}

           {/* Eventi di tendenza */}
           {trendingEvents.length > 0 && (
               <div className="trending-section animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                   <div className="section-header">
                       <h3 className="section-title">
                           <i className="fas fa-fire section-icon"></i>
                           Eventi di tendenza
                       </h3>
                   </div>
                   <div className="horizontal-scroll">
                       {trendingEvents.map((evt, index) => (
                           <div 
                               key={evt.id} 
                               className="trend-card animate-scale-in"
                               style={{ animationDelay: `${index * 0.1}s` }}
                               onClick={() => handleViewDetails(evt)}
                           >
                               <h4 className="card-title">{evt.title}</h4>
                               <p className="card-meta">{evt.category}</p>
                               <div className="participants-count">
                                   <i className="fas fa-users"></i>
                                   <span>{evt.participantCount} partecipanti</span>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           )}

           {/* Ricerca e filtri avanzati */}
           <div className="search-filter-section animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
               <div className="search-bar">
                   <i className="fas fa-search search-icon"></i>
                   <input
                       type="text"
                       className="search-input"
                       placeholder="Cerca eventi per titolo, descrizione, luogo o categoria..."
                       onChange={(e) => debouncedSearch(e.target.value)}
                   />
               </div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                   <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                       <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                           Ordina per:
                       </label>
                       <select 
                           value={sortBy}
                           onChange={(e) => setSortBy(e.target.value)}
                           className="form-input"
                           style={{ width: 'auto', minWidth: '150px' }}
                       >
                           <option value="date">Data evento</option>
                           <option value="alphabetical">Nome A-Z</option>
                           <option value="popularity">Popolarità</option>
                       </select>
                   </div>
                   
                   {(search || selectedCategories.length > 0 || sortBy !== 'date') && (
                       <button className="btn-outline btn-sm" onClick={clearFilters}>
                           <i className="fas fa-times"></i>
                           Pulisci filtri
                       </button>
                   )}
               </div>
               
               <div className="filter-categories">
                   {AVAILABLE_CATEGORIES.map((cat) => (
                       <label 
                           key={cat} 
                           className={`category-chip ${selectedCategories.includes(cat) ? 'selected' : ''}`}
                           onClick={() => handleCategoryToggle(cat)}
                       >
                           <input
                               type="checkbox"
                               value={cat}
                               checked={selectedCategories.includes(cat)}
                               onChange={() => {}} // Controlled by onClick
                               style={{ display: 'none' }}
                           />
                           <span>{cat}</span>
                       </label>
                   ))}
               </div>
               
               {(search || selectedCategories.length > 0) && (
                   <div style={{ marginTop: '16px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                       Mostrando {filteredEvents.length} eventi
                       {search && ` per "${search}"`}
                       {selectedCategories.length > 0 && ` in ${selectedCategories.join(', ')}`}
                   </div>
               )}
           </div>

           {/* Lista eventi con stato di caricamento intelligente */}
           {error ? (
               <div className="error-message animate-fade-in-up">
                   <i className="fas fa-exclamation-circle"></i> 
                   {error}
                   <button 
                       className="btn-outline btn-sm" 
                       onClick={loadData}
                       style={{ marginLeft: '12px' }}
                   >
                       <i className="fas fa-redo"></i>
                       Riprova
                   </button>
               </div>
           ) : filteredEvents.length === 0 ? (
               <div className="empty-state animate-fade-in-up">
                   <i className="fas fa-calendar-times empty-icon"></i>
                   <h4>Nessun evento trovato</h4>
                   <p>
                       {search || selectedCategories.length > 0 
                           ? 'Prova a modificare i filtri di ricerca.'
                           : 'Non ci sono eventi disponibili al momento.'
                       }
                   </p>
                   {(search || selectedCategories.length > 0) && (
                       <button className="btn-primary" onClick={clearFilters} style={{ marginTop: '16px' }}>
                           <i className="fas fa-times"></i>
                           Rimuovi filtri
                       </button>
                   )}
               </div>
           ) : (
               <div className="event-list">
                   {filteredEvents.map((event, index) => (
                       <div key={event.id} style={{ animationDelay: `${index * 0.05}s` }}>
                           <EventCard
                               event={event}
                               onJoin={handleViewDetails}
                               isFavorite={favoriteIds.includes(event.id)}
                               onToggleFavorite={handleToggleFavorite}
                               showParticipantCount={true}
                           />
                       </div>
                   ))}
               </div>
           )}

           {/* Modal dettagli evento */}
           {viewEvent && (
               <EventDetailModal
                   supabase={supabase}
                   event={viewEvent}
                   onClose={() => setViewEvent(null)}
                   user={user}
               />
           )}
       </div>
   );
});

// 🔹 ENHANCED EVENT CHAT
const EventChat = memo(({ supabase, eventId, user, isParticipant }) => {
   const [messages, setMessages] = useState([]);
   const [newMessage, setNewMessage] = useState('');
   const [loading, setLoading] = useState(true);
   const [sending, setSending] = useState(false);
   const [onlineUsers, setOnlineUsers] = useState([]);
   const messagesEndRef = React.useRef(null);

   const scrollToBottom = () => {
       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   };

   useEffect(() => {
       scrollToBottom();
   }, [messages]);

   useEffect(() => {
       if (!isParticipant) return;
       
       loadMessages();
       setupRealtimeSubscription();
       
       return () => {
           // Cleanup subscription would go here
       };
   }, [supabase, eventId, isParticipant]);

   const loadMessages = async () => {
       setLoading(true);
       try {
           const { data, error } = await supabase
               .from('event_chats')
               .select(`
                   id, 
                   content, 
                   created_at,
                   user_id,
                   profiles!event_chats_user_id_fkey(username)
               `)
               .eq('event_id', eventId)
               .order('created_at', { ascending: true });
           
           if (!error && data) {
               setMessages(data);
           }
       } catch (error) {
           console.error('Errore caricamento chat:', error);
       } finally {
           setLoading(false);
       }
   };

   const setupRealtimeSubscription = () => {
       const channel = supabase.channel(`event_chat_${eventId}`)
           .on('postgres_changes', { 
               event: 'INSERT', 
               schema: 'public', 
               table: 'event_chats', 
               filter: `event_id=eq.${eventId}` 
           }, (payload) => {
               // Add the new message with user profile
               setMessages((prev) => [...prev, {
                   ...payload.new,
                   profiles: payload.new.user_id === user.id ? 
                       { username: 'Tu' } : 
                       { username: 'Utente' } // Would need to fetch actual username
               }]);
           })
           .subscribe();
           
       return () => {
           supabase.removeChannel(channel);
       };
   };

   const handleSend = async (e) => {
       e.preventDefault();
       if (!newMessage.trim() || !isParticipant || sending) return;
       
       setSending(true);
       try {
           const { error } = await supabase
               .from('event_chats')
               .insert({ 
                   event_id: eventId, 
                   user_id: user.id, 
                   content: newMessage.trim() 
               });
               
           if (!error) {
               setNewMessage('');
           } else {
               window.addNotification?.({
                   type: 'error',
                   icon: 'fas fa-exclamation-triangle',
                   title: 'Errore invio',
                   message: 'Impossibile inviare il messaggio'
               });
           }
       } catch (error) {
           console.error('Errore invio messaggio:', error);
       } finally {
           setSending(false);
       }
   };

   const handleKeyPress = (e) => {
       if (e.key === 'Enter' && !e.shiftKey) {
           e.preventDefault();
           handleSend(e);
       }
   };

   if (!isParticipant) {
       return (
           <div className="chat-section">
               <div className="chat-locked animate-fade-in-up">
                   <i className="fas fa-lock"></i>
                   <p>Partecipa all'evento per accedere alla chat di gruppo</p>
               </div>
           </div>
       );
   }

   return (
       <div className="chat-section">
           <div className="section-title-small">
               <i className="fas fa-comments"></i>
               Chat evento
               {onlineUsers.length > 0 && (
                   <span style={{ 
                       marginLeft: 'auto', 
                       fontSize: 'var(--font-size-xs)', 
                       color: 'var(--color-text-muted)',
                       fontWeight: 'normal'
                   }}>
                       {onlineUsers.length} online
                   </span>
               )}
           </div>
           
           {loading ? (
               <div className="text-center">
                   <div className="skeleton" style={{ height: '150px', marginBottom: '16px' }}></div>
                   <div className="skeleton" style={{ height: '40px' }}></div>
               </div>
           ) : (
               <>
                   <div className="chat-list">
                       {messages.length === 0 ? (
                           <div className="text-center" style={{ 
                               color: 'var(--color-text-muted)', 
                               padding: '40px 20px' 
                           }}>
                               <i className="fas fa-comment-slash" style={{ fontSize: '2rem', marginBottom: '12px' }}></i>
                               <p>Nessun messaggio ancora.</p>
                               <p style={{ fontSize: 'var(--font-size-sm)' }}>Inizia la conversazione!</p>
                           </div>
                       ) : (
                           messages.map((msg, index) => (
                               <div 
                                   key={msg.id} 
                                   className={`chat-item ${msg.user_id === user.id ? 'own-message' : ''} animate-fade-in-up`}
                                   style={{ 
                                       animationDelay: `${index * 0.05}s`,
                                       alignSelf: msg.user_id === user.id ? 'flex-end' : 'flex-start',
                                       maxWidth: '80%',
                                       background: msg.user_id === user.id ? 
                                           'var(--color-primary-600)' : 
                                           'var(--color-surface)',
                                       color: msg.user_id === user.id ? 'white' : 'var(--color-text)'
                                   }}
                               >
                                   <div className="message-header">
                                       <span className="message-author" style={{
                                           color: msg.user_id === user.id ? 
                                               'rgba(255,255,255,0.9)' : 
                                               'var(--color-primary-600)'
                                       }}>
                                           {msg.user_id === user.id ? 'Tu' : (msg.profiles?.username || 'Utente')}
                                       </span>
                                       <span className="message-time" style={{
                                           color: msg.user_id === user.id ? 
                                               'rgba(255,255,255,0.7)' : 
                                               'var(--color-text-muted)'
                                       }}>
                                           {new Date(msg.created_at).toLocaleTimeString('it-IT', {
                                               hour: '2-digit',
                                               minute: '2-digit'
                                           })}
                                       </span>
                                   </div>
                                   <p className="message-content">{msg.content}</p>
                               </div>
                           ))
                       )}
                       <div ref={messagesEndRef} />
                   </div>
                   
                   <form onSubmit={handleSend} className="chat-form">
                       <input
                           type="text"
                           className="form-input"
                           value={newMessage}
                           onChange={(e) => setNewMessage(e.target.value)}
                           onKeyPress={handleKeyPress}
                           placeholder="Scrivi un messaggio..."
                           disabled={sending}
                           maxLength={500}
                           style={{ resize: 'none' }}
                       />
                       <button 
                           type="submit" 
                           className="btn-secondary" 
                           disabled={sending || !newMessage.trim()}
                           title="Invia messaggio (Enter)"
                       >
                           {sending ? (
                               <i className="fas fa-spinner fa-spin"></i>
                           ) : (
                               <i className="fas fa-paper-plane"></i>
                           )}
                       </button>
                   </form>
                   
                   {newMessage.length > 450 && (
                       <div style={{ 
                           fontSize: 'var(--font-size-xs)', 
                           color: 'var(--color-text-muted)', 
                           textAlign: 'center',
                           marginTop: '4px'
                       }}>
                           {500 - newMessage.length} caratteri rimanenti
                       </div>
                   )}
               </>
           )}
       </div>
   );
});

// 🔹 ENHANCED EVENT DETAIL MODAL
const EventDetailModal = memo(({ supabase, event, onClose, user }) => {
   const [participants, setParticipants] = useState([]);
   const [isJoined, setIsJoined] = useState(false);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [comments, setComments] = useState([]);
   const [newComment, setNewComment] = useState('');
   const [posting, setPosting] = useState(false);
   const [activeTab, setActiveTab] = useState('details'); // details, comments, chat

   useEffect(() => {
       loadParticipants();
       loadComments();
   }, [supabase, event.id, user.id]);

   const loadParticipants = async () => {
       setLoading(true);
       setError(null);
       
       try {
           const { data, error } = await supabase
               .from('event_participants')
               .select('user_id, profiles!event_participants_user_id_fkey(username)')
               .eq('event_id', event.id);
               
           if (error) {
               setError(error.message);
           } else {
               setParticipants(data || []);
               setIsJoined((data || []).some((p) => p.user_id === user.id));
           }
       } catch (error) {
           setError(error.message);
       } finally {
           setLoading(false);
       }
   };

   const loadComments = async () => {
       try {
           const { data, error } = await supabase
               .from('event_comments')
               .select(`
                   id, 
                   content, 
                   created_at,
                   user_id,
                   profiles!event_comments_user_id_fkey(username)
               `)
               .eq('event_id', event.id)
               .order('created_at', { ascending: true });
               
           if (!error && data) setComments(data);
       } catch (error) {
           console.error('Errore caricamento commenti:', error);
       }
   };

   const handleSubmitComment = async (e) => {
       e.preventDefault();
       if (!newComment.trim()) return;
       
       setPosting(true);
       try {
           const { error } = await supabase
               .from('event_comments')
               .insert({ 
                   event_id: event.id, 
                   user_id: user.id, 
                   content: newComment.trim() 
               });
               
           if (!error) {
               setNewComment('');
               loadComments();
               window.addNotification?.({
                   type: 'success',
                   icon: 'fas fa-comment',
                   title: 'Commento aggiunto',
                   message: 'Il tuo commento è stato pubblicato'
               });
           }
       } catch (error) {
           console.error('Errore invio commento:', error);
           window.addNotification?.({
               type: 'error',
               icon: 'fas fa-exclamation-triangle',
               title: 'Errore',
               message: 'Impossibile pubblicare il commento'
           });
       } finally {
           setPosting(false);
       }
   };

   const handleToggleJoin = async () => {
       try {
           if (isJoined) {
               const { error } = await supabase
                   .from('event_participants')
                   .delete()
                   .eq('event_id', event.id)
                   .eq('user_id', user.id);
                   
               if (!error) {
                   setParticipants(participants.filter((p) => p.user_id !== user.id));
                   setIsJoined(false);
                   window.addNotification?.({
                       type: 'info',
                       icon: 'fas fa-user-minus',
                       title: 'Partecipazione rimossa',
                       message: `Non partecipi più a "${event.title}"`
                   });
               }
           } else {
               const { error } = await supabase
                   .from('event_participants')
                   .insert({ event_id: event.id, user_id: user.id });
                   
               if (!error) {
                   setParticipants([...participants, { user_id: user.id, profiles: { username: 'Tu' } }]);
                   setIsJoined(true);
                   window.addNotification?.({
                       type: 'success',
                       icon: 'fas fa-user-plus',
                       title: 'Partecipazione confermata!',
                       message: `Ora partecipi a "${event.title}"`
                   });
               }
           }
       } catch (error) {
           console.error('Errore toggle partecipazione:', error);
           window.addNotification?.({
               type: 'error',
               icon: 'fas fa-exclamation-triangle',
               title: 'Errore',
               message: 'Impossibile aggiornare la partecipazione'
           });
       }
   };

   const eventDate = new Date(event.event_date || event.date);
   const isUpcoming = eventDate > new Date();

   return (
       <div className="modal-overlay" onClick={onClose}>
           <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
               <div className="modal-header">
                   <button className="modal-close" onClick={onClose}>
                       <i className="fas fa-times"></i>
                   </button>
               </div>
               
               <div className="modal-body">
                   <h3 className="modal-title">{event.title}</h3>
                   <span className="event-category">{event.category}</span>
                   
                   <div className="event-meta">
                       <div className="event-meta-item">
                           <i className="fas fa-clock"></i>
                           <span>{formatEventDate(eventDate)}</span>
                           {!isUpcoming && <span style={{ color: 'var(--color-error-500)', marginLeft: '8px' }}>(Concluso)</span>}
                       </div>
                       <div className="event-meta-item">
                           <i className="fas fa-map-marker-alt"></i>
                           <span>{event.location}</span>
                       </div>
                   </div>
                   
                   <p className="event-description">{event.description}</p>
                   
                   <div className="participant-count">
                       <i className="fas fa-users"></i>
                       <span>Partecipanti: {participants.length}</span>
                   </div>
                   
                   {loading && (
                       <div className="text-center">
                           <div className="skeleton" style={{ height: '40px' }}></div>
                       </div>
                   )}
                   
                   {error && (
                       <div className="error-message">
                           <i className="fas fa-exclamation-circle"></i> {error}
                       </div>
                   )}
                   
                   {isUpcoming && (
                       <button 
                           className={`btn-primary join-btn ${isJoined ? 'btn-outline' : ''}`} 
                           onClick={handleToggleJoin}
                       >
                           <i className={isJoined ? 'fas fa-user-minus' : 'fas fa-user-plus'}></i>
                           {isJoined ? 'Annulla partecipazione' : 'Partecipa all\'evento'}
                       </button>
                   )}
                   
                   {/* Tab Navigation */}
                   <div className="modal-tabs" style={{
                       display: 'flex',
                       gap: '8px',
                       marginBottom: '20px',
                       borderBottom: '1px solid var(--color-border)',
                       paddingBottom: '12px'
                   }}>
                       {[
                           { key: 'details', label: 'Dettagli', icon: 'fas fa-info-circle' },
                           { key: 'comments', label: 'Commenti', icon: 'fas fa-comments', count: comments.length },
                           { key: 'chat', label: 'Chat', icon: 'fas fa-comment-dots', disabled: !isJoined }
                       ].map(tab => (
                           <button
                               key={tab.key}
                               className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                               onClick={() => !tab.disabled && setActiveTab(tab.key)}
                               disabled={tab.disabled}
                               style={{
                                   padding: '8px 16px',
                                   border: 'none',
                                   background: activeTab === tab.key ? 'var(--color-primary-600)' : 'transparent',
                                   color: activeTab === tab.key ? 'white' : tab.disabled ? 'var(--color-text-muted)' : 'var(--color-text)',
                                   borderRadius: 'var(--radius-lg)',
                                   cursor: tab.disabled ? 'not-allowed' : 'pointer',
                                   fontSize: 'var(--font-size-sm)',
                                   fontWeight: 'var(--font-weight-medium)',
                                   transition: 'all 0.2s ease',
display: 'flex',
                                   alignItems: 'center',
                                   gap: '6px'
                               }}
                           >
                               <i className={tab.icon}></i>
                               <span>{tab.label}</span>
                               {tab.count !== undefined && (
                                   <span style={{
                                       background: activeTab === tab.key ? 'rgba(255,255,255,0.3)' : 'var(--color-primary-600)',
                                       color: activeTab === tab.key ? 'white' : 'white',
                                       fontSize: 'var(--font-size-xs)',
                                       padding: '2px 6px',
                                       borderRadius: 'var(--radius-full)',
                                       minWidth: '18px',
                                       textAlign: 'center'
                                   }}>
                                       {tab.count}
                                   </span>
                               )}
                           </button>
                       ))}
                   </div>

                   {/* Tab Content */}
                   {activeTab === 'details' && (
                       <div className="tab-content animate-fade-in-up">
                           {participants.length > 0 && (
                               <div style={{ marginBottom: '24px' }}>
                                   <h4 style={{ 
                                       fontSize: 'var(--font-size-base)', 
                                       fontWeight: 'var(--font-weight-semibold)',
                                       marginBottom: '12px',
                                       display: 'flex',
                                       alignItems: 'center',
                                       gap: '8px'
                                   }}>
                                       <i className="fas fa-users"></i>
                                       Partecipanti ({participants.length})
                                   </h4>
                                   <div style={{
                                       display: 'flex',
                                       flexWrap: 'wrap',
                                       gap: '8px'
                                   }}>
                                       {participants.slice(0, 10).map((participant, index) => (
                                           <div
                                               key={participant.user_id}
                                               style={{
                                                   display: 'flex',
                                                   alignItems: 'center',
                                                   gap: '6px',
                                                   padding: '4px 8px',
                                                   background: 'var(--color-surface-hover)',
                                                   borderRadius: 'var(--radius-full)',
                                                   fontSize: 'var(--font-size-xs)',
                                                   border: participant.user_id === user.id ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)'
                                               }}
                                           >
                                               <div style={{
                                                   width: '20px',
                                                   height: '20px',
                                                   borderRadius: '50%',
                                                   background: participant.user_id === user.id ? 'var(--color-primary-600)' : 'var(--color-gray-400)',
                                                   display: 'flex',
                                                   alignItems: 'center',
                                                   justifyContent: 'center',
                                                   color: 'white',
                                                   fontSize: '10px',
                                                   fontWeight: 'bold'
                                               }}>
                                                   {participant.user_id === user.id ? 'Tu' : (participant.profiles?.username?.[0] || '?')}
                                               </div>
                                               <span>{participant.user_id === user.id ? 'Tu' : (participant.profiles?.username || 'Utente')}</span>
                                           </div>
                                       ))}
                                       {participants.length > 10 && (
                                           <div style={{
                                               padding: '4px 8px',
                                               background: 'var(--color-surface-hover)',
                                               borderRadius: 'var(--radius-full)',
                                               fontSize: 'var(--font-size-xs)',
                                               color: 'var(--color-text-muted)'
                                           }}>
                                               +{participants.length - 10} altri
                                           </div>
                                       )}
                                   </div>
                               </div>
                           )}
                           
                           {event.creator_id && (
                               <div style={{ 
                                   padding: '16px',
                                   background: 'var(--color-surface-hover)',
                                   borderRadius: 'var(--radius-xl)',
                                   marginBottom: '16px'
                               }}>
                                   <h4 style={{ 
                                       fontSize: 'var(--font-size-sm)', 
                                       fontWeight: 'var(--font-weight-semibold)',
                                       marginBottom: '8px',
                                       color: 'var(--color-text-muted)'
                                   }}>
                                       <i className="fas fa-user-tie" style={{ marginRight: '8px' }}></i>
                                       Organizzatore
                                   </h4>
                                   <p style={{ margin: 0, color: 'var(--color-text)' }}>
                                       {event.creator_id === user.id ? 'Tu' : 'Organizzatore dell\'evento'}
                                   </p>
                               </div>
                           )}
                       </div>
                   )}

                   {activeTab === 'comments' && (
                       <div className="tab-content">
                           <div className="comments-section" style={{ background: 'transparent', padding: 0, border: 'none' }}>
                               <div className="comments-list">
                                   {comments.length === 0 ? (
                                       <div className="text-center" style={{ 
                                           color: 'var(--color-text-muted)', 
                                           padding: '40px 20px' 
                                       }}>
                                           <i className="fas fa-comment-slash" style={{ fontSize: '2rem', marginBottom: '12px' }}></i>
                                           <p>Nessun commento ancora.</p>
                                           <p style={{ fontSize: 'var(--font-size-sm)' }}>Sii il primo a commentare!</p>
                                       </div>
                                   ) : (
                                       comments.map((comment, index) => (
                                           <div key={comment.id} className="comment-item animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                                               <div className="comment-header">
                                                   <span className="comment-author">
                                                       {comment.user_id === user.id ? 'Tu' : (comment.profiles?.username || 'Utente')}
                                                   </span>
                                                   <span className="comment-time">
                                                       {new Date(comment.created_at).toLocaleString('it-IT')}
                                                   </span>
                                               </div>
                                               <p className="comment-content">{comment.content}</p>
                                           </div>
                                       ))
                                   )}
                               </div>
                               
                               <form onSubmit={handleSubmitComment} className="comment-form">
                                   <input
                                       type="text"
                                       className="form-input"
                                       value={newComment}
                                       onChange={(e) => setNewComment(e.target.value)}
                                       placeholder="Scrivi un commento..."
                                       required
                                       maxLength={300}
                                   />
                                   <button type="submit" className="btn-secondary" disabled={posting}>
                                       {posting ? (
                                           <i className="fas fa-spinner fa-spin"></i>
                                       ) : (
                                           <i className="fas fa-paper-plane"></i>
                                       )}
                                   </button>
                               </form>
                               
                               {newComment.length > 250 && (
                                   <div style={{ 
                                       fontSize: 'var(--font-size-xs)', 
                                       color: 'var(--color-text-muted)', 
                                       textAlign: 'center',
                                       marginTop: '4px'
                                   }}>
                                       {300 - newComment.length} caratteri rimanenti
                                   </div>
                               )}
                           </div>
                       </div>
                   )}

                   {activeTab === 'chat' && (
                       <div className="tab-content">
                           <EventChat 
                               supabase={supabase} 
                               eventId={event.id} 
                               user={user}
                               isParticipant={isJoined}
                           />
                       </div>
                   )}
               </div>
           </div>
       </div>
   );
});

// 🔹 ENHANCED CREATE EVENT
const CreateEvent = memo(({ supabase, user, onEventCreated }) => {
   const [formData, setFormData] = useState({
       title: '',
       description: '',
       location: '',
       date: '',
       category: ''
   });
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState(null);
   const [success, setSuccess] = useState(false);
   const [step, setStep] = useState(1);
   const [validationErrors, setValidationErrors] = useState({});

   const handleInputChange = (field, value) => {
       setFormData(prev => ({
           ...prev,
           [field]: value
       }));
       
       // Clear validation error for this field
       if (validationErrors[field]) {
           setValidationErrors(prev => ({
               ...prev,
               [field]: ''
           }));
       }
       setError(null);
   };

   const validateStep = (stepNumber) => {
       const errors = {};
       
       if (stepNumber === 1) {
           if (!formData.title.trim()) errors.title = 'Il titolo è obbligatorio';
           if (formData.title.length < 5) errors.title = 'Il titolo deve essere di almeno 5 caratteri';
           if (!formData.category) errors.category = 'Seleziona una categoria';
       }
       
       if (stepNumber === 2) {
           if (!formData.description.trim()) errors.description = 'La descrizione è obbligatoria';
           if (formData.description.length < 20) errors.description = 'La descrizione deve essere di almeno 20 caratteri';
       }
       
       if (stepNumber === 3) {
           if (!formData.location.trim()) errors.location = 'Il luogo è obbligatorio';
           if (!formData.date) errors.date = 'Data e ora sono obbligatorie';
           
           const eventDate = new Date(formData.date);
           const now = new Date();
           if (eventDate <= now) errors.date = 'L\'evento deve essere nel futuro';
       }
       
       setValidationErrors(errors);
       return Object.keys(errors).length === 0;
   };

   const handleNextStep = () => {
       if (validateStep(step)) {
           setStep(step + 1);
       }
   };

   const handlePrevStep = () => {
       setStep(step - 1);
   };

   const handleCreate = async (e) => {
       e.preventDefault();
       
       if (!validateStep(3)) return;
       
       setSubmitting(true);
       setError(null);
       setSuccess(false);
       
       try {
           const { error } = await supabase.from('events').insert({
               title: formData.title.trim(),
               description: formData.description.trim(),
               location: formData.location.trim(),
               event_date: formData.date,
               category: formData.category,
               creator_id: user.id
           });
           
           if (error) {
               setError(error.message);
           } else {
               setSuccess(true);
               
               // Clear cache
               EVENT_CACHE.delete('events');
               
               window.addNotification?.({
                   type: 'success',
                   icon: 'fas fa-calendar-plus',
                   title: 'Evento creato!',
                   message: `"${formData.title}" è stato pubblicato con successo`
               });
               
               if (onEventCreated) {
                   setTimeout(() => onEventCreated(), 1500);
               }
           }
       } catch (err) {
           setError(err.message);
           window.addNotification?.({
               type: 'error',
               icon: 'fas fa-exclamation-triangle',
               title: 'Errore creazione',
               message: 'Impossibile creare l\'evento'
           });
       } finally {
           setSubmitting(false);
       }
   };

   const resetForm = () => {
       setFormData({
           title: '',
           description: '',
           location: '',
           date: '',
           category: ''
       });
       setStep(1);
       setValidationErrors({});
       setError(null);
       setSuccess(false);
   };

   const getMinDateTime = () => {
       const now = new Date();
       now.setMinutes(now.getMinutes() + 60); // Almeno 1 ora nel futuro
       return now.toISOString().slice(0, 16);
   };

   const progressPercentage = (step / 3) * 100;

   return (
       <div className="create-wrapper">
           <div className="create-header animate-fade-in-up">
               <h1 className="create-title">Crea nuovo evento</h1>
               <p className="create-subtitle">Condividi un'esperienza fantastica con la community</p>
               
               {/* Progress indicator */}
               <div style={{ marginTop: '24px' }}>
                   <div style={{
                       width: '100%',
                       height: '6px',
                       background: 'var(--color-border)',
                       borderRadius: 'var(--radius-full)',
                       overflow: 'hidden'
                   }}>
                       <div style={{
                           width: `${progressPercentage}%`,
                           height: '100%',
                           background: 'linear-gradient(90deg, var(--color-primary-600), var(--color-secondary-500))',
                           transition: 'width 0.3s ease'
                       }} />
                   </div>
                   <div style={{
                       display: 'flex',
                       justifyContent: 'space-between',
                       marginTop: '8px',
                       fontSize: 'var(--font-size-sm)',
                       color: 'var(--color-text-muted)'
                   }}>
                       <span style={{ color: step >= 1 ? 'var(--color-primary-600)' : 'inherit', fontWeight: step === 1 ? 'bold' : 'normal' }}>
                           1. Info base
                       </span>
                       <span style={{ color: step >= 2 ? 'var(--color-primary-600)' : 'inherit', fontWeight: step === 2 ? 'bold' : 'normal' }}>
                           2. Descrizione
                       </span>
                       <span style={{ color: step >= 3 ? 'var(--color-primary-600)' : 'inherit', fontWeight: step === 3 ? 'bold' : 'normal' }}>
                           3. Dettagli
                       </span>
                   </div>
               </div>
           </div>
           
           <form className="create-form animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
               {/* Step 1: Basic Info */}
               {step === 1 && (
                   <div className="form-step animate-scale-in">
                       <div className="form-group">
                           <label className="form-label">
                               <i className="fas fa-calendar"></i>
                               Titolo evento *
                           </label>
                           <input 
                               type="text" 
                               className={`form-input ${validationErrors.title ? 'error' : ''}`}
                               value={formData.title} 
                               onChange={(e) => handleInputChange('title', e.target.value)} 
                               placeholder="Inserisci un titolo accattivante"
                               maxLength={100}
                           />
                           {validationErrors.title && (
                               <div style={{ color: 'var(--color-error-500)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
                                   {validationErrors.title}
                               </div>
                           )}
                           <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                               {formData.title.length}/100 caratteri
                           </div>
                       </div>
                       
                       <div className="form-group">
                           <label className="form-label">
                               <i className="fas fa-tag"></i>
                               Categoria *
                           </label>
                           <select 
                               className={`form-input form-select ${validationErrors.category ? 'error' : ''}`}
                               value={formData.category} 
                               onChange={(e) => handleInputChange('category', e.target.value)} 
                           >
                               <option value="" disabled>Seleziona categoria</option>
                               {AVAILABLE_CATEGORIES.map((cat) => (
                                   <option key={cat} value={cat}>{cat}</option>
                               ))}
                           </select>
                           {validationErrors.category && (
                               <div style={{ color: 'var(--color-error-500)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
                                   {validationErrors.category}
                               </div>
                           )}
                       </div>

                       <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                           <button 
                               type="button" 
                               className="btn-primary" 
                               onClick={handleNextStep}
                               disabled={!formData.title || !formData.category}
                           >
                               Continua
                               <i className="fas fa-arrow-right"></i>
                           </button>
                       </div>
                   </div>
               )}

               {/* Step 2: Description */}
               {step === 2 && (
                   <div className="form-step animate-scale-in">
                       <div className="form-group">
                           <label className="form-label">
                               <i className="fas fa-align-left"></i>
                               Descrizione dettagliata *
                           </label>
                           <textarea 
                               className={`form-input form-textarea ${validationErrors.description ? 'error' : ''}`}
                               value={formData.description} 
                               onChange={(e) => handleInputChange('description', e.target.value)} 
                               placeholder="Descrivi il tuo evento in dettaglio... Cosa farete? Chi può partecipare? Cosa aspettarsi?"
                               rows={6}
                               maxLength={1000}
                           />
                           {validationErrors.description && (
                               <div style={{ color: 'var(--color-error-500)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
                                   {validationErrors.description}
                               </div>
                           )}
                           <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                               {formData.description.length}/1000 caratteri
                           </div>
                       </div>

                       <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                           <button 
                               type="button" 
                               className="btn-outline" 
                               onClick={handlePrevStep}
                           >
                               <i className="fas fa-arrow-left"></i>
                               Indietro
                           </button>
                           <button 
                               type="button" 
                               className="btn-primary" 
                               onClick={handleNextStep}
                               disabled={!formData.description || formData.description.length < 20}
                           >
                               Continua
                               <i className="fas fa-arrow-right"></i>
                           </button>
                       </div>
                   </div>
               )}

               {/* Step 3: Details */}
               {step === 3 && (
                   <div className="form-step animate-scale-in">
                       <div className="form-row">
                           <div className="form-group">
                               <label className="form-label">
                                   <i className="fas fa-map-marker-alt"></i>
                                   Luogo *
                               </label>
                               <input 
                                   type="text" 
                                   className={`form-input ${validationErrors.location ? 'error' : ''}`}
                                   value={formData.location} 
                                   onChange={(e) => handleInputChange('location', e.target.value)} 
                                   placeholder="Via, Città o luogo specifico"
                                   maxLength={150}
                               />
                               {validationErrors.location && (
                                   <div style={{ color: 'var(--color-error-500)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
                                       {validationErrors.location}
                                   </div>
                               )}
                           </div>
                           
                           <div className="form-group">
                               <label className="form-label">
                                   <i className="fas fa-clock"></i>
                                   Data e ora *
                               </label>
                               <input 
                                   type="datetime-local" 
                                   className={`form-input ${validationErrors.date ? 'error' : ''}`}
                                   value={formData.date} 
                                   onChange={(e) => handleInputChange('date', e.target.value)} 
                                   min={getMinDateTime()}
                               />
                               {validationErrors.date && (
                                   <div style={{ color: 'var(--color-error-500)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
                                       {validationErrors.date}
                                   </div>
                               )}
                           </div>
                       </div>

                       {/* Preview */}
                       {formData.title && formData.category && formData.description && formData.location && formData.date && (
                           <div style={{
                               marginTop: '24px',
                               padding: '20px',
                               background: 'var(--color-surface-hover)',
                               borderRadius: 'var(--radius-xl)',
                               border: '1px solid var(--color-border)'
                           }}>
                               <h4 style={{ marginBottom: '12px', color: 'var(--color-text-muted)' }}>
                                   <i className="fas fa-eye" style={{ marginRight: '8px' }}></i>
                                   Anteprima evento
                               </h4>
                               <div className="event-card" style={{ marginBottom: 0, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
                                   <div className="event-image">
                                       <i className="fas fa-calendar-alt"></i>
                                   </div>
                                   <div className="event-content">
                                       <div className="event-header">
                                           <div>
                                               <h3 className="event-title">{formData.title}</h3>
                                               <span className="event-category">{formData.category}</span>
                                           </div>
                                       </div>
                                       <div className="event-meta">
                                           <div className="event-meta-item">
                                               <i className="fas fa-clock"></i>
                                               <span>{formatEventDate(new Date(formData.date))}</span>
                                           </div>
                                           <div className="event-meta-item">
                                               <i className="fas fa-map-marker-alt"></i>
                                               <span>{formData.location}</span>
                                           </div>
                                       </div>
                                       <p className="event-description">
                                           {formData.description.length > 120 
                                               ? `${formData.description.substring(0, 120)}...` 
                                               : formData.description
                                           }
                                       </p>
                                   </div>
                               </div>
                           </div>
                       )}

                       {error && (
                           <div className="error-message animate-fade-in-up" style={{ marginTop: '16px' }}>
                               <i className="fas fa-exclamation-circle"></i> {error}
                           </div>
                       )}
                       
                       {success && (
                           <div className="success-message animate-fade-in-up" style={{ marginTop: '16px' }}>
                               <i className="fas fa-check-circle"></i> 
                               Evento creato con successo! Reindirizzamento in corso...
                           </div>
                       )}

                       <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                           <button 
                               type="button" 
                               className="btn-outline" 
                               onClick={handlePrevStep}
                               disabled={submitting}
                           >
                               <i className="fas fa-arrow-left"></i>
                               Indietro
                           </button>
                           
                           <div style={{ display: 'flex', gap: '12px' }}>
                               <button 
                                   type="button" 
                                   className="btn-outline" 
                                   onClick={resetForm}
                                   disabled={submitting}
                               >
                                   <i className="fas fa-redo"></i>
                                   Ricomincia
                               </button>
                               <button 
                                   type="button" 
                                   className="btn-primary" 
                                   onClick={handleCreate}
                                   disabled={submitting || !formData.location || !formData.date}
                               >
                                   {submitting ? (
                                       <>
                                           <i className="fas fa-spinner fa-spin"></i>
                                           Creazione...
                                       </>
                                   ) : (
                                       <>
                                           <i className="fas fa-plus-circle"></i>
                                           Crea evento
                                       </>
                                   )}
                               </button>
                           </div>
                       </div>
                   </div>
               )}
           </form>
       </div>
   );
});

// 🔹 ENHANCED PROFILE PAGE
const ProfilePage = memo(({ supabase, user, theme, onToggleTheme }) => {
   const [formData, setFormData] = useState({
       fullName: '',
       selectedInterests: []
   });
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState(null);
   const [success, setSuccess] = useState(false);

   useEffect(() => {
       loadProfile();
   }, [supabase, user.id]);

   const loadProfile = async () => {
       setLoading(true);
       try {
           const { data, error } = await supabase
               .from('profiles')
               .select('username, interests')
               .eq('id', user.id)
               .single();
               
           if (error && error.code !== 'PGRST116') {
               console.error('Errore caricamento profilo:', error);
           } else {
               setFormData({
                   fullName: data?.username || '',
                   selectedInterests: data?.interests || []
               });
           }
       } catch (error) {
           console.error('Errore caricamento profilo:', error);
       } finally {
           setLoading(false);
       }
   };

   const handleSave = async (e) => {
       e.preventDefault();
       setSaving(true);
       setError(null);
       setSuccess(false);
       
       try {
           const { error } = await supabase
               .from('profiles')
               .upsert({ 
                   id: user.id,
                   username: formData.fullName.trim(), 
                   interests: formData.selectedInterests 
               }, { onConflict: 'id' });
               
           if (error) {
               setError(error.message);
           } else {
               setSuccess(true);
               setTimeout(() => setSuccess(false), 3000);
               
               window.addNotification?.({
                   type: 'success',
                   icon: 'fas fa-user-check',
                   title: 'Profilo aggiornato',
                   message: 'Le tue informazioni sono state salvate'
               });
           }
       } catch (error) {
           setError(error.message);
       } finally {
           setSaving(false);
       }
   };

   const handleInterestToggle = (interest) => {
       setFormData(prev => ({
           ...prev,
           selectedInterests: prev.selectedInterests.includes(interest)
               ? prev.selectedInterests.filter(i => i !== interest)
               : [...prev.selectedInterests, interest]
       }));
   };

   const initials = formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase();

   return (
       <div className="profile-wrapper">
           <div className="profile-header animate-fade-in-up">
               <div className="profile-avatar glow-animation">
                   {initials}
               </div>
               <h1 className="profile-name">{formData.fullName || 'Utente'}</h1>
               <p className="profile-email">{user.email}</p>
               
               {/* Quick stats */}
               <div style={{
                   display: 'flex',
                   gap: '20px',
                   justifyContent: 'center',
                   marginTop: '16px',
                   fontSize: 'var(--font-size-sm)'
               }}>
                   <div style={{ textAlign: 'center' }}>
                       <div style={{ fontWeight: 'bold', color: 'var(--color-primary-600)' }}>
                           {formData.selectedInterests.length}
                       </div>
                       <div style={{ color: 'var(--color-text-muted)' }}>Interessi</div>
                   </div>
                   <div style={{ textAlign: 'center' }}>
                       <div style={{ fontWeight: 'bold', color: 'var(--color-secondary-600)' }}>
                           {new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                       </div>
                       <div style={{ color: 'var(--color-text-muted)' }}>Membro da</div>
                   </div>
               </div>
           </div>
           
           {loading ? (
               <div className="profile-section">
                   <div className="skeleton" style={{ height: '200px' }}></div>
               </div>
           ) : (
               <>
                   <form onSubmit={handleSave} className="profile-form animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                       <div className="form-group">
                           <label className="form-label">
                               <i className="fas fa-user"></i>
                               Nome completo
                           </label>
                           <input 
                               type="text" 
                               className="form-input"
                               value={formData.fullName} 
                               onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} 
                               required 
                               placeholder="Il tuo nome completo"
                               maxLength={100}
                           />
                           <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                               {formData.fullName.length}/100 caratteri
                           </div>
                       </div>
                       
                       <div className="form-group">
                           <label className="form-label">
                               <i className="fas fa-heart"></i>
                               Interessi ({formData.selectedInterests.length} selezionati)
                           </label>
                           <div className="interests-grid">
                               {AVAILABLE_CATEGORIES.map((cat) => (
                                   <label 
                                       key={cat} 
                                       className={`interest-chip ${formData.selectedInterests.includes(cat) ? 'selected' : ''}`}
                                       onClick={() => handleInterestToggle(cat)}
                                   >
                                       <input
                                           type="checkbox"
                                           value={cat}
                                           checked={formData.selectedInterests.includes(cat)}
                                           onChange={() => {}} // Controlled by onClick
                                       />
                                       <i className="fas fa-check"></i>
                                       <span>{cat}</span>
                                   </label>
                               ))}
                           </div>
                           <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: '12px' }}>
                               💡 I tuoi interessi ci aiutano a suggerirti eventi personalizzati
                           </div>
                       </div>
                       
                       {error && (
                           <div className="error-message animate-fade-in-up">
                               <i className="fas fa-exclamation-circle"></i> {error}
                           </div>
                       )}
                       
                       {success && (
                           <div className="success-message animate-fade-in-up">
                               <i className="fas fa-check-circle"></i> Profilo aggiornato con successo!
                           </div>
                       )}
                       
                       <button type="submit" className="btn-primary" disabled={saving}>
                           {saving ? (
                               <>
                                   <i className="fas fa-spinner fa-spin"></i>
                                   Salvataggio...
                               </>
                           ) : (
                               <>
                                   <i className="fas fa-save"></i>
                                   Salva modifiche
                               </>
                           )}
                       </button>
                   </form>

                   {/* Lista eventi creati dall'utente */}
                   <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                       <MyEventsList supabase={supabase} user={user} />
                   </div>

                   {/* Gamification con conteggi corretti */}
                   <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                       <Gamification supabase={supabase} user={user} />
                   </div>
                   
                   {/* Impostazioni avanzate */}
                   <div className="profile-section animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                       <div className="section-header">
                           <h3 className="section-title">
                               <i className="fas fa-cog section-icon"></i>
                               Impostazioni
                           </h3>
                       </div>
                       
                       {/* Theme toggle */}
                       <div style={{ 
                           display: 'flex', 
                           alignItems: 'center', 
                           justifyContent: 'space-between',
                           padding: '16px',
                           background: 'var(--color-surface-hover)',
                           borderRadius: 'var(--radius-xl)',
                           marginBottom: '16px'
                       }}>
                           <div>
                               <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
                                   <i className="fas fa-palette" style={{ marginRight: '8px' }}></i>
                                   Tema: {theme === 'light' ? 'Chiaro' : 'Scuro'}
                               </p>
                               <small style={{ color: 'var(--color-text-muted)' }}>
                                   Personalizza l'aspetto dell'interfaccia
                               </small>
                           </div>
                           <button className="btn-secondary" onClick={onToggleTheme}>
                               <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
                               Cambia tema
                           </button>
                       </div>

                       {/* Notifications settings */}
                       <div style={{ 
                           display: 'flex', 
                           alignItems: 'center', 
                           justifyContent: 'space-between',
                           padding: '16px',
                           background: 'var(--color-surface-hover)',
                           borderRadius: 'var(--radius-xl)',
                           marginBottom: '16px'
                       }}>
                           <div>
                               <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
                                   <i className="fas fa-bell" style={{ marginRight: '8px' }}></i>
                                   Notifiche
                               </p>
                               <small style={{ color: 'var(--color-text-muted)' }}>
                                   Ricevi aggiornamenti sui tuoi eventi
                               </small>
                           </div>
                           <button 
                               className="btn-outline" 
                               onClick={() => {
                                   window.addNotification?.({
                                       type: 'info',
                                       icon: 'fas fa-bell',
                                       title: 'Notifiche',
                                       message: 'Funzionalità in sviluppo!'
                                   });
                               }}
                           >
                               <i className="fas fa-cog"></i>
                               Configura
                           </button>
                       </div>

                       {/* Privacy settings */}
                       <div style={{ 
                           display: 'flex', 
                           alignItems: 'center', 
                           justifyContent: 'space-between',
                           padding: '16px',
                           background: 'var(--color-surface-hover)',
                           borderRadius: 'var(--radius-xl)',
                           marginBottom: '16px'
                       }}>
                           <div>
                               <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
                                   <i className="fas fa-shield-alt" style={{ marginRight: '8px' }}></i>
                                   Privacy e sicurezza
                               </p>
                               <small style={{ color: 'var(--color-text-muted)' }}>
                                   Gestisci visibilità e dati personali
                               </small>
                           </div>
                           <button 
                               className="btn-outline"
                               onClick={() => {
                                   window.addNotification?.({
                                       type: 'info',
                                       icon: 'fas fa-shield-alt',
                                       title: 'Privacy',
                                       message: 'Pannello privacy in arrivo!'
                                   });
                               }}
                           >
                               <i className="fas fa-arrow-right"></i>
                               Gestisci
                           </button>
                       </div>

                       {/* Data export */}
                       <div style={{ 
                           display: 'flex', 
                           alignItems: 'center', 
                           justifyContent: 'space-between',
                           padding: '16px',
                           background: 'var(--color-surface-hover)',
                           borderRadius: 'var(--radius-xl)'
                       }}>
                           <div>
                               <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
                                   <i className="fas fa-download" style={{ marginRight: '8px' }}></i>
                                   Esporta i tuoi dati
                               </p>
                               <small style={{ color: 'var(--color-text-muted)' }}>
                                   Scarica una copia dei tuoi dati
                               </small>
                           </div>
                           <button 
                               className="btn-outline"
                               onClick={() => {
                                   window.addNotification?.({
                                       type: 'info',
                                       icon: 'fas fa-download',
                                       title: 'Esportazione dati',
                                       message: 'Funzionalità in sviluppo!'
                                   });
                               }}
                           >
                               <i className="fas fa-download"></i>
                               Esporta
                           </button>
                       </div>
                   </div>

                   {/* Account actions */}
                   <div className="profile-section animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                       <div className="section-header">
                           <h3 className="section-title">
                               <i className="fas fa-user-cog section-icon"></i>
                               Account
                           </h3>
                       </div>
                       
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                           <button 
                               className="btn-outline"
                               style={{ 
                                   justifyContent: 'flex-start',
                                   color: 'var(--color-warning-600)',
                                   borderColor: 'var(--color-warning-600)'
                               }}
                               onClick={() => {
                                   if (confirm('Sei sicuro di voler resettare tutte le impostazioni?')) {
                                       window.addNotification?.({
                                           type: 'warning',
                                           icon: 'fas fa-undo',
                                           title: 'Reset impostazioni',
                                           message: 'Funzionalità in sviluppo!'
                                       });
                                   }
                               }}
                           >
                               <i className="fas fa-undo"></i>
                               Reset impostazioni
                           </button>
                           
                           <button 
                               className="btn-outline"
                               style={{ 
                                   justifyContent: 'flex-start',
                                   color: 'var(--color-error-600)',
                                   borderColor: 'var(--color-error-600)'
                               }}
                               onClick={() => {
                                   if (confirm('⚠️ ATTENZIONE: Questa azione eliminerà permanentemente il tuo account e tutti i dati associati. Sei sicuro di voler procedere?')) {
                                       window.addNotification?.({
                                           type: 'error',
                                           icon: 'fas fa-exclamation-triangle',
                                           title: 'Eliminazione account',
                                           message: 'Per sicurezza, contatta il supporto per eliminare l\'account.'
                                       });
                                   }
                               }}
                           >
                               <i className="fas fa-trash-alt"></i>
                               Elimina account
                           </button>
                       </div>
                   </div>
               </>
           )}
       </div>
   );
});

// 🔹 PERFORMANCE OPTIMIZATION HOC
const withPerformance = (WrappedComponent, componentName) => {
   return React.memo((props) => {
       const startTime = React.useRef(performance.now());
       
       React.useEffect(() => {
           const renderTime = performance.now() - startTime.current;
           if (renderTime > 16) { // More than one frame
               console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
           }
       });
       
       return <WrappedComponent {...props} />;
   });
};

// Apply performance monitoring to heavy components
const PerformantEventFeed = withPerformance(EventFeed, 'EventFeed');
const PerformantCreateEvent = withPerformance(CreateEvent, 'CreateEvent');
const PerformantProfilePage = withPerformance(ProfilePage, 'ProfilePage');

// Export enhanced components
window.SocialSpotComponents = {
   Auth,
   EventCard,
   Gamification,
   MyEventsList,
   EventFeed: PerformantEventFeed,
   EventChat,
   EventDetailModal,
   CreateEvent: PerformantCreateEvent,
   ProfilePage: PerformantProfilePage,
   
   // Utility functions
   formatEventDate,
   getCachedData,
   setCachedData,
   debounce,
   
   // Constants
   AVAILABLE_CATEGORIES,
   CACHE_DURATION
};

console.log('🎨 SocialSpot Components v2.0 loaded successfully!');
                                 
