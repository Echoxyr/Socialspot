/*
 * components.js - SocialSpot Componenti Aggiornati
 * Implementa tutte le nuove funzionalità richieste:
 * - Correzione conteggi eventi (organizzati vs partecipati)
 * - Lista eventi creati nel profilo
 * - Chat di gruppo per eventi
 * - Design responsive migliorato
 */

const { useState, useEffect } = React;

// Elenco delle categorie disponibili
const AVAILABLE_CATEGORIES = [
    'Sport',
    'Musica', 
    'Arte',
    'Cultura',
    'Tecnologia',
    'Cibo',
    'Viaggi',
    'Cinema',
    'All\'aperto'
];

/* 🔹 AUTH COMPONENT - Autenticazione moderna */
function Auth({ supabase, setUser }) {
    const [isSignIn, setIsSignIn] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [interests, setInterests] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleAuth(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            let result;
            if (isSignIn) {
                result = await supabase.auth.signInWithPassword({ email, password });
            } else {
                result = await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            interests: interests
                        }
                    }
                });
                if (result.data?.user && !result.error) {
                    // Crea il profilo
                    await supabase.from('profiles').insert({ 
                        id: result.data.user.id,
                        username: fullName,
                        interests: interests
                    });
                }
            }
            if (result.error) {
                setError(result.error.message);
            } else {
                setUser(result.data.user);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="logo-icon">
                        <span className="logo-text">SS</span>
                    </div>
                    <h1>SocialSpot</h1>
                    <p>Connettiti con eventi e persone della tua zona</p>
                </div>
                
                <div className="auth-content">
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

                    <form onSubmit={handleAuth} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input 
                                type="email" 
                                className="form-input"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                placeholder="inserisci@email.com" 
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input 
                                type="password" 
                                className="form-input"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                placeholder="••••••••" 
                            />
                        </div>

                        {!isSignIn && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Nome completo</label>
                                    <input 
                                        type="text" 
                                        className="form-input"
                                        value={fullName} 
                                        onChange={(e) => setFullName(e.target.value)} 
                                        placeholder="Il tuo nome" 
                                        required 
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Interessi (seleziona almeno uno)</label>
                                    <div className="interests-grid">
                                        {AVAILABLE_CATEGORIES.map((cat) => (
                                            <label 
                                                key={cat} 
                                                className={`interest-chip ${interests.includes(cat) ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={cat}
                                                    checked={interests.includes(cat)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setInterests([...interests, cat]);
                                                        } else {
                                                            setInterests(interests.filter((i) => i !== cat));
                                                        }
                                                    }}
                                                />
                                                <i className="fas fa-check"></i>
                                                <span>{cat}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {error && <div className="error-message"><i className="fas fa-exclamation-circle"></i> {error}</div>}
                        
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Attendere...
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
}

/* 🔹 EVENT CARD - Card evento moderna */
function EventCard({ event, onJoin, isFavorite, onToggleFavorite }) {
    const eventDate = new Date(event.event_date || event.date);
    
    return (
        <div className="event-card">
            <div className="event-image">
                <i className="fas fa-calendar-alt"></i>
            </div>
            
            <div className="event-content">
                <div className="event-header">
                    <div>
                        <h3 className="event-title">{event.title}</h3>
                        <span className="event-category">{event.category}</span>
                    </div>
                    <button
                        className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
                        onClick={() => onToggleFavorite(event)}
                        title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                    >
                        <i className={isFavorite ? 'fas fa-star' : 'far fa-star'}></i>
                    </button>
                </div>

                <div className="event-meta">
                    <div className="event-meta-item">
                        <i className="fas fa-clock"></i>
                        <span>{eventDate.toLocaleString('it-IT')}</span>
                    </div>
                    <div className="event-meta-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{event.location}</span>
                    </div>
                </div>

                <p className="event-description">{event.description}</p>

                <div className="event-actions">
                    <button className="btn-secondary" onClick={() => onJoin(event)}>
                        <i className="fas fa-info-circle"></i>
                        Dettagli
                    </button>
                </div>
            </div>
        </div>
    );
}

/* 🔹 GAMIFICATION - Sistema punti CORRETTO */
function Gamification({ supabase, user }) {
    const [points, setPoints] = useState(0);
    const [level, setLevel] = useState(1);
    const [loading, setLoading] = useState(true);
    const [createdCount, setCreatedCount] = useState(0);
    const [joinedCount, setJoinedCount] = useState(0);

    useEffect(() => {
        async function computePoints() {
            setLoading(true);
            try {
                // ✅ EVENTI CREATI: conta solo eventi creati dall'utente
                const { data: created } = await supabase
                    .from('events')
                    .select('id')
                    .eq('creator_id', user.id);
                
                // ✅ EVENTI PARTECIPATI: conta solo partecipazioni a eventi di ALTRI
                const { data: joined } = await supabase
                    .from('event_participants')
                    .select('event_id, events!inner(creator_id)')
                    .eq('user_id', user.id)
                    .neq('events.creator_id', user.id); // Esclude eventi creati da lui stesso
                    
                const createdEvents = created ? created.length : 0;
                const joinedEvents = joined ? joined.length : 0;
                const pts = createdEvents * 5 + joinedEvents * 2;
                
                setCreatedCount(createdEvents);
                setJoinedCount(joinedEvents);
                setPoints(pts);
                setLevel(Math.floor(pts / 100) + 1);
            } catch (e) {
                console.error('Errore calcolo punti:', e);
            } finally {
                setLoading(false);
            }
        }
        computePoints();
    }, [supabase, user.id]);

    const progressPercentage = (points % 100);

    return (
        <div className="gamification-wrapper">
            <div className="section-header">
                <h3 className="section-title">
                    <i className="fas fa-trophy section-icon"></i>
                    I tuoi progressi
                </h3>
            </div>
            
            {loading ? (
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span> Calcolo dei punti...</span>
                </div>
            ) : (
                <>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-value">{points}</div>
                            <div className="stat-label">Punti</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{level}</div>
                            <div className="stat-label">Livello</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{createdCount}</div>
                            <div className="stat-label">Eventi organizzati</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{joinedCount}</div>
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
                            {100 - progressPercentage} punti al prossimo livello
                        </small>
                    </div>
                </>
            )}
        </div>
    );
}

/* 🔹 MY EVENTS LIST - Lista eventi creati dall'utente */
function MyEventsList({ supabase, user }) {
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMyEvents() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('creator_id', user.id)
                    .order('event_date', { ascending: false });
                
                if (!error && data) {
                    setMyEvents(data);
                }
            } catch (e) {
                console.error('Errore caricamento eventi:', e);
            } finally {
                setLoading(false);
            }
        }
        loadMyEvents();
    }, [supabase, user.id]);

    const formatEventDate = (date) => {
        return new Date(date).toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getEventStatus = (date) => {
        const eventDate = new Date(date);
        const now = new Date();
        return eventDate > now ? 'futuro' : 'passato';
    };

    return (
        <div className="my-events-section">
            <div className="section-header">
                <h3 className="section-title">
                    <i className="fas fa-calendar-check section-icon"></i>
                    I miei eventi creati
                </h3>
            </div>
            
            {loading ? (
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span> Caricamento eventi...</span>
                </div>
            ) : myEvents.length === 0 ? (
                <div className="empty-state">
                    <i className="fas fa-calendar-times empty-icon"></i>
                    <h4>Nessun evento creato</h4>
                    <p>Non hai ancora creato nessun evento. Inizia ora!</p>
               </div>
           ) : (
               <div className="my-events-list">
                   {myEvents.map((event) => (
                       <div key={event.id} className="my-event-item">
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
                                       {getEventStatus(event.event_date) === 'futuro' ? 'Futuro' : 'Passato'}
                                   </span>
                               </div>
                           </div>
                           <div className="event-actions">
                               <button className="btn-outline btn-sm">
                                   <i className="fas fa-eye"></i>
                                   Dettagli
                               </button>
                           </div>
                       </div>
                   ))}
               </div>
           )}
       </div>
   );
}

/* 🔹 EVENT FEED - Feed eventi con raccomandazioni */
function EventFeed({ supabase, user }) {
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

   useEffect(() => {
       async function loadData() {
           setLoading(true);
           setError(null);
           try {
               const { data: eventsData, error: eventsError } = await supabase
                   .from('events')
                   .select('*')
                   .order('event_date', { ascending: true });
                   
               if (eventsError) throw new Error(eventsError.message);
               const eventsList = eventsData || [];
               setEvents(eventsList);
               setFilteredEvents(eventsList);

               const { data: favData } = await supabase
                   .from('event_favorites')
                   .select('event_id')
                   .eq('user_id', user.id);
               setFavoriteIds(favData ? favData.map((f) => f.event_id) : []);

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
                   .slice(0, 3);
               setTrendingEvents(sorted);
           } catch (err) {
               setError(err.message);
           } finally {
               setLoading(false);
           }
       }
       loadData();
   }, [supabase, user.id]);

   useEffect(() => {
       async function computeRecommended() {
           try {
               const { data: profile } = await supabase
                   .from('profiles')
                   .select('interests')
                   .eq('id', user.id)
                   .single();
               const userInterests = profile?.interests || [];

               const counts = {};
               const { data: participantsData } = await supabase
                   .from('event_participants')
                   .select('event_id');
               (participantsData || []).forEach((p) => {
                   counts[p.event_id] = (counts[p.event_id] || 0) + 1;
               });

               const recommended = events
                   .filter((evt) => userInterests.includes(evt.category))
                   .map((evt) => ({ ...evt, participantCount: counts[evt.id] || 0 }))
                   .sort((a, b) => b.participantCount - a.participantCount)
                   .slice(0, 3);
               setRecommendedEvents(recommended);
           } catch (err) {
               console.error('Errore raccomandazioni:', err);
           }
       }
       if (events.length > 0) computeRecommended();
   }, [supabase, events, user.id]);

   useEffect(() => {
       let result = events;
       if (search) {
           const q = search.toLowerCase();
           result = result.filter((e) =>
               e.title.toLowerCase().includes(q) ||
               e.description.toLowerCase().includes(q) ||
               e.location.toLowerCase().includes(q)
           );
       }
       if (selectedCategories.length > 0) {
           result = result.filter((e) => selectedCategories.includes(e.category));
       }
       setFilteredEvents(result);
   }, [search, selectedCategories, events]);

   function handleViewDetails(event) {
       setViewEvent(event);
   }

   async function handleToggleFavorite(event) {
       const isFav = favoriteIds.includes(event.id);
       if (isFav) {
           const { error } = await supabase
               .from('event_favorites')
               .delete()
               .eq('event_id', event.id)
               .eq('user_id', user.id);
           if (!error) setFavoriteIds(favoriteIds.filter((id) => id !== event.id));
       } else {
           const { error } = await supabase
               .from('event_favorites')
               .insert({ event_id: event.id, user_id: user.id });
           if (!error) setFavoriteIds([...favoriteIds, event.id]);
       }
   }

   return (
       <div className="feed-wrapper">
           <div className="feed-header">
               <h1 className="feed-title">Scopri Eventi</h1>
               <p className="feed-subtitle">Trova eventi interessanti nella tua zona</p>
           </div>

           {/* Raccomandazioni personalizzate */}
           {recommendedEvents && recommendedEvents.length > 0 && (
               <div className="recommended-section">
                   <div className="section-header">
                       <h3 className="section-title">
                           <i className="fas fa-heart section-icon"></i>
                           Suggeriti per te
                       </h3>
                   </div>
                   <div className="horizontal-scroll">
                       {recommendedEvents.map((evt) => (
                           <div 
                               key={evt.id} 
                               className="recommendation-card" 
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
           {trendingEvents && trendingEvents.length > 0 && (
               <div className="trending-section">
                   <div className="section-header">
                       <h3 className="section-title">
                           <i className="fas fa-fire section-icon"></i>
                           Eventi di tendenza
                       </h3>
                   </div>
                   <div className="horizontal-scroll">
                       {trendingEvents.map((evt) => (
                           <div 
                               key={evt.id} 
                               className="trend-card" 
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

           {/* Ricerca e filtri */}
           <div className="search-filter-section">
               <div className="search-bar">
                   <i className="fas fa-search search-icon"></i>
                   <input
                       type="text"
                       className="search-input"
                       placeholder="Cerca eventi per titolo, descrizione o luogo..."
                       value={search}
                       onChange={(e) => setSearch(e.target.value)}
                   />
               </div>
               
               <div className="filter-categories">
                   {AVAILABLE_CATEGORIES.map((cat) => (
                       <label 
                           key={cat} 
                           className={`category-chip ${selectedCategories.includes(cat) ? 'selected' : ''}`}
                       >
                           <input
                               type="checkbox"
                               value={cat}
                               checked={selectedCategories.includes(cat)}
                               onChange={(e) => {
                                   if (e.target.checked) {
                                       setSelectedCategories([...selectedCategories, cat]);
                                   } else {
                                       setSelectedCategories(selectedCategories.filter((c) => c !== cat));
                                   }
                               }}
                               style={{ display: 'none' }}
                           />
                           {cat}
                       </label>
                   ))}
               </div>
           </div>

           {/* Lista eventi */}
           {loading && (
               <div className="text-center">
                   <i className="fas fa-spinner fa-spin"></i>
                   <span> Caricamento eventi...</span>
               </div>
           )}
           
           {error && (
               <div className="error-message">
                   <i className="fas fa-exclamation-circle"></i> {error}
               </div>
           )}
           
           {!loading && filteredEvents.length === 0 && (
               <div className="text-center">
                   <i className="fas fa-calendar-times" style={{ fontSize: '3rem', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-md)' }}></i>
                   <p>Nessun evento trovato.</p>
               </div>
           )}
           
           <div className="event-list">
               {filteredEvents.map((event) => (
                   <EventCard
                       key={event.id}
                       event={event}
                       onJoin={handleViewDetails}
                       isFavorite={favoriteIds.includes(event.id)}
                       onToggleFavorite={handleToggleFavorite}
                   />
               ))}
           </div>

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
}

/* 🔹 EVENT CHAT - Chat di gruppo per eventi */
function EventChat({ supabase, eventId, user, isParticipant }) {
   const [messages, setMessages] = useState([]);
   const [newMessage, setNewMessage] = useState('');
   const [loading, setLoading] = useState(true);
   const [sending, setSending] = useState(false);

   useEffect(() => {
       if (!isParticipant) return;
       
       async function loadMessages() {
           setLoading(true);
           try {
               const { data, error } = await supabase
                   .from('event_chats')
                   .select(`
                       id, 
                       content, 
                       created_at,
                       profiles!event_chats_user_id_fkey(username)
                   `)
                   .eq('event_id', eventId)
                   .order('created_at', { ascending: true });
               
               if (!error && data) {
                   setMessages(data);
               }
           } catch (e) {
               console.error('Errore caricamento chat:', e);
           } finally {
               setLoading(false);
           }
       }
       
       loadMessages();
       
       // Realtime subscription
       const channel = supabase.channel('realtime:event_chats')
           .on('postgres_changes', { 
               event: 'INSERT', 
               schema: 'public', 
               table: 'event_chats', 
               filter: `event_id=eq.${eventId}` 
           }, (payload) => {
               setMessages((prev) => [...prev, payload.new]);
           })
           .subscribe();
           
       return () => {
           supabase.removeChannel(channel);
       };
   }, [supabase, eventId, isParticipant]);

   async function handleSend(e) {
       e.preventDefault();
       if (!newMessage.trim() || !isParticipant) return;
       
       setSending(true);
       try {
           await supabase
               .from('event_chats')
               .insert({ 
                   event_id: eventId, 
                   user_id: user.id, 
                   content: newMessage.trim() 
               });
           setNewMessage('');
       } catch (e) {
           console.error('Errore invio messaggio:', e);
       } finally {
           setSending(false);
       }
   }

   if (!isParticipant) {
       return (
           <div className="chat-section">
               <div className="chat-locked">
                   <i className="fas fa-lock"></i>
                   <p>Partecipa all'evento per accedere alla chat di gruppo</p>
               </div>
           </div>
       );
   }

   return (
       <div className="chat-section">
           <h4 className="section-title-small">
               <i className="fas fa-comments"></i>
               Chat evento
           </h4>
           
           {loading && (
               <div className="text-center">
                   <i className="fas fa-spinner fa-spin"></i>
                   <span> Caricamento chat...</span>
               </div>
           )}
           
           <div className="chat-list">
               {messages.length === 0 && !loading && (
                   <div className="text-center" style={{ color: 'var(--color-text-muted)' }}>
                       <i className="fas fa-comment-slash"></i>
                       <p>Nessun messaggio ancora. Inizia la conversazione!</p>
                   </div>
               )}
               {messages.map((msg) => (
                   <div key={msg.id} className="chat-item">
                       <div className="message-header">
                           <span className="message-author">
                               {msg.profiles?.username || 'Utente'}
                           </span>
                           <span className="message-time">
                               {new Date(msg.created_at).toLocaleString('it-IT')}
                           </span>
                       </div>
                       <p className="message-content">{msg.content}</p>
                   </div>
               ))}
           </div>
           
           <form onSubmit={handleSend} className="chat-form">
               <input
                   type="text"
                   className="form-input"
                   value={newMessage}
                   onChange={(e) => setNewMessage(e.target.value)}
                   placeholder="Scrivi un messaggio..."
                   disabled={sending}
                   required
               />
               <button type="submit" className="btn-secondary" disabled={sending || !newMessage.trim()}>
                   {sending ? (
                       <i className="fas fa-spinner fa-spin"></i>
                   ) : (
                       <i className="fas fa-paper-plane"></i>
                   )}
               </button>
           </form>
       </div>
   );
}

/* 🔹 EVENT DETAIL MODAL - Modale con chat integrata */
function EventDetailModal({ supabase, event, onClose, user }) {
   const [participants, setParticipants] = useState([]);
   const [isJoined, setIsJoined] = useState(false);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [comments, setComments] = useState([]);
   const [newComment, setNewComment] = useState('');
   const [posting, setPosting] = useState(false);

   useEffect(() => {
       async function loadParticipants() {
           setLoading(true);
           setError(null);
           const { data, error } = await supabase
               .from('event_participants')
               .select('user_id')
               .eq('event_id', event.id);
           if (error) {
               setError(error.message);
           } else {
               setParticipants(data || []);
               setIsJoined((data || []).some((p) => p.user_id === user.id));
           }
           setLoading(false);
       }
       loadParticipants();
   }, [supabase, event.id, user.id]);

   useEffect(() => {
       fetchComments();
   }, [event.id]);

   async function fetchComments() {
       const { data, error } = await supabase
           .from('event_comments')
           .select(`
               id, 
               content, 
               created_at,
               profiles!event_comments_user_id_fkey(username)
           `)
           .eq('event_id', event.id)
           .order('created_at', { ascending: true });
       if (!error && data) setComments(data);
   }

   async function handleSubmitComment(e) {
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
               fetchComments();
           }
       } catch (err) {
           console.error('Errore invio commento:', err);
       } finally {
           setPosting(false);
       }
   }

   async function handleToggleJoin() {
       if (isJoined) {
           const { error } = await supabase
               .from('event_participants')
               .delete()
               .eq('event_id', event.id)
               .eq('user_id', user.id);
           if (!error) {
               setParticipants(participants.filter((p) => p.user_id !== user.id));
               setIsJoined(false);
           }
       } else {
           const { error } = await supabase
               .from('event_participants')
               .insert({ event_id: event.id, user_id: user.id });
           if (!error) {
               setParticipants([...participants, { user_id: user.id }]);
               setIsJoined(true);
           }
       }
   }

   const eventDate = new Date(event.event_date || event.date);

   return (
       <div className="modal-overlay" onClick={onClose}>
           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                           <span>{eventDate.toLocaleString('it-IT')}</span>
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
                           <i className="fas fa-spinner fa-spin"></i>
                           <span> Caricamento partecipanti...</span>
                       </div>
                   )}
                   
                   {error && (
                       <div className="error-message">
                           <i className="fas fa-exclamation-circle"></i> {error}
                       </div>
                   )}
                   
                   <button 
                       className={`btn-primary join-btn ${isJoined ? 'btn-outline' : ''}`} 
                       onClick={handleToggleJoin}
                   >
                       <i className={isJoined ? 'fas fa-user-minus' : 'fas fa-user-plus'}></i>
                       {isJoined ? 'Abbandona evento' : 'Partecipa all\'evento'}
                   </button>
                   
                   {/* Commenti */}
                   <div className="comments-section">
                       <h4 className="section-title-small">
                           <i className="fas fa-comments"></i>
                           Commenti
                       </h4>
                       
                       <div className="comments-list">
                           {comments.length === 0 && (
                               <div className="text-center" style={{ color: 'var(--color-text-muted)' }}>
                                   <i className="fas fa-comment-slash"></i>
                                   <p>Nessun commento ancora.</p>
                               </div>
                           )}
                           {comments.map((c) => (
                               <div key={c.id} className="comment-item">
                                   <div className="comment-header">
                                       <span className="comment-author">
                                           {c.profiles?.username || 'Utente'}
                                       </span>
                                       <span className="comment-time">
                                           {new Date(c.created_at).toLocaleString('it-IT')}
                                       </span>
                                   </div>
                                   <p className="comment-content">{c.content}</p>
                               </div>
                           ))}
                       </div>
                       
                       <form onSubmit={handleSubmitComment} className="comment-form">
                           <input
                               type="text"
                               className="form-input"
                               value={newComment}
                               onChange={(e) => setNewComment(e.target.value)}
                               placeholder="Scrivi un commento..."
                               required
                           />
                           <button type="submit" className="btn-secondary" disabled={posting}>
                               {posting ? (
                                   <i className="fas fa-spinner fa-spin"></i>
                               ) : (
                                   <i className="fas fa-paper-plane"></i>
                               )}
                           </button>
                       </form>
                   </div>
                   
                   {/* Chat di gruppo - solo per partecipanti */}
                   <EventChat 
                       supabase={supabase} 
                       eventId={event.id} 
                       user={user}
                       isParticipant={isJoined}
                   />
               </div>
           </div>
       </div>
   );
}

/* 🔹 CREATE EVENT - Form creazione evento */
function CreateEvent({ supabase, user, onEventCreated }) {
   const [title, setTitle] = useState('');
   const [description, setDescription] = useState('');
   const [location, setLocation] = useState('');
   const [date, setDate] = useState('');
   const [category, setCategory] = useState('');
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState(null);
   const [success, setSuccess] = useState(false);

   async function handleCreate(e) {
       e.preventDefault();
       setSubmitting(true);
       setError(null);
       setSuccess(false);
       
       try {
           const { error } = await supabase.from('events').insert({
               title,
               description,
               location,
               event_date: date,
               category,
               creator_id: user.id
           });
           
           if (error) {
               setError(error.message);
           } else {
               setTitle('');
               setDescription('');
               setLocation('');
               setDate('');
               setCategory('');
               setSuccess(true);
               
               if (onEventCreated) {
                   setTimeout(() => onEventCreated(), 1500);
               }
           }
       } catch (err) {
           setError(err.message);
       } finally {
           setSubmitting(false);
       }
   }

   return (
       <div className="create-wrapper">
           <div className="create-header">
               <h1 className="create-title">Crea nuovo evento</h1>
               <p className="create-subtitle">Condividi un'esperienza fantastica con la community</p>
           </div>
           
           <form onSubmit={handleCreate} className="create-form">
               <div className="form-row">
                   <div className="form-group">
                       <label className="form-label">
                           <i className="fas fa-calendar"></i>
                           Titolo evento
                       </label>
                       <input 
                           type="text" 
                           className="form-input"
                           value={title} 
                           onChange={(e) => setTitle(e.target.value)} 
                           required 
                           placeholder="Inserisci un titolo accattivante" 
                       />
                   </div>
                   
                   <div className="form-group">
                       <label className="form-label">
                           <i className="fas fa-tag"></i>
                           Categoria
                       </label>
                       <select 
                           className="form-input form-select"
                           value={category} 
                           onChange={(e) => setCategory(e.target.value)} 
                           required
                       >
                           <option value="" disabled>Seleziona categoria</option>
                           {AVAILABLE_CATEGORIES.map((cat) => (
                               <option key={cat} value={cat}>{cat}</option>
                           ))}
                       </select>
                   </div>
               </div>
               
               <div className="form-group full-width">
                   <label className="form-label">
                       <i className="fas fa-align-left"></i>
                       Descrizione
                   </label>
                   <textarea 
                       className="form-input form-textarea"
                       value={description} 
                       onChange={(e) => setDescription(e.target.value)} 
                       required 
                       placeholder="Descrivi il tuo evento in dettaglio..."
                   />
               </div>
               
               <div className="form-row">
                   <div className="form-group">
                       <label className="form-label">
                           <i className="fas fa-map-marker-alt"></i>
                           Luogo
                       </label>
                       <input 
                           type="text" 
                           className="form-input"
                           value={location} 
                           onChange={(e) => setLocation(e.target.value)} 
                           required 
                           placeholder="Inserisci una location" 
                       />
                   </div>
                   
                   <div className="form-group">
                       <label className="form-label">
                           <i className="fas fa-clock"></i>
                           Data e ora
                       </label>
                       <input 
                           type="datetime-local" 
                           className="form-input"
                           value={date} 
                           onChange={(e) => setDate(e.target.value)} 
                           required 
                       />
                   </div>
               </div>
               
               {error && (
                   <div className="error-message">
                       <i className="fas fa-exclamation-circle"></i> {error}
                   </div>
               )}
               
               {success && (
                   <div className="success-message">
                       <i className="fas fa-check-circle"></i> Evento creato con successo! Reindirizzamento in corso...
                   </div>
               )}
               
               <button type="submit" className="btn-primary" disabled={submitting}>
                   {submitting ? (
                       <>
                           <i className="fas fa-spinner fa-spin"></i>
                           Salvataggio...
                       </>
                   ) : (
                       <>
                           <i className="fas fa-plus-circle"></i>
                           Crea evento
                       </>
                   )}
               </button>
           </form>
       </div>
   );
}

/* 🔹 PROFILE PAGE - Pagina profilo con eventi creati */
function ProfilePage({ supabase, user, theme, onToggleTheme }) {
   const [fullName, setFullName] = useState('');
   const [selectedInterests, setSelectedInterests] = useState([]);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState(null);
   const [success, setSuccess] = useState(false);

   useEffect(() => {
       async function loadProfile() {
           setLoading(true);
           const { data, error } = await supabase
               .from('profiles')
               .select('username, interests')
               .eq('id', user.id)
               .single();
           if (error) {
               console.log('Profilo non trovato, creo uno nuovo');
           } else {
               setFullName(data?.username || '');
               setSelectedInterests(data?.interests || []);
           }
           setLoading(false);
       }
       loadProfile();
   }, [supabase, user.id]);

   async function handleSave(e) {
       e.preventDefault();
       setSaving(true);
       setError(null);
       setSuccess(false);
       
       const { error } = await supabase
           .from('profiles')
           .upsert({ 
               id: user.id,
               username: fullName, 
               interests: selectedInterests 
           }, { onConflict: 'id' });
           
       if (error) {
           setError(error.message);
       } else {
           setSuccess(true);
           setTimeout(() => setSuccess(false), 3000);
       }
       setSaving(false);
   }

   const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase();

   return (
       <div className="profile-wrapper">
           <div className="profile-header">
               <div className="profile-avatar">
                   {initials}
               </div>
               <h1 className="profile-name">{fullName || 'Utente'}</h1>
               <p className="profile-email">{user.email}</p>
           </div>
           
           {loading ? (
               <div className="profile-section">
                   <div className="text-center">
                       <i className="fas fa-spinner fa-spin"></i>
                       <span> Caricamento profilo...</span>
                   </div>
               </div>
           ) : (
               <>
                   <form onSubmit={handleSave} className="profile-form">
                       <div className="form-group">
                           <label className="form-label">
                               <i className="fas fa-user"></i>
                               Nome completo
                           </label>
                           <input 
                               type="text" 
                               className="form-input"
                               value={fullName} 
                               onChange={(e) => setFullName(e.target.value)} 
                               required 
                               placeholder="Il tuo nome completo"
                           />
                       </div>
                       
                       <div className="form-group">
                           <label className="form-label">
                               <i className="fas fa-heart"></i>
                               Interessi
                           </label>
                           <div className="interests-grid">
                               {AVAILABLE_CATEGORIES.map((cat) => (
                                   <label 
                                       key={cat} 
                                       className={`interest-chip ${selectedInterests.includes(cat) ? 'selected' : ''}`}
                                   >
                                       <input
                                           type="checkbox"
                                           value={cat}
                                           checked={selectedInterests.includes(cat)}
                                           onChange={(e) => {
                                               if (e.target.checked) {
                                                   setSelectedInterests([...selectedInterests, cat]);
                                               } else {
                                                   setSelectedInterests(selectedInterests.filter((i) => i !== cat));
                                               }
                                           }}
                                       />
                                       <i className="fas fa-check"></i>
                                       <span>{cat}</span>
                                   </label>
                               ))}
                           </div>
                       </div>
                       
                       {error && (
                           <div className="error-message">
                               <i className="fas fa-exclamation-circle"></i> {error}
                           </div>
                       )}
                       
                       {success && (
                           <div className="success-message">
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
                   <MyEventsList supabase={supabase} user={user} />

                   {/* Gamification con conteggi corretti */}
                   <Gamification supabase={supabase} user={user} />
                   
                   {/* Impostazioni tema */}
                   <div className="profile-section">
                       <div className="section-header">
                           <h3 className="section-title">
                               <i className="fas fa-palette section-icon"></i>
                               Impostazioni
                           </h3>
                       </div>
                       
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                           <div>
                               <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>
                                   Tema attuale: {theme === 'light' ? 'Chiaro' : 'Scuro'}
                               </p>
                               <small style={{ color: 'var(--color-text-light)' }}>
                                   Cambia l'aspetto dell'interfaccia
                               </small>
                           </div>
                           <button className="btn-secondary" onClick={onToggleTheme}>
                               <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
                               Cambia tema
                           </button>
                       </div>
                   </div>
               </>
           )}
       </div>
   );
}
