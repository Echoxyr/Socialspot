/*
 * app.js - SocialSpot Enhanced Application
 * Versione avanzata con performance ottimizzate, nuove funzionalità e UX migliorata
 */

// 🔹 Supabase Configuration
const SUPABASE_URL = 'https://dtplarkoscdtmqbondri.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGxhcmtvc2NkYm1xYm9uZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzQ0NDYsImV4cCI6MjA3MjMxMDQ0Nn0.QKwzKbookhedLVK1kxjCVMVMUbz7GWt-eqzHuOkhNSU';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🔹 PERFORMANCE MONITORING
const PerformanceMonitor = {
    startTime: performance.now(),
    
    logPageLoad() {
        const loadTime = performance.now() - this.startTime;
        console.log(`🚀 SocialSpot loaded in ${loadTime.toFixed(2)}ms`);
        
        // Analytics potrebbero andare qui
        if (window.gtag) {
            window.gtag('event', 'page_load_time', {
                value: Math.round(loadTime),
                event_category: 'Performance'
            });
        }
    },
    
    logUserAction(action, duration = 0) {
        console.log(`📊 User action: ${action} ${duration > 0 ? `(${duration}ms)` : ''}`);
    }
};

// 🔹 ENHANCED WELCOME POPUP
function WelcomePopup({ user, onClose }) {
    const [showPopup, setShowPopup] = React.useState(false);
    const [currentFeature, setCurrentFeature] = React.useState(0);
    
    const features = [
        {
            icon: 'fas fa-calendar-plus',
            title: 'Crea Eventi',
            description: 'Organizza eventi unici e coinvolgi la tua community locale'
        },
        {
            icon: 'fas fa-users',
            title: 'Partecipa',
            description: 'Scopri eventi interessanti e conosci persone con i tuoi stessi interessi'
        },
        {
            icon: 'fas fa-comments',
            title: 'Chatta',
            description: 'Comunica in tempo reale con altri partecipanti nelle chat di gruppo'
        },
        {
            icon: 'fas fa-star',
            title: 'Gamification',
            description: 'Guadagna punti, sali di livello e sblocca achievement speciali'
        }
    ];

    React.useEffect(() => {
        const hasSeenWelcome = localStorage.getItem(`welcomed_${user.id}`);
        if (!hasSeenWelcome) {
            setTimeout(() => setShowPopup(true), 500);
        }
    }, [user.id]);

    React.useEffect(() => {
        if (showPopup) {
            const interval = setInterval(() => {
                setCurrentFeature((prev) => (prev + 1) % features.length);
            }, 3000);
            
            return () => clearInterval(interval);
        }
    }, [showPopup, features.length]);

    const handleClose = () => {
        localStorage.setItem(`welcomed_${user.id}`, 'true');
        setShowPopup(false);
        PerformanceMonitor.logUserAction('welcome_popup_closed');
        if (onClose) onClose();
    };

    if (!showPopup) return null;

    return (
        <div className="welcome-popup-overlay" onClick={handleClose}>
            <div className="welcome-popup animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="welcome-header">
                    <div className="logo-icon float-animation">
                        <span className="logo-text">SS</span>
                    </div>
                    <h2>Benvenuto in SocialSpot! 🎉</h2>
                    <p>Siamo felici di averti nella nostra community!</p>
                </div>
                
                <div className="welcome-content">
                    <div className="welcome-features">
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className={`feature-item ${index === currentFeature ? 'animate-fade-in-up' : ''}`}
                                style={{
                                    opacity: index === currentFeature ? 1 : 0.7,
                                    transform: index === currentFeature ? 'scale(1.05)' : 'scale(1)'
                                }}
                            >
                                <i className={feature.icon}></i>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="feature-indicators" style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        marginTop: '20px' 
                    }}>
                        {features.map((_, index) => (
                            <div
                                key={index}
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: index === currentFeature ? '#2563eb' : '#d1d5db',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        ))}
                    </div>
                </div>
                
                <button className="btn-primary welcome-btn glow-animation" onClick={handleClose}>
                    <i className="fas fa-rocket"></i>
                    Inizia la tua avventura!
                </button>
            </div>
        </div>
    );
}

