 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/components.js b/components.js
index 0fb24fc1fc625176fb1f7ad76c74f6ea2f9a4406..9f8b1ffebbc05c2f75220da01b2e3fad13840196 100644
--- a/components.js
+++ b/components.js
@@ -174,73 +174,73 @@ function EventFeed({ supabase, user }) {
             
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
-                <div style={{ 
-                    display: 'flex', 
-                    alignItems: 'center', 
+                <div style={{
+                    display: 'flex',
+                    alignItems: 'center',
                     justifyContent: 'center',
                     gap: '15px',
                     marginBottom: '20px'
                 }}>
-                    <i className="fas fa-search-location" style={{ 
-                        fontSize: '48px',
-                        color: '#2563eb',
-                        animation: 'float 3s ease-in-out infinite'
-                    }}></i>
+                    <div className="handshake-graphic">
+                        <i className="fas fa-user-friends base"></i>
+                        <i className="fas fa-handshake handshake"></i>
+                        <i className="fas fa-mobile-alt phone"></i>
+                    </div>
                 </div>
                 <h1 className="feed-title">Un nuovo modo di incontrarsi</h1>
                 <p className="feed-subtitle">Cerca, trova, partecipa</p>
             </div>
             
             <div className="event-list">
                 {events.length === 0 ? (
                     <div className="empty-state">
                         <i className="fas fa-users" style={{ fontSize: '64px', marginBottom: '20px' }}></i>
                         <h3>Nessun evento disponibile</h3>
-                        <p>Sii il primo a creare un evento nella tua zona!</p>
+                        <p>Cerca, trova, partecipa</p>
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
@@ -365,51 +365,51 @@ function EventFeed({ supabase, user }) {
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
-    const [pending Requests, setPendingRequests] = useState([]);
+    const [pendingRequests, setPendingRequests] = useState([]);
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
 
EOF
)
