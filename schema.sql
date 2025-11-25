/*
 * app.js - SocialSpot Application FIXED
 * Versione corretta con credenziali uniformi e gestione email verification
 */

// 🔹 Supabase Configuration - CREDENZIALI CORRETTE
const SUPABASE_URL = 'https://ctixzrxyyqpumzwmyjyo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aXh6cnh5eXFwdW16d215anlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTYzNDQsImV4cCI6MjA3OTU5MjM0NH0.k8HDt4WbU6RwMktolucWc1dekPwfbOk853o7AABRt4o';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🔹 PERFORMANCE MONITORING
const PerformanceMonitor = {
    startTime: performance.now(),
    
    logPageLoad() {
        const loadTime = performance.now() - this.startTime;
        console.log(`🚀 SocialSpot loaded in ${loadTime.toFixed(2)}ms`);
    },
    
    logUserAction(action, duration = 0) {
        console.log(`📊 User action: ${action} ${duration > 0 ? `(${duration}ms)` : ''}`);
    }
};

// 🔹 NOTIFICATION SYSTEM
function NotificationSystem() {
    const [notifications, setNotifications] = React.useState([]);
    
    const addNotification = React.useCallback((notification) => {
        const id = Date.now();
        const newNotification = { ...notification, id };
        
        setNotifications(prev => [...prev, newNotification]);
        
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);
    
    const removeNotification = React.useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);
    
    React.useEffect(() => {
        window.addNotification = addNotification;
    }, [addNotification]);
    
    return React.createElement('div', {
        className: 'notification-container',
        style: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1500,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }
    },
        notifications.map((notification) =>
            React.createElement('div', {
                key: notification.id,
                className: `notification ${notification.type || 'info'} animate-slide-in-right`,
                style: {
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-4)',
                    boxShadow: 'var(--shadow-lg)',
                    maxWidth: '350px',
                    cursor: 'pointer'
                },
                onClick: () => removeNotification(notification.id)
            },
                React.createElement('div', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }
                },
                    React.createElement('i', {
                        className: `fas ${notification.icon || 'fa-info-circle'}`,
                        style: {
                            color: notification.type === 'success' ? 'var(--color-success-500)' :
                                   notification.type === 'error' ? 'var(--color-error-500)' :
                                   notification.type === 'warning' ? 'var(--color-warning-500)' :
                                   'var(--color-primary-500)'
                        }
                    }),
                    React.createElement('div', { style: { flex: 1 } },
                        React.createElement('div', {
                            style: {
                                fontWeight: 'var(--font-weight-semibold)',
                                marginBottom: '4px'
                            }
                        }, notification.title),
                        React.createElement('div', {
                            style: {
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-muted)'
                            }
                        }, notification.message)
                    ),
                    React.createElement('i', {
                        className: 'fas fa-times',
                        style: {
                            color: 'var(--color-text-muted)',
                            fontSize: 'var(--font-size-xs)'
                        }
                    })
                )
            )
        )
    );
}

// 🔹 LOADING SCREEN
function LoadingScreen({ isVisible }) {
    const [loadingText, setLoadingText] = React.useState('Caricamento in corso...');
    
    React.useEffect(() => {
        if (!isVisible) return;
        
        const messages = [
            'Caricamento in corso...',
            'Connessione al server...',
            'Preparazione interfaccia...',
            'Quasi pronto...'
        ];
        
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % messages.length;
            setLoadingText(messages[index]);
        }, 800);
        
        return () => clearInterval(interval);
    }, [isVisible]);

    if (!isVisible) return null;

    return React.createElement('div', { className: 'loader-screen' },
        React.createElement('div', { className: 'loader-content' },
            React.createElement('div', { className: 'app-logo-loading' },
                React.createElement('div', { className: 'logo-icon-loading' },
                    React.createElement('span', { className: 'logo-text-loading' }, 'SS'),
                    React.createElement('div', { className: 'loading-rings' },
                        React.createElement('div', { className: 'ring ring-1' }),
                        React.createElement('div', { className: 'ring ring-2' }),
                        React.createElement('div', { className: 'ring ring-3' })
                    )
                ),
                React.createElement('h1', { className: 'brand-name-loading' }, 'SocialSpot'),
                React.createElement('p', { className: 'brand-tagline' }, 'Connetti • Scopri • Partecipa')
            ),
            React.createElement('div', { className: 'loading-progress' },
                React.createElement('div', { className: 'progress-bar-loading' }),
                React.createElement('p', { className: 'loading-text' }, loadingText)
            )
        )
    );
}

