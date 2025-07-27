/*
 * file: app.js
 * Inizializza Supabase, gestisce lo stato utente, il tema (light/dark) e le pagine principali (feed, creazione evento, profilo).
 * Questa è l'entrypoint dell'applicazione; le componenti sono definite in components.js.
 */

// Sostituire con le proprie credenziali Supabase
const SUPABASE_URL = 'INSERISCI_LA_TUA_URL_SUPABASE';
const SUPABASE_ANON_KEY = 'INSERISCI_LA_TUA_ANON_KEY';

// Inizializza il client Supabase globale
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function App() {
    const [user, setUser] = React.useState(null);
    const [page, setPage] = React.useState('feed');
    const [initializing, setInitializing] = React.useState(true);
    const [theme, setTheme] = React.useState(() => {
        // Carica tema da localStorage o utilizza preferenza media
        const stored = localStorage.getItem('theme');
        if (stored) return stored;
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    // Gestisce il tema applicando un attributo data-theme al body
    React.useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Gestisce l'inizializzazione e le sessioni utente
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

    // Nasconde lo spinner iniziale una volta che l'app è pronta
    React.useEffect(() => {
        if (!initializing) {
            const loader = document.getElementById('initial-loader');
            if (loader) loader.style.display = 'none';
        }
    }, [initializing]);

    async function handleSignOut() {
        await supabase.auth.signOut();
        setUser(null);
    }

    // Gestore per cambiare tema
    function toggleTheme() {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }

    if (initializing) return null;

    // Se non loggato mostra la pagina di autenticazione
    if (!user) {
        return <Auth supabase={supabase} setUser={setUser} />;
    }

    return (
        <div className="app-container">
            <Navbar
                user={user}
                currentPage={page}
                setPage={setPage}
                onSignOut={handleSignOut}
                onToggleTheme={toggleTheme}
                theme={theme}
            />
            {/* Mostra un componente Gamification sul profilo */}
            {page === 'feed' && <EventFeed supabase={supabase} user={user} />}
            {page === 'create' && <CreateEvent supabase={supabase} user={user} onEventCreated={() => setPage('feed')} />}
            {page === 'profile' && <ProfilePage supabase={supabase} user={user} theme={theme} onToggleTheme={toggleTheme} />}
        </div>
    );
}

// Render dell'applicazione principale
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