// 🔹 ENHANCED NOTIFICATION SYSTEM
function NotificationSystem() {
    const [notifications, setNotifications] = React.useState([]);
    
    const addNotification = React.useCallback((notification) => {
        const id = Date.now();
        const newNotification = { ...notification, id };
        
        setNotifications(prev => [...prev, newNotification]);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);
    
    const removeNotification = React.useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);
    
    // Make addNotification available globally
    React.useEffect(() => {
        window.addNotification = addNotification;
    }, [addNotification]);
    
    return (
        <div className="notification-container" style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1500,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`notification ${notification.type || 'info'} animate-slide-in-right`}
                    style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xl)',
                        padding: 'var(--space-4)',
                        boxShadow: 'var(--shadow-lg)',
                        maxWidth: '350px',
                        cursor: 'pointer'
                    }}
                    onClick={() => removeNotification(notification.id)}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <i className={`fas ${notification.icon || 'fa-info-circle'}`} style={{
                            color: notification.type === 'success' ? 'var(--color-success-500)' :
                                   notification.type === 'error' ? 'var(--color-error-500)' :
                                   notification.type === 'warning' ? 'var(--color-warning-500)' :
                                   'var(--color-primary-500)'
                        }}></i>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: '4px' }}>
                                {notification.title}
                            </div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                                {notification.message}
                            </div>
                        </div>
                        <i className="fas fa-times" style={{ 
                            color: 'var(--color-text-muted)', 
                            fontSize: 'var(--font-size-xs)' 
                        }}></i>
                    </div>
                </div>
            ))}
        </div>
    );
}