// 🔹 EMAIL VERIFICATION NOTICE
function EmailVerificationNotice({ email, onResendEmail }) {
    const [resending, setResending] = React.useState(false);
    const [cooldown, setCooldown] = React.useState(0);

    React.useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleResend = async () => {
        if (resending || cooldown > 0) return;
        
        setResending(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email
            });
            
            if (error) {
                window.addNotification?.({
                    type: 'error',
                    icon: 'fas fa-exclamation-triangle',
                    title: 'Errore',
                    message: 'Impossibile inviare l\'email. Riprova.'
                });
            } else {
                window.addNotification?.({
                    type: 'success',
                    icon: 'fas fa-envelope',
                    title: 'Email inviata!',
                    message: 'Controlla la tua casella di posta.'
                });
                setCooldown(60);
            }
        } catch (err) {
            console.error('Resend email error:', err);
        } finally {
            setResending(false);
        }
    };

    return React.createElement('div', {
        style: {
            background: 'var(--color-warning-50)',
            border: '2px solid var(--color-warning-500)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-6)',
            textAlign: 'center',
            maxWidth: '500px',
            margin: '0 auto'
        }
    },
        React.createElement('i', {
            className: 'fas fa-envelope-open-text',
            style: {
                fontSize: 'var(--font-size-5xl)',
                color: 'var(--color-warning-600)',
                marginBottom: 'var(--space-4)'
            }
        }),
        React.createElement('h2', {
            style: {
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-3)'
            }
        }, 'Verifica la tua email'),
        React.createElement('p', {
            style: {
                fontSize: 'var(--font-size-base)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-6)',
                lineHeight: '1.6'
            }
        }, `Ti abbiamo inviato un'email a ${email}. Clicca sul link nell'email per verificare il tuo account.`),
        React.createElement('button', {
            className: 'btn-primary',
            onClick: handleResend,
            disabled: resending || cooldown > 0,
            style: {
                marginTop: 'var(--space-4)'
            }
        },
            resending ? [
                React.createElement('i', {
                    className: 'fas fa-spinner fa-spin',
                    key: 'icon'
                }),
                ' Invio in corso...'
            ] : cooldown > 0 ? `Riprova tra ${cooldown}s` : [
                React.createElement('i', {
                    className: 'fas fa-envelope',
                    key: 'icon'
                }),
                ' Invia di nuovo'
            ]
        )
    );
}

