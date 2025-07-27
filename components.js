/*
 * file: components.js
 * Contiene le componenti React utilizzate da SocialSpot. Ogni componente riceve il client Supabase via props
 * quando necessario, in modo da poter eseguire query e sottoscrizioni senza dipendenze globali nascoste.
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
    'All’aperto'
];

/* Navbar con pulsanti di navigazione, logout e toggle tema */
function Navbar({ user, currentPage, setPage, onSignOut, onToggleTheme, theme }) {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <span className="navbar-logo">SocialSpot</span>
                {user && (
                    <>
                        <button className={`nav-link ${currentPage === 'feed' ? 'active' : ''}`} onClick={() => setPage('feed')}>
                            Eventi
                        </button>
                        <button className={`nav-link ${currentPage === 'create' ? 'active' : ''}`} onClick={() => setPage('create')}>
                            Crea evento
                        </button>
                        <button className={`nav-link ${currentPage === 'profile' ? 'active' : ''}`} onClick={() => setPage('profile')}>
                            Profilo
                        </button>
                    </>
                )}
            </div>
            <div className="navbar-right">
                {user && (
                    <>
                        {/* Toggle tema dark/light */}
                        <button className="nav-link" onClick={onToggleTheme} title="Cambia tema">
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                        <button className="nav-link" onClick={onSignOut}>Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
}

/* Form di autenticazione (login/registrazione) */
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
                result = await supabase.auth.signUp({ email, password });
                if (result.data?.user) {
                    // Salva il profilo dell'utente alla registrazione
                    await supabase.from('profiles').insert({ user_id: result.data.user.id, full_name: fullName, interests });
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
            <h2>{isSignIn ? 'Accedi' : 'Registrati'}</h2>
            <form onSubmit={handleAuth} className="auth-form">
                <label>
                    Email
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Inserisci email" />
                </label>
                <label>
                    Password
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Inserisci password" />
                </label>
                {!isSignIn && (
                    <>
                        <label>
                            Nome completo
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Il tuo nome" required />
                        </label>
                        <label>
                            Interessi (seleziona almeno uno)
                            <div className="interests-select">
                                {AVAILABLE_CATEGORIES.map((cat) => (
                                    <label key={cat} className="interest-option">
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
                                        {cat}
                                    </label>
                                ))}
                            </div>
                        </label>
                    </>
                )}
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="primary-btn" disabled={loading}>
                    {loading ? 'Attendere…' : isSignIn ? 'Accedi' : 'Registrati'}
                </button>
            </form>
            <p className="switch-auth">
                {isSignIn ? 'Non hai un account?' : 'Hai già un account?'}{' '}
                <button type="button" className="text-btn" onClick={() => setIsSignIn(!isSignIn)}>
                    {isSignIn ? 'Registrati' : 'Accedi'}
                </button>
            </p>
        </div>
    );
}

/* Card evento con stella per preferiti */
function EventCard({ event, onJoin, isFavorite, onToggleFavorite }) {
    const eventDate = new Date(event.date);
    return (
        <div className="event-card">
            <h3 className="event-title">{event.title}</h3>
            <p className="event-category">Categoria: {event.category}</p>
            <p className="event-date">{eventDate.toLocaleString('it-IT')}</p>
            <p className="event-location">Luogo: {event.location}</p>
            <p className="event-description">{event.description}</p>
            <div className="event-card-actions">
                <button className="secondary-btn" onClick={() => onJoin(event)}>Dettagli</button>
                <button
                    className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
                    onClick={() => onToggleFavorite(event)}
                    title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                >
                    ★
                </button>
            </div>
        </div>
    );
}

/* Sezione classifica e punti utente (Gamification) */
function Gamification({ supabase, user }) {
    const [points, setPoints] = useState(0);
    const [level, setLevel] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function computePoints() {
            setLoading(true);
            try {
                // Calcola punti: 5 per ogni evento creato, 2 per ogni partecipazione
                const { data: created } = await supabase
                    .from('events')
                    .select('id')
                    .eq('user_id', user.id);
                const { data: joined } = await supabase
                    .from('event_participants')
                    .select('id')
                    .eq('user_id', user.id);
                const createdCount = created ? created.length : 0;
                const joinedCount = joined ? joined.length : 0;
                const pts = createdCount * 5 + joinedCount * 2;
                setPoints(pts);
                setLevel(Math.floor(pts / 100) + 1);
            } catch (e) {
                // In caso di errore lascia a 0
            } finally {
                setLoading(false);
            }
        }
        computePoints();
    }, [supabase, user.id]);

    return (
        <div className="gamification-wrapper">
            <h3>Gamification</h3>
            {loading ? (
                <p>Calcolo dei punti…</p>
            ) : (
                <>
                    <p>Punti totali: {points}</p>
                    <p>Livello: {level}</p>
                    <progress value={points % 100} max="100" style={{ width: '100%' }}></progress>
                </>
            )}
        </div>
    );
}

