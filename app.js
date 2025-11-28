const SUPABASE_URL = 'https://ctixzrxyyqpumzwmyjyo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aXh6cnh5eXFwdW16d215anlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTYzNDQsImV4cCI6MjA3OTU5MjM0NH0.k8HDt4WbU6RwMktolucWc1dekPwfbOk853o7AABRt4o';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🔹 PERFORMANCE MONITORING
const PerformanceMonitor = {
    startTime: performance.now(),
    
    logPageLoad() {
        const loadTime = performance.now() - this.startTime;
        console.log(`🚀 SocialSpot loaded in ${loadTime.toFixed(2)}ms`);
        
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

// 🔹 BRAND MARK COMPONENT
function LogoMark({ className = '' }) {
    return (
        <div className={`logo-mark ${className}`.trim()} aria-hidden="true">
            <i className="fas fa-search"></i>
            <i className="fas fa-map-marker-alt logo-pin"></i>
        </div>
    );
}

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
                        <LogoMark />
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
                    <i className="fas fa-handshake"></i>
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
        
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);
    
    const removeNotification = React.useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
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
                           <LogoMark />
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
            <div className="loader-content">
                <div className="app-logo-loading">
                    <div className="logo-icon-loading">
                        <LogoMark />
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
               <WelcomePopup user={user} />
               
               <Header
                   user={user}
                   currentPage={page}
                   setPage={handlePageChange}
                   onSignOut={handleSignOut}
                   theme={theme}
                   onToggleTheme={toggleTheme}
               />
               
               <main className="main-content">
                   <div className="page-transition-enter-active">
                       {page === 'feed' && <EventFeed supabase={supabase} user={user} />}
                       {page === 'create' && <CreateEvent supabase={supabase} user={user} onEventCreated={() => handlePageChange('feed')} />}
                       {page === 'profile' && <ProfilePage supabase={supabase} user={user} theme={theme} onToggleTheme={toggleTheme} />}
                   </div>
               </main>
               
               <PWAInstallPrompt />
           </div>
       </ErrorBoundary>
   );
}

document.addEventListener('DOMContentLoaded', () => {
function initializeApp() {
   const initialLoader = document.getElementById('initial-loader');
   if (initialLoader) {
       setTimeout(() => {
           initialLoader.style.display = 'none';
       }, 2000);
   }

   const root = ReactDOM.createRoot(document.getElementById('root'));
   const rootElement = document.getElementById('root');
   if (!rootElement || rootElement.dataset.initialized) return;

   rootElement.dataset.initialized = 'true';
   const root = ReactDOM.createRoot(rootElement);
   root.render(<App />);

   PerformanceMonitor.logUserAction('app_initialized');
});
}

if (document.readyState === 'loading') {
   document.addEventListener('DOMContentLoaded', initializeApp, { once: true });
} else {
   initializeApp();
}

if ('serviceWorker' in navigator) {
   window.addEventListener('load', () => {
       navigator.serviceWorker.register('/sw.js')
           .then((registration) => {
               console.log('✅ Service Worker registered:', registration.scope);
               
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