// 🔹 ENHANCED SIDE MENU
function SideMenu({ isOpen, onClose, user, onSignOut, theme, onToggleTheme, currentPage, onPageChange }) {
    const [userStats, setUserStats] = React.useState(null);
    
    React.useEffect(() => {
       if (isOpen && user) {
           loadUserStats();
       }
   }, [isOpen, user]);

   const loadUserStats = async () => {
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
           
           setUserStats({
               eventsCreated: createdEvents,
               eventsJoined: joinedEvents,
               totalPoints,
               level
           });
       } catch (error) {
           console.error('Error loading user stats:', error);
       }
   };

   const menuItems = [
       { icon: 'fas fa-home', label: 'Eventi', action: 'feed', page: 'feed' },
       { icon: 'fas fa-plus-circle', label: 'Crea Evento', action: 'create', page: 'create' },
       { icon: 'fas fa-user', label: 'Profilo', action: 'profile', page: 'profile' },
       { icon: 'fas fa-star', label: 'Preferiti', action: 'favorites', page: 'favorites' },
       { icon: 'fas fa-chart-line', label: 'Statistiche', action: 'stats', page: 'stats' },
       { icon: 'fas fa-cog', label: 'Impostazioni', action: 'settings', page: 'settings' },
       { icon: 'fas fa-info-circle', label: 'Info & Supporto', action: 'info', page: 'info' }
   ];

   const handleMenuClick = (action, page) => {
       PerformanceMonitor.logUserAction(`menu_${action}_clicked`);
       
       switch (action) {
           case 'logout':
               onSignOut();
               break;
           case 'feed':
           case 'create':
           case 'profile':
               onPageChange(page);
               break;
           case 'favorites':
               window.addNotification?.({
                   type: 'info',
                   icon: 'fas fa-star',
                   title: 'Preferiti',
                   message: 'Funzionalità in arrivo presto!'
               });
               break;
           case 'stats':
               window.addNotification?.({
                   type: 'info',
                   icon: 'fas fa-chart-line',
                   title: 'Statistiche',
                   message: 'Dashboard avanzate in sviluppo!'
               });
               break;
           case 'settings':
               window.addNotification?.({
                   type: 'info',
                   icon: 'fas fa-cog',
                   title: 'Impostazioni',
                   message: 'Pannello impostazioni in arrivo!'
               });
               break;
           case 'info':
               window.addNotification?.({
                   type: 'success',
                   icon: 'fas fa-heart',
                   title: 'SocialSpot v2.0',
                   message: 'Grazie per essere parte della community!'
               });
               break;
           default:
               console.log(`Azione ${action} non implementata`);
       }
       onClose();
   };

   if (!isOpen) return null;

   const initials = user.email ? user.email[0].toUpperCase() : '?';

   return (
       <>
           <div className="side-menu-overlay" onClick={onClose}></div>
           <div className="side-menu animate-slide-in-right">
               <div className="side-menu-header">
                   <div className="user-info">
                       <div className="user-avatar glow-animation">
                           {initials}
                       </div>
                       <div className="user-details">
                           <h3>{user.email}</h3>
                           <p>Membro della community</p>
                           {userStats && (
                               <div style={{ 
                                   marginTop: '8px', 
                                   display: 'flex', 
                                   gap: '12px',
                                   fontSize: 'var(--font-size-xs)',
                                   color: 'var(--color-text-muted)'
                               }}>
                                   <span>📊 {userStats.totalPoints} punti</span>
                                   <span>⭐ Livello {userStats.level}</span>
                               </div>
                           )}
                       </div>
                   </div>
                   <button className="side-menu-close" onClick={onClose}>
                       <i className="fas fa-times"></i>
                   </button>
               </div>
               
               <div className="side-menu-content">
                   <nav className="menu-nav">
                       {menuItems.map((item, index) => (
                           <button
                               key={index}
                               className={`menu-item ${item.page === currentPage ? 'active' : ''}`}
                               onClick={() => handleMenuClick(item.action, item.page)}
                               style={{
                                   background: item.page === currentPage ? 
                                       'linear-gradient(135deg, var(--color-primary-50), var(--color-secondary-50))' : 
                                       'none',
                                   color: item.page === currentPage ? 'var(--color-primary-600)' : 'inherit'
                               }}
                           >
                               <i className={item.icon}></i>
                               <span>{item.label}</span>
                               <i className="fas fa-chevron-right"></i>
                           </button>
                       ))}
                       
                       <button
                           className="menu-item"
                           onClick={() => handleMenuClick('logout')}
                           style={{ 
                               marginTop: 'var(--space-4)',
                               borderTop: '1px solid var(--color-border-light)',
                               paddingTop: 'var(--space-4)',
                               color: 'var(--color-error-600)'
                           }}
                       >
                           <i className="fas fa-sign-out-alt"></i>
                           <span>Logout</span>
                           <i className="fas fa-chevron-right"></i>
                       </button>
                   </nav>
                   
                   <div className="theme-section">
                       <div className="theme-toggle-section">
                           <div className="theme-info">
                               <i className="fas fa-palette"></i>
                               <span>Tema: {theme === 'light' ? 'Chiaro' : 'Scuro'}</span>
                           </div>
                           <button className="theme-switch" onClick={onToggleTheme}>
                               <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
                           </button>
                       </div>
                   </div>
               </div>
               
               <div className="side-menu-footer">
                   <p>SocialSpot v2.0</p>
                   <p>Connetti • Scopri • Partecipa</p>
               </div>
           </div>
       </>
   );
}

