/*
 * file: app.js - SocialSpot Aggiornato
 * Implementa tutte le nuove funzionalità richieste:
 * - Header con logo + hamburger menu
 * - SideMenu per impostazioni
 * - Correzione conteggi eventi
 * - Lista eventi creati nel profilo
 * - Chat di gruppo eventi
 * - Popup benvenuto solo primo accesso
 */

// 🔹 Supabase configurato con i TUOI dati
const SUPABASE_URL = 'https://wsmjnssfmujdfgthyizw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbWpuc3NmbXVqZGZndGh5aXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4ODA3NjIsImV4cCI6MjA2NjQ1Njc2Mn0.t91X-fGIolFBPnhr5_sexJMqzgdCDmXuEUXiL_pFId4';

// Inizializza il client Supabase globale
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🔹 WELCOME POPUP COMPONENT
function WelcomePopup({ user, onClose }) {
    const [showPopup, setShowPopup] = React.useState(false);

    React.useEffect(() => {
        // Controlla se è il primo accesso dell'utente
        const hasSeenWelcome = localStorage.getItem(`welcomed_${user.id}`);
        if (!hasSeenWelcome) {
            setShowPopup(true);
        }
    }, [user.id]);

    const handleClose = () => {
        // Segna che l'utente ha visto il popup
        localStorage.setItem(`welcomed_${user.id}`, 'true');
        setShowPopup(false);
        if (onClose) onClose();
    };

    if (!showPopup) return null;

    return (
        <div className="welcome-popup-overlay">
            <div className="welcome-popup">
                <div className="welcome-header">
                    <div className="logo-icon">
                        <span className="logo-text">SS</span>
                    </div>
                    <h2>Benvenuto in SocialSpot! 🎉</h2>
                    <p>Siamo felici di averti nella nostra community!</p>
                </div>
                <div className="welcome-content">
                    <div className="welcome-features">
                        <div className="feature-item">
                            <i className="fas fa-calendar-plus"></i>
                            <h3>Crea Eventi</h3>
                            <p>Organizza eventi e invita persone della tua zona</p>
                        </div>
                        <div className="feature-item">
                            <i className="fas fa-users"></i>
                            <h3>Partecipa</h3>
                            <p>Scopri eventi interessanti e conosci nuove persone</p>
                        </div>
                        <div className="feature-item">
                            <i className="fas fa-comments"></i>
                            <h3>Chatta</h3>
                            <p>Comunica con altri partecipanti nelle chat di gruppo</p>
                        </div>
                    </div>
                </div>
                <button className="btn-primary welcome-btn" onClick={handleClose}>
                    <i className="fas fa-rocket"></i>
                    Inizia a esplorare!
                </button>
            </div>
        </div>
    );
}

// 🔹 SIDE MENU COMPONENT
function SideMenu({ isOpen, onClose, user, onSignOut, theme, onToggleTheme }) {
    const menuItems = [
        { icon: 'fas fa-user', label: 'Profilo', action: 'profile' },
        { icon: 'fas fa-calendar-alt', label: 'I miei eventi', action: 'my-events' },
        { icon: 'fas fa-star', label: 'Preferiti', action: 'favorites' },
        { icon: 'fas fa-cog', label: 'Impostazioni', action: 'settings' },
        { icon: 'fas fa-info-circle', label: 'Info', action: 'info' },
        { icon: 'fas fa-sign-out-alt', label: 'Logout', action: 'logout' }
    ];

    const handleMenuClick = (action) => {
        switch (action) {
            case 'logout':
                onSignOut();
                break;
            case 'settings':
                // Mostra pannello impostazioni inline
                break;
            default:
                console.log(`Azione ${action} non ancora implementata`);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="side-menu-overlay" onClick={onClose}></div>
            <div className="side-menu">
                <div className="side-menu-header">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user.email[0].toUpperCase()}
                        </div>
                        <div className="user-details">
                            <h3>{user.email}</h3>
                            <p>Membro di SocialSpot</p>
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
                                className="menu-item"
                                onClick={() => handleMenuClick(item.action)}
                            >
                                <i className={item.icon}></i>
                                <span>{item.label}</span>
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        ))}
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
                    <p>SocialSpot v1.0</p>
                    <p>Connetti • Scopri • Partecipa</p>
                </div>
            </div>
        </>
    );
}

