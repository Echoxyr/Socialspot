// =====================================================
// components-addon.js - MODIFICATO CON NUOVE FUNZIONALITÀ
// =====================================================

const { useState, useEffect, useCallback, useRef } = React;

// 🌟 DATI E COSTANTI
const CATEGORIES = [
    'Sport', 'Musica', 'Arte', 'Cultura', 'Tecnologia', 
    'Cibo', 'Viaggi', 'Cinema', 'All\'aperto', 'Business'
];

const AGE_RANGES = [
    { value: '18-25', label: '18-25 anni' },
    { value: '26-35', label: '26-35 anni' },
    { value: '36-50', label: '36-50 anni' },
    { value: '50+', label: '50+ anni' },
    { value: 'tutte', label: 'Tutte le età' }
];

const GENDER_OPTIONS = [
    { value: 'uomo', label: 'Uomo' },
    { value: 'donna', label: 'Donna' },
    { value: 'tutti', label: 'Tutti/Entrambi' }
];

// Lista completa città italiane (parziale - da espandere)
const ITALIAN_CITIES = [
    'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze',
    'Bari', 'Catania', 'Venezia', 'Verona', 'Messina', 'Padova', 'Trieste', 'Taranto',
    'Brescia', 'Prato', 'Parma', 'Modena', 'Reggio Calabria', 'Reggio Emilia', 'Perugia',
    'Livorno', 'Ravenna', 'Cagliari', 'Foggia', 'Rimini', 'Salerno', 'Ferrara', 'Sassari',
    'Latina', 'Giugliano in Campania', 'Monza', 'Siracusa', 'Pescara', 'Bergamo', 'Forlì',
    'Trento', 'Vicenza', 'Terni', 'Bolzano', 'Novara', 'Piacenza', 'Ancona', 'Andria',
    'Arezzo', 'Udine', 'Cesena', 'Lecce', 'Pesaro', 'Barletta', 'Alessandria', 'La Spezia',
    'Pistoia', 'Pisa', 'Lucca', 'Brindisi', 'Como', 'Grosseto', 'Caserta', 'Asti',
    'Varese', 'Ragusa', 'Cremona', 'Pavia', 'Livorno', 'Trapani', 'Savona', 'Massa',
    'Carrara', 'Teramo', 'Imola', 'Siena', 'Treviso', 'Mantova', 'Crotone', 'Viterbo'
];

const ITALIAN_REGIONS = [
    'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna', 'Friuli-Venezia Giulia',
    'Lazio', 'Liguria', 'Lombardia', 'Marche', 'Molise', 'Piemonte', 'Puglia', 'Sardegna',
    'Sicilia', 'Toscana', 'Trentino-Alto Adige', 'Umbria', 'Valle d\'Aosta', 'Veneto'
];