// 🔹 ENHANCED HEADER
function Header({ user, currentPage, setPage, onSignOut, theme, onToggleTheme }) {
   const [sideMenuOpen, setSideMenuOpen] = React.useState(false);
   const [isScrolled, setIsScrolled] = React.useState(false);

   React.useEffect(() => {
       const handleScroll = () => {
           setIsScrolled(window.scrollY > 10);
       };

       window.addEventListener('scroll', handleScroll);
       return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   const handlePageChange = (page) => {
       setPage(page);
       PerformanceMonitor.logUserAction(`navigate_to_${page}`);
   };

   return (
       <>
           <header className={`main-header ${isScrolled ? 'scrolled' : ''}`} style={{
               boxShadow: isScrolled ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
               background: isScrolled ? 
                   'rgba(255, 255, 255, 0.95)' : 
                   'rgba(255, 255, 255, 0.8)'
           }}>
               <div className="header-container">
                   <button 
                       className="hamburger-menu"
                       onClick={() => setSideMenuOpen(true)}
                       aria-label="Menu"
                   >
                       <i className="fas fa-bars"></i>
                   </button>

                   <div className="app-logo-header" onClick={() => handlePageChange('feed')} style={{ cursor: 'pointer' }}>
                       <div className="logo-icon glow-animation">
                           <span className="logo-text">SS</span>
                       </div>
                       <span className="app-name">SocialSpot</span>
                   </div>

                   <nav className="header-nav">
                       <button 
                           className={`nav-btn ${currentPage === 'feed' ? 'active' : ''}`}
                           onClick={() => handlePageChange('feed')}
                       >
                           <i className="fas fa-home"></i>
                           <span>Eventi</span>
                       </button>
                       <button 
                           className={`nav-btn ${currentPage === 'create' ? 'active' : ''}`}
                           onClick={() => handlePageChange('create')}
                       >
                           <i className="fas fa-plus"></i>
                           <span>Crea</span>
                       </button>
                       <button 
                           className={`nav-btn ${currentPage === 'profile' ? 'active' : ''}`}
                           onClick={() => handlePageChange('profile')}
                       >
                           <i className="fas fa-user"></i>
                           <span>Profilo</span>
                       </button>
                   </nav>
               </div>
           </header>

           <SideMenu 
               isOpen={sideMenuOpen}
               onClose={() => setSideMenuOpen(false)}
               user={user}
               onSignOut={onSignOut}
               theme={theme}
               onToggleTheme={onToggleTheme}
               currentPage={currentPage}
               onPageChange={handlePageChange}
           />
       </>
   );
}

// 🔹 ENHANCED LOADING SCREEN
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

   return (
       <div className="loader-screen">
           <div className="loader-content">
               <div className="app-logo-loading">
                   <div className="logo-icon-loading">
                       <span className="logo-text-loading">SS</span>
                       <div className="loading-rings">
                           <div className="ring ring-1"></div>
                           <div className="ring ring-2"></div>
                           <div className="ring ring-3"></div>
                       </div>
                   </div>
                   <h1 className="brand-name-loading">SocialSpot</h1>
                   <p className="brand-tagline">Connetti • Scopri • Partecipa</p>
               </div>
               <div className="loading-progress">
                   <div className="progress-bar-loading"></div>
                   <p className="loading-text">{loadingText}</p>
               </div>
           </div>
       </div>
   );
}

// 🔹 PWA INSTALL PROMPT
function PWAInstallPrompt() {
   const [deferredPrompt, setDeferredPrompt] = React.useState(null);
   const [showInstallButton, setShowInstallButton] = React.useState(false);

   React.useEffect(() => {
       const handleBeforeInstallPrompt = (e) => {
           e.preventDefault();
           setDeferredPrompt(e);
           setShowInstallButton(true);
       };

       window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

       return () => {
           window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
       };
   }, []);

   const handleInstallClick = async () => {
       if (deferredPrompt) {
           deferredPrompt.prompt();
           const result = await deferredPrompt.userChoice;
           
           if (result.outcome === 'accepted') {
               window.addNotification?.({
                   type: 'success',
                   icon: 'fas fa-download',
                   title: 'App Installata!',
                   message: 'SocialSpot è ora disponibile nella tua home screen!'
               });
           }
           
           setDeferredPrompt(null);
           setShowInstallButton(false);
       }
   };

   if (!showInstallButton) return null;

   return (
       <button
           className="install-app-btn glow-animation"
           onClick={handleInstallClick}
           title="Installa SocialSpot"
       >
           <i className="fas fa-download"></i>
       </button>
   );
}

// 🔹 ERROR BOUNDARY
class ErrorBoundary extends React.Component {
   constructor(props) {
       super(props);
       this.state = { hasError: false, error: null };
   }

   static getDerivedStateFromError(error) {
       return { hasError: true, error };
   }

   componentDidCatch(error, errorInfo) {
       console.error('SocialSpot Error:', error, errorInfo);
       
       // Log to external service if available
       if (window.Sentry) {
           window.Sentry.captureException(error);
       }
   }

   render() {
       if (this.state.hasError) {
           return (
               <div className="error-boundary" style={{
                   minHeight: '100vh',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   flexDirection: 'column',
                   gap: '20px',
                   padding: '40px',
                   textAlign: 'center'
               }}>
                   <div style={{ fontSize: '4rem' }}>😵</div>
                   <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-text)' }}>
                       Oops! Qualcosa è andato storto
                   </h1>
                   <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>
                       Si è verificato un errore imprevisto. Prova a ricaricare la pagina o contatta il supporto se il problema persiste.
                   </p>
                   <button 
                       className="btn-primary"
                       onClick={() => window.location.reload()}
                       style={{ marginTop: '20px' }}
                   >
                       <i className="fas fa-redo"></i>
                       Ricarica la pagina
                   </button>
               </div>
           );
       }

       return this.props.children;
   }
}

