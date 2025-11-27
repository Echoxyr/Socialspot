// ============================================
// NUOVI COMPONENTI - AGGIUNGI ALLA FINE
// ============================================

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

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`btn-sm ${following ? 'btn-outline' : 'btn-primary'}`}
            style={{ minWidth: '100px' }}
        >
            {loading ? (
                <i className="fas fa-spinner fa-spin"></i>
            ) : following ? (
                <>
                    <i className="fas fa-user-check"></i>
                    Segui già
                </>
            ) : (
                <>
                    <i className="fas fa-user-plus"></i>
                    Segui
                </>
            )}
        </button>
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

    return (
        <div style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-6)',
            background: 'var(--color-warning-50)',
            border: '1px solid var(--color-warning-200)',
            borderRadius: 'var(--radius-2xl)'
        }}>
            <h4 style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-4)',
                fontWeight: 'var(--font-weight-bold)'
            }}>
                <i className="fas fa-clock"></i>
                Richieste in attesa ({pending.length})
            </h4>
            {pending.map(p => (
                <div key={p.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-4)',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-xl)',
                    marginBottom: 'var(--space-3)'
                }}>
                    <div>
                        <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                            {p.profiles?.username || 'Utente'}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                            {new Date(p.joined_at).toLocaleString('it-IT')}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                            onClick={() => handleApproval(p.id, true)}
                            className="btn-sm btn-primary"
                        >
                            <i className="fas fa-check"></i>
                            Approva
                        </button>
                        <button
                            onClick={() => handleApproval(p.id, false)}
                            className="btn-sm btn-outline"
                            style={{ color: 'var(--color-error-600)', borderColor: 'var(--color-error-600)' }}
                        >
                            <i className="fas fa-times"></i>
                            Rifiuta
                        </button>
                    </div>
                </div>
            ))}
        </div>
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

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                    position: 'relative',
                    padding: 'var(--space-3)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-xl)',
                    color: 'var(--color-text)'
                }}
            >
                <i className="fas fa-bell"></i>
                {unread > 0 && (
                    <span style={{
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
                    }}>
                        {unread}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 999
                        }}
                        onClick={() => setShowDropdown(false)}
                    />
                    <div style={{
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
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--space-4)',
                            borderBottom: '1px solid var(--color-border)'
                        }}>
                            <h4 style={{ fontWeight: 'var(--font-weight-bold)' }}>Notifiche</h4>
                            {unread > 0 && (
                                <button
                                    onClick={markAllRead}
                                    style={{
                                        padding: 'var(--space-2) var(--space-3)',
                                        fontSize: 'var(--font-size-xs)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-primary-600)',
                                        cursor: 'pointer',
                                        fontWeight: 'var(--font-weight-semibold)'
                                    }}
                                >
                                    Segna tutte lette
                                </button>
                            )}
                        </div>

                        {notifications.length === 0 ? (
                            <div style={{
                                padding: 'var(--space-12)',
                                textAlign: 'center',
                                color: 'var(--color-text-muted)'
                            }}>
                                <i className="fas fa-bell-slash" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}></i>
                                <p>Nessuna notifica</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => {
                                        if (!n.is_read) markAsRead(n.id);
                                    }}
                                    style={{
                                        padding: 'var(--space-4)',
                                        borderBottom: '1px solid var(--color-border)',
                                        cursor: 'pointer',
                                        background: n.is_read ? 'transparent' : 'var(--color-primary-50)',
                                        transition: 'var(--transition-colors)'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'var(--color-primary-50)'}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: 'var(--space-2)'
                                    }}>
                                        <div style={{ fontWeight: 'var(--font-weight-semibold)', flex: 1 }}>
                                            {n.title}
                                        </div>
                                        {!n.is_read && (
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                background: 'var(--color-primary-600)',
                                                borderRadius: '50%'
                                            }} />
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--color-text-muted)',
                                        marginBottom: 'var(--space-1)'
                                    }}>
                                        {n.content}
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        {new Date(n.created_at).toLocaleString('it-IT')}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
});