/* Feed eventi con ricerca, filtri, trending, consigliati e preferiti */
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

    // Carica eventi, preferiti e calcola trend
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError(null);
            try {
                // Tutti gli eventi
                const { data: eventsData, error: eventsError } = await supabase
                    .from('events')
                    .select('*')
                    .order('date', { ascending: true });
                if (eventsError) throw new Error(eventsError.message);
                const eventsList = eventsData || [];
                setEvents(eventsList);
                setFilteredEvents(eventsList);
                // Preferiti dell'utente
                const { data: favData } = await supabase
                    .from('event_favorites')
                    .select('event_id')
                    .eq('user_id', user.id);
                setFavoriteIds(favData ? favData.map((f) => f.event_id) : []);
                // Partecipazioni per calcolare trend
                const { data: participantsData } = await supabase
                    .from('event_participants')
                    .select('event_id, user_id');
                // Conteggio partecipanti per evento
                const counts = {};
                (participantsData || []).forEach((p) => {
                    counts[p.event_id] = (counts[p.event_id] || 0) + 1;
                });
                // Top 3 eventi per partecipanti
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

    // Raccomandazioni: in base a interessi dell'utente e popolarità degli eventi (top trending)  
    useEffect(() => {
        async function computeRecommended() {
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('interests')
                    .eq('user_id', user.id)
                    .single();
                const userInterests = profile?.interests || [];
                // Filtra eventi con categoria negli interessi e ordina per numero partecipanti decrescente
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
                // ignora
            }
        }
        if (events.length > 0) computeRecommended();
    }, [supabase, events, user.id]);

    // Filtra quando ricerca o categorie cambiano
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

    // Visualizza dettagli evento
    function handleViewDetails(event) {
        setViewEvent(event);
    }

    // Gestisce toggle preferiti
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
            <h2>Eventi in programma</h2>
            {/* Raccomandazioni personalizzate */}
            {recommendedEvents && recommendedEvents.length > 0 && (
                <div className="recommended-section">
                    <h3>Suggeriti per te</h3>
                    <div className="recommended-list">
                        {recommendedEvents.map((evt) => (
                            <div key={evt.id} className="recommended-item" onClick={() => handleViewDetails(evt)}>
                                <h4 className="recommended-title">{evt.title}</h4>
                                <p className="recommended-category">{evt.category}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Trending events */}
            {trendingEvents && trendingEvents.length > 0 && (
                <div className="trending-section">
                    <h3>Eventi di tendenza</h3>
                    <div className="trending-list">
                        {trendingEvents.map((evt) => (
                            <div key={evt.id} className="trending-item" onClick={() => handleViewDetails(evt)}>
                                <h4 className="trending-title">{evt.title}</h4>
                                <p className="trending-participants">{evt.participantCount} partecipanti</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Barra ricerca e filtri */}
            <div className="search-filter-bar">
                <input
                    type="text"
                    placeholder="Cerca per titolo, descrizione o luogo"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
                <div className="categories-filter">
                    {AVAILABLE_CATEGORIES.map((cat) => (
                        <label key={cat} className="category-filter-option">
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
                            />
                            {cat}
                        </label>
                    ))}
                </div>
            </div>
            {loading && <p>Caricamento eventi…</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && filteredEvents.length === 0 && <p>Nessun evento trovato.</p>}
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

/* Sezione di chat in tempo reale per gli eventi */
function ChatSection({ supabase, eventId, user }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Preleva messaggi esistenti
        async function loadMessages() {
            setLoading(true);
            const { data, error } = await supabase
                .from('event_chats')
                .select('id, user_id, content, created_at')
                .eq('event_id', eventId)
                .order('created_at', { ascending: true });
            if (!error && data) setMessages(data);
            setLoading(false);
        }
        loadMessages();
        // Sottoscrizione realtime per nuovi messaggi sull'evento
        const channel = supabase.channel('realtime:event_chats')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'event_chats', filter: `event_id=eq.${eventId}` }, (payload) => {
                setMessages((prev) => [...prev, payload.new]);
            })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, eventId]);

    async function handleSend(e) {
        e.preventDefault();
        if (!newMessage.trim()) return;
        await supabase
            .from('event_chats')
            .insert({ event_id: eventId, user_id: user.id, content: newMessage.trim() });
        setNewMessage('');
    }

    return (
        <div className="chat-section">
            <h4>Chat evento</h4>
            {loading && <p>Caricamento chat…</p>}
            <div className="chat-list">
                {messages.length === 0 && !loading && <p>Nessun messaggio ancora.</p>}
                {messages.map((msg) => (
                    <div key={msg.id} className="chat-item">
                        <p className="chat-content">{msg.content}</p>
                        <span className="chat-time">{new Date(msg.created_at).toLocaleString('it-IT')}</span>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSend} className="chat-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Scrivi un messaggio…"
                    required
                />
                <button type="submit" className="secondary-btn">Invia</button>
            </form>
        </div>
    );
}

/* Modale dettagli evento con partecipazione, mappa, commenti e chat */
function EventDetailModal({ supabase, event, onClose, user }) {
    const [participants, setParticipants] = useState([]);
    const [isJoined, setIsJoined] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [posting, setPosting] = useState(false);

    // Carica partecipanti
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

    // Carica commenti
    useEffect(() => {
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event.id]);

    async function fetchComments() {
        const { data, error } = await supabase
            .from('event_comments')
            .select('id, content, created_at, user_id')
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
                .insert({ event_id: event.id, user_id: user.id, content: newComment.trim() });
            if (!error) {
                setNewComment('');
                fetchComments();
            }
        } catch (err) {
            // ignora
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

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h3 className="modal-title">{event.title}</h3>
                <p className="event-category">Categoria: {event.category}</p>
                <p>Data: {new Date(event.date).toLocaleString('it-IT')}</p>
                <p>Luogo: {event.location}</p>
                <p>{event.description}</p>
                <p>Partecipanti: {participants.length}</p>
                {loading && <p>Caricamento partecipanti…</p>}
                {error && <p className="error-message">{error}</p>}
                <button className="primary-btn" onClick={handleToggleJoin}>
                    {isJoined ? 'Abbandona' : 'Partecipa'}
                </button>
                {/* Mappa statica tramite Google Maps Embed API */}
                <div className="map-container">
                    <iframe
                        title="map"
                        width="100%"
                        height="200"
                        frameBorder="0"
                        style={{ border: 0, marginTop: '1rem' }}
                        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_KEY&q=${encodeURIComponent(event.location)}`}
                        allowFullScreen
                    ></iframe>
                </div>
                {/* Commenti */}
                <div className="comments-section">
                    <h4>Commenti</h4>
                    <div className="comment-list">
                        {comments.length === 0 && <p>Nessun commento ancora.</p>}
                        {comments.map((c) => (
                            <div key={c.id} className="comment-item">
                                <p className="comment-content">{c.content}</p>
                                <span className="comment-time">{new Date(c.created_at).toLocaleString('it-IT')}</span>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSubmitComment} className="comment-form">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Scrivi un commento..."
                            required
                        />
                        <button type="submit" className="secondary-btn" disabled={posting}>
                            {posting ? 'Invio…' : 'Invia'}
                        </button>
                    </form>
                </div>
                {/* Chat in tempo reale */}
                <ChatSection supabase={supabase} eventId={event.id} user={user} />
            </div>
        </div>
    );
}

/* Form creazione evento */
function CreateEvent({ supabase, user, onEventCreated }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [category, setCategory] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Abilita autocomplete su campo location usando Google Places
        if (window.google && window.google.maps && window.google.maps.places) {
            const input = document.getElementById('location-input');
            if (input) {
                const autocomplete = new window.google.maps.places.Autocomplete(input);
                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place && place.formatted_address) {
                        setLocation(place.formatted_address);
                    }
                });
            }
        }
    }, []);

    async function handleCreate(e) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const { error } = await supabase.from('events').insert({
                title,
                description,
                location,
                date,
                category,
                user_id: user.id
            });
            if (error) setError(error.message);
            else {
                setTitle('');
                setDescription('');
                setLocation('');
                setDate('');
                setCategory('');
                if (onEventCreated) onEventCreated();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="create-wrapper">
            <h2>Crea nuovo evento</h2>
            <form onSubmit={handleCreate} className="create-form">
                <label>
                    Titolo evento
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Titolo" />
                </label>
                <label>
                    Descrizione
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Descrizione dell’evento" />
                </label>
                <label>
                    Luogo
                    <input id="location-input" type="text" value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="Inserisci o seleziona una location" />
                </label>
                <label>
                    Data e ora
                    <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
                </label>
                <label>
                    Categoria
                    <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                        <option value="" disabled>Seleziona categoria</option>
                        {AVAILABLE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </label>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="primary-btn" disabled={submitting}>
                    {submitting ? 'Salvataggio…' : 'Crea evento'}
                </button>
            </form>
        </div>
    );
}

/* Pagina profilo con modifiche profilo, interessi e gamification */
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
                .select('full_name, interests')
                .eq('user_id', user.id)
                .single();
            if (error) {
                setError(error.message);
            } else {
                setFullName(data?.full_name || '');
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
            .upsert({ user_id: user.id, full_name: fullName, interests: selectedInterests }, { onConflict: 'user_id' });
        if (error) setError(error.message);
        else setSuccess(true);
        setSaving(false);
    }

    return (
        <div className="profile-wrapper">
            <h2>Il tuo profilo</h2>
            {loading ? (
                <p>Caricamento profilo…</p>
            ) : (
                <form onSubmit={handleSave} className="profile-form">
                    <label>
                        Nome completo
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </label>
                    <label>
                        Interessi
                        <div className="interests-select">
                            {AVAILABLE_CATEGORIES.map((cat) => (
                                <label key={cat} className="interest-option">
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
                                    {cat}
                                </label>
                            ))}
                        </div>
                    </label>
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">Profilo aggiornato con successo!</p>}
                    <button type="submit" className="primary-btn" disabled={saving}>
                        {saving ? 'Salvataggio…' : 'Salva'}
                    </button>
                </form>
            )}
            {/* Gamification e toggle tema dentro profilo */}
            <Gamification supabase={supabase} user={user} />
            <div className="theme-toggle">
                <p>Tema attuale: {theme === 'light' ? 'Chiaro' : 'Scuro'}</p>
                <button className="secondary-btn" onClick={onToggleTheme}>
                    Cambia tema
                </button>
            </div>
        </div>
    );
}