// 🔹 MAIN APP COMPONENT
function App() {
   const [user, setUser] = React.useState(null);
   const [page, setPage] = React.useState('feed');
   const [initializing, setInitializing] = React.useState(true);
   const [showLoader, setShowLoader] = React.useState(true);
   const [theme, setTheme] = React.useState(() => {
       const stored = localStorage.getItem('theme');
       if (stored) return stored;
       return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
   });

   // Theme management
   React.useEffect(() => {
       document.body.setAttribute('data-theme', theme);
       localStorage.setItem('theme', theme);
       
       // Update theme color meta tag
       const themeColorMeta = document.querySelector('meta[name="theme-color"]');
       if (themeColorMeta) {
           themeColorMeta.content = theme === 'dark' ? '#1f2937' : '#2563eb';
       }
   }, [theme]);

   // Authentication state management
   React.useEffect(() => {
       const initAuth = async () => {
           try {
               const { data: { session } } = await supabase.auth.getSession();
               setUser(session?.user ?? null);
           } catch (error) {
               console.error('Auth initialization error:', error);
               window.addNotification?.({
                   type: 'error',
                   icon: 'fas fa-exclamation-triangle',
                   title: 'Errore di connessione',
                   message: 'Problema durante l\'inizializzazione dell\'app'
               });
           } finally {
               setInitializing(false);
           }
       };

       initAuth();

       const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
           setUser(session?.user ?? null);
           
           if (session?.user) {
               PerformanceMonitor.logUserAction('user_signed_in');
               window.addNotification?.({
                   type: 'success',
                   icon: 'fas fa-user-check',
                   title: 'Accesso effettuato!',
                   message: `Benvenuto ${session.user.email}`
               });
           }
       });

       return () => subscription.unsubscribe();
   }, []);

   // Loader management
   React.useEffect(() => {
       if (!initializing) {
           const timer = setTimeout(() => {
               setShowLoader(false);
               PerformanceMonitor.logPageLoad();
           }, 1500);
           
           return () => clearTimeout(timer);
       }
   }, [initializing]);

   // Keyboard shortcuts
   React.useEffect(() => {
       const handleKeyDown = (event) => {
           // Alt + N = New Event
           if (event.altKey && event.key === 'n' && user) {
               event.preventDefault();
               setPage('create');
               PerformanceMonitor.logUserAction('keyboard_shortcut_new_event');
           }
           
           // Alt + H = Home/Feed
           if (event.altKey && event.key === 'h' && user) {
               event.preventDefault();
               setPage('feed');
               PerformanceMonitor.logUserAction('keyboard_shortcut_home');
           }
           
           // Alt + P = Profile
           if (event.altKey && event.key === 'p' && user) {
               event.preventDefault();
               setPage('profile');
               PerformanceMonitor.logUserAction('keyboard_shortcut_profile');
           }
       };

       window.addEventListener('keydown', handleKeyDown);
       return () => window.removeEventListener('keydown', handleKeyDown);
   }, [user]);

   // Sign out handler
   const handleSignOut = async () => {
       try {
           await supabase.auth.signOut();
           setUser(null);
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

   // Theme toggle
   const toggleTheme = () => {
       const newTheme = theme === 'light' ? 'dark' : 'light';
       setTheme(newTheme);
       PerformanceMonitor.logUserAction(`theme_changed_to_${newTheme}`);
       
       window.addNotification?.({
           type: 'info',
           icon: newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun',
           title: 'Tema cambiato',
           message: `Attivato tema ${newTheme === 'dark' ? 'scuro' : 'chiaro'}`
       });
   };

   // Page change handler
   const handlePageChange = (newPage) => {
       if (page !== new Page) {
          setPage(newPage);
          PerformanceMonitor.logUserAction(`page_changed_to_${newPage}`);
      }
  };

  // Show loader if still initializing
  if (initializing || showLoader) {
      return <LoadingScreen isVisible={true} />;
  }

  // Show auth if no user
  if (!user) {
      return (
          <ErrorBoundary>
              <NotificationSystem />
              <Auth supabase={supabase} setUser={setUser} />
              <PWAInstallPrompt />
          </ErrorBoundary>
      );
  }

  // Main app
  return (
      <ErrorBoundary>
          <div className="app-container">
              <NotificationSystem />
              
              {/* Welcome popup for new users */}
              <WelcomePopup user={user} />
              
              {/* Main header */}
              <Header
                  user={user}
                  currentPage={page}
                  setPage={handlePageChange}
                  onSignOut={handleSignOut}
                  theme={theme}
                  onToggleTheme={toggleTheme}
              />
              
              {/* Main content with page transitions */}
              <main className="main-content">
                  <div className="page-transition-enter-active">
                      {page === 'feed' && <EventFeed supabase={supabase} user={user} />}
                      {page === 'create' && <CreateEvent supabase={supabase} user={user} onEventCreated={() => handlePageChange('feed')} />}
                      {page === 'profile' && <ProfilePage supabase={supabase} user={user} theme={theme} onToggleTheme={toggleTheme} />}
                  </div>
              </main>
              
              {/* PWA install prompt */}
              <PWAInstallPrompt />
          </div>
      </ErrorBoundary>
  );
}

// 🔹 APP INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  // Remove initial loader
  const initialLoader = document.getElementById('initial-loader');
  if (initialLoader) {
      setTimeout(() => {
          initialLoader.style.display = 'none';
      }, 2000);
  }

  // Initialize React app
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);

  // Initialize performance monitoring
  PerformanceMonitor.logUserAction('app_initialized');
});