// 🚀 COMPONENT: EventFeed (MODIFICATO)
function EventFeed({ supabase, user }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [participants, setParticipants] = useState({});
    const [myRequests, setMyRequests] = useState([]);

    useEffect(() => {
        loadEvents();
        loadMyRequests();
        
        // Real-time updates
        const eventsChannel = supabase.channel('events_feed')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'events'
            }, loadEvents)
            .subscribe();

        const participantsChannel = supabase.channel('participants_feed')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'event_participants'
            }, () => {
                loadParticipants();
                loadMyRequests();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(eventsChannel);
            supabase.removeChannel(participantsChannel);
        };
    }, []);

    const loadEvents = async () => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select(`
                    *,
                    creator:profiles!events_creator_id_fkey(username, location)
                `)
                .order('created_at', { ascending: false });
            
            if (!error) {
                setEvents(data || []);
                loadParticipants(data);
            }
        } catch (err) {
            console.error('Errore caricamento eventi:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadParticipants = async (eventsList = events) => {
        try {
            const { data } = await supabase
                .from('event_participants')
                .select('event_id, user_id, status');
            
            const counts = {};
            (data || []).forEach(p => {
                if (p.status === 'approved') {
                    counts[p.event_id] = (counts[p.event_id] || 0) + 1;
                }
            });
            
            setParticipants(counts);
        } catch (err) {
            console.error('Errore caricamento partecipanti:', err);
        }
    };

    const loadMyRequests = async () => {
        try {
            const { data } = await supabase
                .from('event_participants')
                .select('event_id, status')
                .eq('user_id', user.id);
            
            setMyRequests(data || []);
        } catch (err) {
            console.error('Errore caricamento richieste:', err);
        }
    };

    const getMyRequestStatus = (eventId) => {
        const request = myRequests.find(r => r.event_id === eventId);
        return request?.status || null;
    };

    const handleRequestParticipation = async (eventId) => {
        try {
            const { error } = await supabase
                .from('event_participants')
                .insert({
                    event_id: eventId,
                    user_id: user.id,
                    status: 'pending'
                });
            
            if (!error) {
                window.addNotification?.({
                    type: 'success',
                    icon: 'fas fa-paper-plane',
                    title: 'Richiesta inviata!',
                    message: 'Il creatore valuterà la tua richiesta'
                });
                loadMyRequests();
            }
        } catch (err) {
            console.error('Errore invio richiesta:', err);
        }
    };

    const handleCancelRequest = async (eventId) => {
        try {
            await supabase
                .from('event_participants')
                .delete()
                .eq('event_id', eventId)
                .eq('user_id', user.id);
            
            window.addNotification?.({
                type: 'info',
                icon: 'fas fa-times-circle',
                title: 'Richiesta annullata',
                message: 'La tua richiesta è stata rimossa'
            });
            loadMyRequests();
        } catch (err) {
            console.error('Errore annullamento richiesta:', err);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <div className="loading-text">Caricamento eventi...</div>
            </div>
        );
    }

    return (
        <div className="feed-wrapper">
            <div className="feed-header">
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '15px',
                    marginBottom: '20px'
                }}>
                    <i className="fas fa-search-location" style={{ 
                        fontSize: '48px',
                        color: '#2563eb',
                        animation: 'float 3s ease-in-out infinite'
                    }}></i>
                </div>
                <h1 className="feed-title">Un nuovo modo di incontrarsi</h1>
                <p className="feed-subtitle">Cerca, trova, partecipa</p>
            </div>
            
            <div className="event-list">
                {events.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-users" style={{ fontSize: '64px', marginBottom: '20px' }}></i>
                        <h3>Nessun evento disponibile</h3>
                        <p>Sii il primo a creare un evento nella tua zona!</p>
                    </div>
                ) : (
                    events.map(event => {
                        const myStatus = getMyRequestStatus(event.id);
                        const isCreator = event.creator_id === user.id;
                        
                        return (
                            <div key={event.id} className="event-card">
                                <div className="event-image">
                                    <i className="fas fa-calendar-alt"></i>
                                    {event.event_status && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '20px',
                                            right: '20px',
                                            background: event.event_status === 'concluso' ? '#10b981' :
                                                       event.event_status === 'in_esecuzione' ? '#f59e0b' : '#6b7280',
                                            color: 'white',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '700'
                                        }}>
                                            {event.event_status === 'da_iniziare' && 'Da iniziare'}
                                            {event.event_status === 'in_esecuzione' && 'In corso'}
                                            {event.event_status === 'concluso' && 'Concluso'}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="event-content">
                                    <div className="event-header">
                                        <div>
                                            <div className="event-category">{event.category}</div>
                                            <h3 className="event-title">{event.title}</h3>
                                        </div>
                                    </div>
                                    
                                    <p className="event-description">{event.description}</p>
                                    
                                    <div className="event-meta">
                                        <div className="event-meta-item">
                                            <i className="fas fa-user"></i>
                                            <span>{event.creator?.username || 'Utente'}</span>
                                        </div>
                                        <div className="event-meta-item">
                                            <i className="fas fa-map-marker-alt"></i>
                                            <span>{event.location}</span>
                                        </div>
                                        <div className="event-meta-item">
                                            <i className="fas fa-calendar"></i>
                                            <span>{new Date(event.event_date).toLocaleString('it-IT')}</span>
                                        </div>
                                        <div className="event-meta-item">
                                            <i className="fas fa-users"></i>
                                            <span>{participants[event.id] || 0} partecipanti</span>
                                        </div>
                                        {event.preferred_age_range && (
                                            <div className="event-meta-item">
                                                <i className="fas fa-birthday-cake"></i>
                                                <span>Età: {AGE_RANGES.find(a => a.value === event.preferred_age_range)?.label || event.preferred_age_range}</span>
                                            </div>
                                        )}
                                        {event.preferred_gender && event.preferred_gender !== 'tutti' && (
                                            <div className="event-meta-item">
                                                <i className="fas fa-venus-mars"></i>
                                                <span>{GENDER_OPTIONS.find(g => g.value === event.preferred_gender)?.label || event.preferred_gender}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="event-actions">
                                        {!isCreator && !myStatus && (
                                            <button 
                                                className="btn-primary"
                                                onClick={() => handleRequestParticipation(event.id)}
                                            >
                                                <i className="fas fa-user-plus"></i>
                                                Richiedi partecipazione
                                            </button>
                                        )}
                                        
                                        {myStatus === 'pending' && (
                                            <>
                                                <div style={{
                                                    padding: '12px',
                                                    background: 'rgba(245, 158, 11, 0.1)',
                                                    borderRadius: '12px',
                                                    color: '#f59e0b',
                                                    fontWeight: '600',
                                                    flex: 1,
                                                    textAlign: 'center'
                                                }}>
                                                    <i className="fas fa-clock"></i> In attesa di approvazione
                                                </div>
                                                <button 
                                                    className="btn-outline"
                                                    onClick={() => handleCancelRequest(event.id)}
                                                >
                                                    Annulla richiesta
                                                </button>
                                            </>
                                        )}
                                        
                                        {myStatus === 'approved' && (
                                            <div style={{
                                                padding: '12px',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                borderRadius: '12px',
                                                color: '#10b981',
                                                fontWeight: '600',
                                                flex: 1,
                                                textAlign: 'center'
                                            }}>
                                                <i className="fas fa-check-circle"></i> Partecipazione confermata
                                            </div>
                                        )}
                                        
                                        {myStatus === 'rejected' && (
                                            <div style={{
                                                padding: '12px',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                borderRadius: '12px',
                                                color: '#ef4444',
                                                fontWeight: '600',
                                                flex: 1,
                                                textAlign: 'center'
                                            }}>
                                                <i className="fas fa-times-circle"></i> Richiesta non accettata
                                            </div>
                                        )}
                                        
                                        <button 
                                            className="btn-outline"
                                            onClick={() => setSelectedEvent(event)}
                                        >
                                            <i className="fas fa-info-circle"></i>
                                            Dettagli
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {selectedEvent && (
                <EventModal 
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    user={user}
                    supabase={supabase}
                    onUpdate={loadEvents}
                />
            )}
        </div>
    );
}

// Continua nella PARTE 2...
// =====================================================
// components-addon.js PARTE 2 - EventModal completo
// =====================================================

// 🔹 COMPONENT: EventModal (NUOVO - gestione completa evento)
function EventModal({ event, onClose, user, supabase, onUpdate }) {
    const [participants, setParticipants] = useState([]);
    const [pending Requests, setPendingRequests] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [myStatus, setMyStatus] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [presenceValidated, setPresenceValidated] = useState(false);
    
    const isCreator = event.creator_id === user.id;

    useEffect(() => {
        loadParticipants();
        loadPendingRequests();
        loadReviews();
        checkMyStatus();
        
        // Real-time updates
        const channel = supabase.channel(`event_${event.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'event_participants',
                filter: `event_id=eq.${event.id}`
            }, () => {
                loadParticipants();
                loadPendingRequests();
                checkMyStatus();
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'event_reviews',
                filter: `event_id=eq.${event.id}`
            }, loadReviews)
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const loadParticipants = async () => {
        const { data } = await supabase
            .from('event_participants')
            .select(`
                *,
                profiles!event_participants_user_id_fkey(username, location)
            `)
            .eq('event_id', event.id)
            .eq('status', 'approved');
        
        setParticipants(data || []);
    };

    const loadPendingRequests = async () => {
        if (!isCreator) return;
        
        const { data } = await supabase
            .from('event_participants')
            .select(`
                *,
                profiles!event_participants_user_id_fkey(username, location, age, city)
            `)
            .eq('event_id', event.id)
            .eq('status', 'pending');
        
        setPendingRequests(data || []);
    };

    const loadReviews = async () => {
        const { data } = await supabase
            .from('event_reviews')
            .select(`
                *,
                profiles!event_reviews_user_id_fkey(username)
            `)
            .eq('event_id', event.id)
            .order('created_at', { ascending: false });
        
        setReviews(data || []);
    };

    const checkMyStatus = async () => {
        const { data } = await supabase
            .from('event_participants')
            .select('status, presence_validated')
            .eq('event_id', event.id)
            .eq('user_id', user.id)
            .single();
        
        if (data) {
            setMyStatus(data.status);
            setPresenceValidated(data.presence_validated);
        }
    };

    const handleApproveRequest = async (participantId) => {
        await supabase
            .from('event_participants')
            .update({ status: 'approved' })
            .eq('id', participantId);
        
        window.addNotification?.({
            type: 'success',
            icon: 'fas fa-check',
            title: 'Richiesta approvata',
            message: 'Il partecipante è stato accettato'
        });
        
        loadPendingRequests();
        loadParticipants();
    };

    const handleRejectRequest = async (participantId) => {
        await supabase
            .from('event_participants')
            .update({ status: 'rejected' })
            .eq('id', participantId);
        
        window.addNotification?.({
            type: 'info',
            icon: 'fas fa-times',
            title: 'Richiesta rifiutata',
            message: 'Il partecipante è stato informato'
        });
        
        loadPendingRequests();
    };

    const handleValidatePresence = async () => {
        await supabase
            .from('event_participants')
            .update({ presence_validated: true })
            .eq('event_id', event.id)
            .eq('user_id', user.id);
        
        window.addNotification?.({
            type: 'success',
            icon: 'fas fa-check-circle',
            title: 'Presenza confermata!',
            message: 'Hai confermato la tua presenza all\'evento'
        });
        
        setPresenceValidated(true);
    };

    const handleUpdateEventStatus = async (newStatus) => {
        await supabase
            .from('events')
            .update({ event_status: newStatus })
            .eq('id', event.id);
        
        window.addNotification?.({
            type: 'success',
            icon: 'fas fa-sync',
            title: 'Stato aggiornato',
            message: `Evento impostato su: ${newStatus}`
        });
        
        if (onUpdate) onUpdate();
        onClose();
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        const { error } = await supabase
            .from('event_reviews')
            .insert({
                event_id: event.id,
                user_id: user.id,
                rating: newReview.rating,
                comment: newReview.comment
            });
        
        if (!error) {
            window.addNotification?.({
                type: 'success',
                icon: 'fas fa-star',
                title: 'Recensione pubblicata!',
                message: 'Grazie per il tuo feedback'
            });
            setShowReviewForm(false);
            setNewReview({ rating: 5, comment: '' });
            loadReviews();
        }
    };

    const canAccessChat = myStatus === 'approved' || isCreator;
    const canReview = event.event_status === 'concluso' && myStatus === 'approved' && presenceValidated;
    const canValidatePresence = event.event_status === 'in_esecuzione' && myStatus === 'approved' && !presenceValidated;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{event.title}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="modal-body">
                    {/* Stato evento e azioni creatore */}
                    {isCreator && (
                        <div style={{
                            padding: '20px',
                            background: 'rgba(37, 99, 235, 0.05)',
                            borderRadius: '15px',
                            marginBottom: '20px'
                        }}>
                            <h4 style={{ marginBottom: '15px', fontWeight: '700' }}>
                                <i className="fas fa-crown"></i> Gestione Evento
                            </h4>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {event.event_status === 'da_iniziare' && (
                                    <button
                                        className="btn-primary"
                                        onClick={() => handleUpdateEventStatus('in_esecuzione')}
                                    >
                                        <i className="fas fa-play"></i> Avvia evento
                                    </button>
                                )}
                                {event.event_status === 'in_esecuzione' && (
                                    <button
                                        className="btn-primary"
                                        onClick={() => handleUpdateEventStatus('concluso')}
                                    >
                                        <i className="fas fa-check"></i> Concludi evento
                                    </button>
                                )}
                                {event.event_status === 'concluso' && (
                                    <div style={{
                                        padding: '15px',
                                        background: '#10b981',
                                        color: 'white',
                                        borderRadius: '10px',
                                        fontWeight: '600'
                                    }}>
                                        <i className="fas fa-flag-checkered"></i> Evento concluso
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Validazione presenza partecipante */}
                    {canValidatePresence && (
                        <div style={{
                            padding: '20px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: '15px',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            <h4 style={{ marginBottom: '10px', color: '#f59e0b' }}>
                                <i className="fas fa-hand-point-up"></i> Conferma la tua presenza
                            </h4>
                            <p style={{ marginBottom: '15px', fontSize: '14px' }}>
                                Sei all'evento? Conferma la tua presenza per sbloccare le recensioni
                            </p>
                            <button className="btn-primary" onClick={handleValidatePresence}>
                                <i className="fas fa-check-circle"></i> Sono presente!
                            </button>
                        </div>
                    )}

                    {presenceValidated && myStatus === 'approved' && (
                        <div style={{
                            padding: '15px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '10px',
                            marginBottom: '20px',
                            color: '#10b981',
                            fontWeight: '600',
                            textAlign: 'center'
                        }}>
                            <i className="fas fa-check-double"></i> Presenza confermata
                        </div>
                    )}

                    {/* Richieste in attesa (solo creatore) */}
                    {isCreator && pendingRequests.length > 0 && (
                        <div style={{
                            padding: '20px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: '15px',
                            marginBottom: '20px'
                        }}>
                            <h4 style={{ marginBottom: '15px', fontWeight: '700' }}>
                                <i className="fas fa-clock"></i> Richieste in attesa ({pendingRequests.length})
                            </h4>
                            {pendingRequests.map(request => (
                                <div key={request.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '15px',
                                    background: 'white',
                                    borderRadius: '10px',
                                    marginBottom: '10px'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                                            {request.profiles?.username || 'Utente'}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                            {request.profiles?.age && `${request.profiles.age} anni`}
                                            {request.profiles?.city && ` • ${request.profiles.city}`}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn-primary"
                                            onClick={() => handleApproveRequest(request.id)}
                                            style={{ padding: '8px 16px', fontSize: '14px' }}
                                        >
                                            <i className="fas fa-check"></i> Approva
                                        </button>
                                        <button
                                            className="btn-outline"
                                            onClick={() => handleRejectRequest(request.id)}
                                            style={{ padding: '8px 16px', fontSize: '14px' }}
                                        >
                                            <i className="fas fa-times"></i> Rifiuta
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Informazioni evento */}
                    <div className="event-category" style={{ marginBottom: '15px' }}>
                        {event.category}
                    </div>
                    
                    <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                        {event.description}
                    </p>
                    
                    <div className="event-meta" style={{ marginBottom: '20px' }}>
                        <div className="event-meta-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{event.location}</span>
                        </div>
                        <div className="event-meta-item">
                            <i className="fas fa-calendar"></i>
                            <span>{new Date(event.event_date).toLocaleString('it-IT')}</span>
                        </div>
                        <div className="event-meta-item">
                            <i className="fas fa-users"></i>
                            <span>{participants.length} partecipanti approvati</span>
                        </div>
                        {event.preferred_age_range && (
                            <div className="event-meta-item">
                                <i className="fas fa-birthday-cake"></i>
                                <span>Età preferita: {AGE_RANGES.find(a => a.value === event.preferred_age_range)?.label}</span>
                            </div>
                        )}
                        {event.preferred_gender && event.preferred_gender !== 'tutti' && (
                            <div className="event-meta-item">
                                <i className="fas fa-venus-mars"></i>
                                <span>{GENDER_OPTIONS.find(g => g.value === event.preferred_gender)?.label}</span>
                            </div>
                        )}
                    </div>

                    {/* Chat evento (solo partecipanti approvati) */}
                    {canAccessChat && (
                        <div style={{ marginTop: '30px' }}>
                            <button
                                className="btn-outline"
                                onClick={() => setShowChat(!showChat)}
                                style={{ marginBottom: '15px', width: '100%' }}
                            >
                                <i className="fas fa-comments"></i>
                                {showChat ? 'Nascondi chat' : 'Apri chat evento'}
                            </button>
                            
                            {showChat && <EventChat eventId={event.id} user={user} supabase={supabase} />}
                        </div>
                    )}

                    {/* Form recensione */}
                    {canReview && !reviews.find(r => r.user_id === user.id) && (
                        <div style={{ marginTop: '30px' }}>
                            {!showReviewForm ? (
                                <button
                                    className="btn-primary"
                                    onClick={() => setShowReviewForm(true)}
                                    style={{ width: '100%' }}
                                >
                                    <i className="fas fa-star"></i> Lascia una recensione
                                </button>
                            ) : (
                                <form onSubmit={handleSubmitReview} style={{
                                    padding: '20px',
                                    background: 'rgba(37, 99, 235, 0.05)',
                                    borderRadius: '15px'
                                }}>
                                    <h4 style={{ marginBottom: '15px', fontWeight: '700' }}>
                                        <i className="fas fa-star"></i> La tua recensione
                                    </h4>
                                    
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                            Valutazione
                                        </label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                                                    style={{
                                                        fontSize: '32px',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: star <= newReview.rating ? '#f59e0b' : '#d1d5db'
                                                    }}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                            Commento
                                        </label>
                                        <textarea
                                            className="form-input"
                                            rows="4"
                                            value={newReview.comment}
                                            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                            placeholder="Racconta la tua esperienza..."
                                            required
                                        />
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button type="submit" className="btn-primary">
                                            <i className="fas fa-paper-plane"></i> Pubblica recensione
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-outline"
                                            onClick={() => setShowReviewForm(false)}
                                        >
                                            Annulla
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Recensioni pubblicate */}
                    {reviews.length > 0 && (
                        <div style={{ marginTop: '30px' }}>
                            <h4 style={{ marginBottom: '20px', fontWeight: '700' }}>
                                <i className="fas fa-star"></i> Recensioni ({reviews.length})
                            </h4>
                            {reviews.map(review => (
                                <div key={review.id} style={{
                                    padding: '15px',
                                    background: 'rgba(0, 0, 0, 0.02)',
                                    borderRadius: '10px',
                                    marginBottom: '15px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div style={{ fontWeight: '600' }}>
                                            {review.profiles?.username || 'Utente'}
                                        </div>
                                        <div style={{ color: '#f59e0b' }}>
                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                                        {review.comment}
                                    </p>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                                        {new Date(review.created_at).toLocaleDateString('it-IT')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Continua nella PARTE 3 con EventChat, CreateEvent, ProfilePage...
// =====================================================
// components-addon.js PARTE 3 - EventChat, CreateEvent, ProfilePage
// =====================================================

// 🔹 COMPONENT: EventChat (Chat interna evento)
function EventChat({ eventId, user, supabase }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadMessages();
        
        const channel = supabase.channel(`chat_${eventId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'event_chats',
                filter: `event_id=eq.${eventId}`
            }, loadMessages)
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [eventId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadMessages = async () => {
        try {
            const { data } = await supabase
                .from('event_chats')
                .select(`
                    *,
                    profiles!event_chats_user_id_fkey(username)
                `)
                .eq('event_id', eventId)
                .order('created_at', { ascending: true });
            
            setMessages(data || []);
        } catch (err) {
            console.error('Errore caricamento messaggi:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await supabase
                .from('event_chats')
                .insert({
                    event_id: eventId,
                    user_id: user.id,
                    content: newMessage.trim()
                });
            
            setNewMessage('');
        } catch (err) {
            console.error('Errore invio messaggio:', err);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Caricamento chat...</div>;
    }

    return (
        <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '15px',
            overflow: 'hidden'
        }}>
            <div style={{
                padding: '15px',
                background: 'rgba(37, 99, 235, 0.05)',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: '700'
            }}>
                <i className="fas fa-comments"></i> Chat Evento
            </div>
            
            <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '20px',
                background: '#f9fafb'
            }}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                        <i className="fas fa-comment-slash" style={{ fontSize: '32px', marginBottom: '10px' }}></i>
                        <p>Nessun messaggio ancora. Rompi il ghiaccio!</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} style={{
                            marginBottom: '15px',
                            padding: '12px',
                            background: msg.user_id === user.id ? 'rgba(37, 99, 235, 0.1)' : 'white',
                            borderRadius: '10px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '8px'
                            }}>
                                <span style={{ fontWeight: '600', color: '#2563eb' }}>
                                    {msg.profiles?.username || 'Utente'}
                                </span>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                    {new Date(msg.created_at).toLocaleTimeString('it-IT', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                                {msg.content}
                            </p>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} style={{
                padding: '15px',
                background: 'white',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                gap: '10px'
            }}>
                <input
                    type="text"
                    className="form-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Scrivi un messaggio..."
                    style={{ flex: 1, margin: 0 }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '12px 20px' }}>
                    <i className="fas fa-paper-plane"></i>
                </button>
            </form>
        </div>
    );
}

// 🔹 COMPONENT: CreateEvent (MODIFICATO con età e sesso)
function CreateEvent({ supabase, user, onEventCreated }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        event_date: '',
        category: '',
        preferred_age_range: 'tutte',
        preferred_gender: 'tutti'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);
        
        try {
            const { error } = await supabase.from('events').insert({
                title: formData.title,
                description: formData.description,
                location: formData.location,
                event_date: formData.event_date,
                category: formData.category,
                preferred_age_range: formData.preferred_age_range,
                preferred_gender: formData.preferred_gender,
                creator_id: user.id,
                event_status: 'da_iniziare'
            });
            
            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
                window.addNotification?.({
                    type: 'success',
                    icon: 'fas fa-check-circle',
                    title: 'Evento creato!',
                    message: 'Il tuo evento è stato pubblicato con successo'
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

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    return (
        <div className="create-wrapper">
            <div className="create-header">
                <h1 className="create-title">Crea il tuo evento</h1>
                <p className="create-subtitle">Organizza un'esperienza indimenticabile</p>
            </div>
            
            <form onSubmit={handleSubmit} className="create-form">
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">
                            <i className="fas fa-heading"></i> Titolo evento
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="Es: Aperitivo al tramonto"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">
                            <i className="fas fa-tag"></i> Categoria
                        </label>
                        <select
                            className="form-input form-select"
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            required
                        >
                            <option value="">Seleziona categoria</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="form-group full-width">
                    <label className="form-label">
                        <i className="fas fa-align-left"></i> Descrizione
                    </label>
                    <textarea
                        className="form-input form-textarea"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Descrivi il tuo evento in dettaglio..."
                        rows="4"
                        required
                    />
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">
                            <i className="fas fa-map-marker-alt"></i> Luogo
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            placeholder="Es: Bar Centrale, Milano"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">
                            <i className="fas fa-clock"></i> Data e ora
                        </label>
                        <input
                            type="datetime-local"
                            className="form-input"
                            value={formData.event_date}
                            onChange={(e) => handleChange('event_date', e.target.value)}
                            required
                        />
                    </div>
                </div>
                
                {/* NUOVI CAMPI: ETÀ E SESSO PREFERITI */}
                <div style={{
                    padding: '20px',
                    background: 'rgba(37, 99, 235, 0.05)',
                    borderRadius: '15px',
                    marginBottom: '25px'
                }}>
                    <h4 style={{ marginBottom: '20px', fontWeight: '700', color: '#2563eb' }}>
                        <i className="fas fa-users"></i> Preferenze partecipanti
                    </h4>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                <i className="fas fa-birthday-cake"></i> Fascia d'età preferita
                            </label>
                            <select
                                className="form-input form-select"
                                value={formData.preferred_age_range}
                                onChange={(e) => handleChange('preferred_age_range', e.target.value)}
                                required
                            >
                                {AGE_RANGES.map(range => (
                                    <option key={range.value} value={range.value}>
                                        {range.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">
                                <i className="fas fa-venus-mars"></i> Sesso partecipanti
                            </label>
                            <select
                                className="form-input form-select"
                                value={formData.preferred_gender}
                                onChange={(e) => handleChange('preferred_gender', e.target.value)}
                                required
                            >
                                {GENDER_OPTIONS.map(gender => (
                                    <option key={gender.value} value={gender.value}>
                                        {gender.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '10px' }}>
                        <i className="fas fa-info-circle"></i> Queste preferenze saranno visibili a tutti e aiuteranno i partecipanti a capire se l'evento fa per loro.
                    </p>
                </div>
                
                {error && (
                    <div className="error-message">
                        <i className="fas fa-exclamation-triangle"></i> {error}
                    </div>
                )}
                
                {success && (
                    <div className="success-message">
                        <i className="fas fa-check-circle"></i> Evento creato con successo! 🎉
                    </div>
                )}
                
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Creazione in corso...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-calendar-plus"></i>
                            Crea evento
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

// 🔹 COMPONENT: ProfilePage (MODIFICATO completo)
function ProfilePage({ supabase, user }) {
    const [profile, setProfile] = useState({
        username: '',
        age: '',
        city: '',
        region: '',
        bio: '',
        location: ''
    });
    const [myEvents, setMyEvents] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [following, setFollowing] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        loadProfile();
        loadMyEvents();
        loadFollowData();
    }, []);

    const loadProfile = async () => {
        try {
            const { data, error } = await supabase
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
                .order('event_date', { ascending: false })
                .limit(5);
            
            setMyEvents(data || []);
        } catch (err) {
            console.error('Errore caricamento eventi:', err);
        }
    };

    const loadFollowData = async () => {
        try {
            // Chi seguo
            const { data: followingData } = await supabase
                .from('user_follows')
                .select(`
                    following_id,
                    profiles!user_follows_following_id_fkey(username, city)
                `)
                .eq('follower_id', user.id);
            
            setFollowing(followingData || []);

            // Chi mi segue
            const { data: followersData } = await supabase
                .from('user_follows')
                .select(`
                    follower_id,
                    profiles!user_follows_follower_id_fkey(username, city)
                `)
                .eq('following_id', user.id);
            
            setFollowers(followersData || []);
        } catch (err) {
            console.error('Errore caricamento follow:', err);
        }
    };

    const handleSaveProfile = async () => {
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    username: profile.username,
                    age: profile.age ? parseInt(profile.age) : null,
                    city: profile.city,
                    region: profile.region,
                    bio: profile.bio,
                    location: profile.city && profile.region ? `${profile.city}, ${profile.region}` : profile.location
                }, { onConflict: 'id' });
            
            if (!error) {
                window.addNotification?.({
                    type: 'success',
                    icon: 'fas fa-check',
                    title: 'Profilo aggiornato!',
                    message: 'Le tue modifiche sono state salvate'
                });
                setEditMode(false);
                loadProfile();
            }
        } catch (err) {
            console.error('Errore salvataggio profilo:', err);
        }
    };

    const handleSearchUsers = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const { data } = await supabase
                .from('profiles')
                .select('id, username, city, region, bio')
                .neq('id', user.id)
                .or(`username.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
                .limit(20);
            
            setSearchResults(data || []);
        } catch (err) {
            console.error('Errore ricerca utenti:', err);
        }
    };

    const handleFollow = async (targetUserId) => {
        try {
            const { error } = await supabase
                .from('user_follows')
                .insert({
                    follower_id: user.id,
                    following_id: targetUserId
                });
            
            if (!error) {
                window.addNotification?.({
                    type: 'success',
                    icon: 'fas fa-user-plus',
                    title: 'Seguito!',
                    message: 'Ora segui questo utente'
                });
                loadFollowData();
            }
        } catch (err) {
            console.error('Errore follow:', err);
        }
    };

    const handleUnfollow = async (targetUserId) => {
        try {
            await supabase
                .from('user_follows')
                .delete()
                .eq('follower_id', user.id)
                .eq('following_id', targetUserId);
            
            window.addNotification?.({
                type: 'info',
                icon: 'fas fa-user-minus',
                title: 'Non segui più',
                message: 'Hai smesso di seguire questo utente'
            });
            loadFollowData();
        } catch (err) {
            console.error('Errore unfollow:', err);
        }
    };

    const isFollowing = (targetUserId) => {
        return following.some(f => f.following_id === targetUserId);
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <div className="loading-text">Caricamento profilo...</div>
            </div>
        );
    }

    return (
        <div className="profile-wrapper">
            {/* Header Profilo */}
            <div className="profile-header">
                <div className="profile-avatar">
                    {profile.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <div className="profile-name">{profile.username || 'Utente'}</div>
                <div className="profile-email">{user.email}</div>
                
                {profile.city && profile.region && (
                    <div style={{ marginTop: '10px', color: '#6b7280', fontSize: '14px' }}>
                        <i className="fas fa-map-marker-alt"></i> {profile.city}, {profile.region}
                    </div>
                )}
                
                {profile.age && (
                    <div style={{ marginTop: '5px', color: '#6b7280', fontSize: '14px' }}>
                        <i className="fas fa-birthday-cake"></i> {profile.age} anni
                    </div>
                )}

                {profile.bio && (
                    <div style={{ marginTop: '15px', fontSize: '14px', lineHeight: '1.5' }}>
                        {profile.bio}
                    </div>
                )}
                
                <div className="profile-stats" style={{ marginTop: '30px' }}>
                    <div className="stat-item">
                        <div className="stat-number">{myEvents.length}</div>
                        <div className="stat-label">Eventi creati</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{followers.length}</div>
                        <div className="stat-label">Followers</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{following.length}</div>
                        <div className="stat-label">Following</div>
                    </div>
                </div>
                
                <div className="profile-actions" style={{ marginTop: '30px' }}>
                    <button 
                        className="btn-primary"
                        onClick={() => setEditMode(!editMode)}
                    >
                        <i className="fas fa-edit"></i>
                        {editMode ? 'Annulla modifica' : 'Modifica profilo'}
                    </button>
                    <button 
                        className="btn-outline"
                        onClick={() => setShowSearch(!showSearch)}
                    >
                        <i className="fas fa-search"></i>
                        Cerca utenti
                    </button>
                </div>
            </div>

            {/* Form Modifica Profilo */}
            {editMode && (
                <div className="profile-form">
                    <h3 style={{ marginBottom: '20px', fontWeight: '700' }}>
                        <i className="fas fa-user-edit"></i> Modifica Profilo
                    </h3>
                    
                    <div className="form-group">
                        <label className="form-label">Nome utente</label>
                        <input
                            type="text"
                            className="form-input"
                            value={profile.username}
                            onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="Il tuo username"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Età</label>
                        <input
                            type="number"
                            className="form-input"
                            value={profile.age}
                            onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                            placeholder="La tua età"
                            min="18"
                            max="120"
                        />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Città</label>
                            <select
                                className="form-input form-select"
                                value={profile.city}
                                onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                            >
                                <option value="">Seleziona città</option>
                                {ITALIAN_CITIES.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Regione</label>
                            <select
                                className="form-input form-select"
                                value={profile.region}
                                onChange={(e) => setProfile(prev => ({ ...prev, region: e.target.value }))}
                            >
                                <option value="">Seleziona regione</option>
                                {ITALIAN_REGIONS.map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Bio</label>
                        <textarea
                            className="form-input"
                            value={profile.bio}
                            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Raccontaci qualcosa di te..."
                            rows="3"
                        />
                    </div>
                    
                    <button className="btn-primary" onClick={handleSaveProfile}>
                        <i className="fas fa-save"></i> Salva modifiche
                    </button>
                </div>
            )}

            {/* Ricerca Utenti */}
            {showSearch && (
                <div className="profile-section">
                    <h3 style={{ marginBottom: '20px', fontWeight: '700' }}>
                        <i className="fas fa-search"></i> Cerca Utenti
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input
                            type="text"
                            className="form-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cerca per nome o città..."
                            style={{ flex: 1, margin: 0 }}
                        />
                        <button className="btn-primary" onClick={handleSearchUsers}>
                            <i className="fas fa-search"></i> Cerca
                        </button>
                    </div>
                    
                    {searchResults.length > 0 && (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {searchResults.map(result => (
                                <div key={result.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '15px',
                                    background: 'rgba(0, 0, 0, 0.02)',
                                    borderRadius: '10px'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                                            {result.username}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                            {result.city && result.region && `${result.city}, ${result.region}`}
                                        </div>
                                        {result.bio && (
                                            <div style={{ fontSize: '13px', marginTop: '5px', color: '#6b7280' }}>
                                                {result.bio.substring(0, 100)}...
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        className={isFollowing(result.id) ? 'btn-outline' : 'btn-primary'}
                                        onClick={() => isFollowing(result.id) ? 
                                            handleUnfollow(result.id) : 
                                            handleFollow(result.id)
                                        }
                                        style={{ padding: '8px 16px', fontSize: '14px' }}
                                    >
                                        <i className={`fas ${isFollowing(result.id) ? 'fa-user-check' : 'fa-user-plus'}`}></i>
                                        {isFollowing(result.id) ? 'Segui già' : 'Segui'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {searchQuery && searchResults.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                            <i className="fas fa-user-slash" style={{ fontSize: '32px', marginBottom: '10px' }}></i>
                            <p>Nessun utente trovato</p>
                        </div>
                    )}
                </div>
            )}

            {/* Following List */}
            {following.length > 0 && (
                <div className="profile-section">
                    <h3 style={{ marginBottom: '20px', fontWeight: '700' }}>
                        <i className="fas fa-user-friends"></i> Utenti che segui ({following.length})
                    </h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {following.map(follow => (
                            <div key={follow.following_id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                background: 'rgba(0, 0, 0, 0.02)',
                                borderRadius: '8px'
                            }}>
                                <div>
                                    <span style={{ fontWeight: '600' }}>
                                        {follow.profiles?.username || 'Utente'}
                                    </span>
                                    {follow.profiles?.city && (
                                        <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '8px' }}>
                                            <i className="fas fa-map-marker-alt"></i> {follow.profiles.city}
                                        </span>
                                    )}
                                </div>
                                <button
                                    className="btn-outline"
                                    onClick={() => handleUnfollow(follow.following_id)}
                                    style={{ padding: '6px 12px', fontSize: '13px' }}
                                >
                                    <i className="fas fa-user-minus"></i> Non seguire più
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* My Events */}
            {myEvents.length > 0 && (
                <div className="profile-section">
                    <h3 style={{ marginBottom: '20px', fontWeight: '700' }}>
                        <i className="fas fa-calendar-check"></i> I miei eventi ({myEvents.length})
                    </h3>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {myEvents.map(event => (
                            <div key={event.id} style={{
                                padding: '15px',
                                background: 'rgba(37, 99, 235, 0.05)',
                                borderRadius: '10px',
                                border: '1px solid rgba(37, 99, 235, 0.1)'
                            }}>
                                <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                                    {event.title}
                                </div>
                                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                    <i className="fas fa-calendar"></i> {new Date(event.event_date).toLocaleString('it-IT')}
                                    {' • '}
                                    <i className="fas fa-map-marker-alt"></i> {event.location}
                                </div>
                                {event.event_status && (
                                    <div style={{
                                        marginTop: '8px',
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        background: event.event_status === 'concluso' ? '#10b981' :
                                                   event.event_status === 'in_esecuzione' ? '#f59e0b' : '#6b7280',
                                        color: 'white',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: '600'
                                    }}>
                                        {event.event_status === 'da_iniziare' && 'Da iniziare'}
                                        {event.event_status === 'in_esecuzione' && 'In corso'}
                                        {event.event_status === 'concluso' && 'Concluso'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// EXPORT dei componenti
window.EventFeed = EventFeed;
window.CreateEvent = CreateEvent;
window.ProfilePage = ProfilePage;