// 🔹 MAIN APP COMPONENT
function App() {
    const [user, setUser] = React.useState(null);
    const [page, setPage] = React.useState('feed');
    const [initializing, setInitializing] = React.useState(true);
    const [showLoader, setShowLoader] = React.useState(true);
    const [emailVerified, setEmailVerified] = React.useState(true);
    const [theme, setTheme] = React.useState(() => {
        const stored = localStorage.getItem('theme');
        if (stored) return stored;
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    React.useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.content = theme === 'dark' ? '#1f2937' : '#2563eb';
        }
    }, [theme]);

    React.useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.user) {
                    setUser(session.user);
                    setEmailVerified(session.user.email_confirmed_at !== null);
                } else {
                    setUser(null);
                    setEmailVerified(true);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                window.addNotification?.({
                    type: 'error',
                    icon: 'fas fa-exclamation-triangle',
                    title: 'Errore di connessione',
                    message: 'Problema durante l\'inizializzazione'
                });
            } finally {
                setInitializing(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event);
            
            if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user);
                setEmailVerified(session.user.email_confirmed_at !== null);
                
                PerformanceMonitor.logUserAction('user_signed_in');
                
                if (session.user.email_confirmed_at) {
                    window.addNotification?.({
                        type: 'success',
                        icon: 'fas fa-user-check',
                        title: 'Accesso effettuato!',
                        message: `Benvenuto ${session.user.email}`
                    });
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setEmailVerified(true);
            } else if (event === 'USER_UPDATED' && session?.user) {
                setUser(session.user);
                setEmailVerified(session.user.email_confirmed_at !== null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    React.useEffect(() => {
        if (!initializing) {
            const timer = setTimeout(() => {
                setShowLoader(false);
                PerformanceMonitor.logPageLoad();
            }, 1500);
            
            return () => clearTimeout(timer);
        }
    }, [initializing]);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setEmailVerified(true);
            setPage('feed');
            PerformanceMonitor.logUserAction('user_signed_out');
            
            window.addNotification?.({
                type: 'info',
                icon: 'fas fa-sign-out-alt',
                title: 'Logout effettuato',
                message: 'A presto su SocialSpot!'
            });
        } catch (error) {
            console.error('Sign out error:', error);
            window.addNotification?.({
                type: 'error',
                icon: 'fas fa-exclamation-triangle',
                title: 'Errore logout',
                message: 'Impossibile effettuare il logout'
            });
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        PerformanceMonitor.logUserAction(`theme_changed_to_${newTheme}`);
    };

    if (initializing || showLoader) {
        return React.createElement(LoadingScreen, { isVisible: true });
    }

    if (!user) {
        return React.createElement('div', null,
            React.createElement(NotificationSystem),
            React.createElement(Auth, { supabase, setUser })
        );
    }

    if (!emailVerified) {
        return React.createElement('div', { className: 'app-container' },
            React.createElement(NotificationSystem),
            React.createElement('div', {
                style: {
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--space-6)'
                }
            },
                React.createElement(EmailVerificationNotice, {
                    email: user.email,
                    onResendEmail: () => {}
                }),
                React.createElement('button', {
                    className: 'btn-outline',
                    onClick: handleSignOut,
                    style: {
                        marginTop: 'var(--space-6)',
                        display: 'block',
                        margin: 'var(--space-6) auto 0'
                    }
                },
                    React.createElement('i', { className: 'fas fa-sign-out-alt' }),
                    ' Logout'
                )
            )
        );
    }

    return React.createElement('div', { className: 'app-container' },
        React.createElement(NotificationSystem),
        React.createElement('div', { style: { textAlign: 'center', padding: 'var(--space-12)' } },
            React.createElement('h1', null, '🎉 Benvenuto su SocialSpot!'),
            React.createElement('p', null, `Email: ${user.email}`),
            React.createElement('p', null, 'L\'applicazione completa sarà disponibile a breve.'),
            React.createElement('button', {
                className: 'btn-primary',
                onClick: handleSignOut,
                style: { marginTop: 'var(--space-6)' }
            },
                React.createElement('i', { className: 'fas fa-sign-out-alt' }),
                ' Logout'
            )
        )
    );
}

// 🔹 RENDER
document.addEventListener('DOMContentLoaded', () => {
    const initialLoader = document.getElementById('initial-loader');
    if (initialLoader) {
        setTimeout(() => {
            initialLoader.style.display = 'none';
        }, 2000);
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App));

    PerformanceMonitor.logUserAction('app_initialized');
});

// 🔹 SERVICE WORKER
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('✅ Service Worker registered:', registration.scope);
            })
            .catch((error) => {
                console.error('❌ Service Worker registration failed:', error);
            });
    });
}

window.SocialSpot = {
    supabase,
    PerformanceMonitor,
    version: '2.1.0'
};

console.log('🚀 SocialSpot v2.1.0 initialized successfully!');