// 🔹 SERVICE WORKER REGISTRATION
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
              console.log('✅ Service Worker registered:', registration.scope);
              
              // Check for updates
              registration.addEventListener('updatefound', () => {
                  const newWorker = registration.installing;
                  newWorker.addEventListener('statechange', () => {
                      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                          window.addNotification?.({
                              type: 'info',
                              icon: 'fas fa-download',
                              title: 'Aggiornamento disponibile',
                              message: 'Ricarica la pagina per la nuova versione!'
                          });
                      }
                  });
              });
          })
          .catch((error) => {
              console.error('❌ Service Worker registration failed:', error);
          });
  });
}

// 🔹 GLOBAL ERROR HANDLING
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  window.addNotification?.({
      type: 'error',
      icon: 'fas fa-exclamation-triangle',
      title: 'Errore imprevisto',
      message: 'Si è verificato un problema. Prova a ricaricare la pagina.'
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  window.addNotification?.({
      type: 'error',
      icon: 'fas fa-exclamation-triangle',
      title: 'Errore di connessione',
      message: 'Problema di rete o server. Riprova tra poco.'
  });
});

// 🔹 PERFORMANCE MONITORING
if ('performance' in window && 'PerformanceObserver' in window) {
  // Monitor largest contentful paint
  new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
              console.log('📊 LCP:', entry.startTime);
          }
      }
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Monitor first input delay
  new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
              console.log('📊 FID:', entry.processingStart - entry.startTime);
          }
      }
  }).observe({ entryTypes: ['first-input'] });
}

// 🔹 EXPORT FOR DEBUGGING
window.SocialSpot = {
  supabase,
  PerformanceMonitor,
  version: '2.0.0'
};

console.log('🚀 SocialSpot v2.0 initialized successfully!');