// 🔹 HEADER COMPONENT AGGIORNATO
function Header({ user, currentPage, setPage, onSignOut, theme, onToggleTheme }) {
    const [sideMenuOpen, setSideMenuOpen] = React.useState(false);

    return (
        <>
            <header className="main-header">
                <div className="header-container">
                    {/* Hamburger Menu */}
                    <button 
                        className="hamburger-menu"
                        onClick={() => setSideMenuOpen(true)}
                        aria-label="Menu"
                    >
                        <i className="fas fa-bars"></i>
                    </button>

                    {/* Logo App */}
                    <div className="app-logo-header">
                        <div className="logo-icon">
                            <span className="logo-text">SS</span>
                        </div>
                        <span className="app-name">SocialSpot</span>
                    </div>

                    {/* Navigation Links (Desktop) */}
                    <nav className="header-nav">
                        <button 
                            className={`nav-btn ${currentPage === 'feed' ? 'active' : ''}`}
                            onClick={() => setPage('feed')}
                        >
                            <i className="fas fa-home"></i>
                            <span>Eventi</span>
                        </button>
                        <button 
                            className={`nav-btn ${currentPage === 'create' ? 'active' : ''}`}
                            onClick={() => setPage('create')}
                        >
                            <i className="fas fa-plus"></i>
                            <span>Crea</span>
                        </button>
                        <button 
                            className={`nav-btn ${currentPage === 'profile' ? 'active' : ''}`}
                            onClick={() => setPage('profile')}
                        >
                            <i className="fas fa-user"></i>
                            <span>Profilo</span>
                        </button>
                    </nav>
                </div>
            </header>

            {/* Side Menu */}
            <SideMenu 
                isOpen={sideMenuOpen}
                onClose={() => setSideMenuOpen(false)}
                user={user}
                onSignOut={onSignOut}
                theme={theme}
                onToggleTheme={onToggleTheme}
            />
        </>
    );
}

// 🔹 MAIN APP COMPONENT
function App() {
    const [user, setUser] = React.useState(null);
    const [page, setPage] = React.useState('feed');
    const [initializing, setInitializing] = React.useState(true);
    const [theme, setTheme] = React.useState(() => {
        const stored = localStorage.getItem('theme');
        if (stored) return stored;
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    React.useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setInitializing(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    React.useEffect(() => {
        if (!initializing) {
            const loader = document.getElementById('initial-loader');
            if (loader) loader.style.display = 'none';
        }
    }, [initializing]);

    async function handleSignOut() {
        await supabase.auth.signOut();
        setUser(null);
        setPage('feed');
    }

    function toggleTheme() {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }

    if (initializing) return null;

    if (!user) {
        return <Auth supabase={supabase} setUser={setUser} />;
    }

    return (
        <div className="app-container">
            {/* Welcome Popup - solo primo accesso */}
            <WelcomePopup user={user} />
            
            {/* Header con logo + hamburger menu */}
            <Header
                user={user}
                currentPage={page}
                setPage={setPage}
                onSignOut={handleSignOut}
                theme={theme}
                onToggleTheme={toggleTheme}
            />
            
            {/* Main Content */}
            <main className="main-content">
                {page === 'feed' && <EventFeed supabase={supabase} user={user} />}
                {page === 'create' && <CreateEvent supabase={supabase} user={user} onEventCreated={() => setPage('feed')} />}
                {page === 'profile' && <ProfilePage supabase={supabase} user={user} theme={theme} onToggleTheme={toggleTheme} />}
            </main>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
