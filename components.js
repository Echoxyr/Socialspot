// 🔹 AUTH UNIFICATO E CORRETTO
const Auth = React.memo(({ supabase, setUser }) => {
const [isSignIn, setIsSignIn] = React.useState(true);
const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    fullName: '',
    interests: []
});
const [error, setError] = React.useState(null);
const [loading, setLoading] = React.useState(false);
const [passwordStrength, setPasswordStrength] = React.useState(0);

const calculatePasswordStrength = React.useCallback((password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
}, []);

React.useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formData.password));
}, [formData.password, calculatePasswordStrength]);

const handleInputChange = (field, value) => {
    setFormData(prev => ({
        ...prev,
        [field]: value
    }));
    setError(null);
};

const handleInterestToggle = (interest) => {
    setFormData(prev => ({
        ...prev,
        interests: prev.interests.includes(interest)
            ? prev.interests.filter(i => i !== interest)
            : [...prev.interests, interest]
    }));
};

const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
        let result;
        if (isSignIn) {
            result = await supabase.auth.signInWithPassword({ 
                email: formData.email, 
                password: formData.password 
            });
        } else {
            // Validazione signup
            if (!formData.fullName.trim()) {
                setError('Inserisci il nome completo');
                setLoading(false);
                return;
            }
            if (formData.interests.length === 0) {
                setError('Seleziona almeno un interesse');
                setLoading(false);
                return;
            }
            
            // Signup
            result = await supabase.auth.signUp({ 
                email: formData.email, 
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName.trim(),
                        interests: formData.interests
                    }
                }
            });
            
            // Crea profilo SOLO se signup OK
            if (result.data?.user && !result.error) {
                try {
                    const profileData = {
                        id: result.data.user.id,
                        username: formData.fullName.trim(),
                        interests: formData.interests,
                        location: '',
                        bio: '',
                        avatar_url: null
                    };
                    
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert(profileData);
                        
                    if (profileError) {
                        console.error('Errore creazione profilo:', profileError);
                        // Non blocchiamo il login per questo
                    }
                } catch (profileErr) {
                    console.error('Errore inserimento profilo:', profileErr);
                    // Non blocchiamo il login
                }
            }
        }
        
        if (result.error) {
            setError(result.error.message);
        } else if (result.data.user) {
            setUser(result.data.user);
            window.addNotification?.({
                type: 'success',
                icon: 'fas fa-check-circle',
                title: isSignIn ? 'Accesso effettuato!' : 'Registrazione completata!',
                message: isSignIn ? 'Bentornato!' : 'Benvenuto in SocialSpot!'
            });
        }
    } catch (err) {
        console.error('Auth error:', err);
        setError('Errore di connessione. Riprova.');
    } finally {
        setLoading(false);
    }
};

const availableInterests = [
    'Sport', 'Musica', 'Cinema', 'Tecnologia', 'Cucina', 
    'Viaggi', 'Arte', 'Lettura', 'Gaming', 'Fitness',
    'Fotografia', 'Moda', 'Nature'
];

return (
    <div className="auth-container">
        <div className="auth-card">
            <div className="auth-header">
                <div className="logo">SN</div>
                <h1>SocialSpot</h1>
                <p>Connetti, Crea, Condividi</p>
            </div>

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
                    <label>Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Il tuo indirizzo email"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="La tua password"
                        required
                    />
                    {!isSignIn && formData.password && (
                        <div className="password-strength">
                            <div 
                                className="strength-bar" 
                                style={{ width: `${passwordStrength}%` }}
                            ></div>
                            <span className="strength-text">
                                {passwordStrength < 50 ? 'Debole' : passwordStrength < 80 ? 'Media' : 'Forte'}
                            </span>
                        </div>
                    )}
                </div>

                {!isSignIn && (
                    <>
                        <div className="form-group">
                            <label>Nome completo</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                placeholder="Il tuo nome completo"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Interessi ({formData.interests.length}/5)</label>
                            <div className="interests-grid">
                                {availableInterests.map(interest => (
                                    <button
                                        key={interest}
                                        type="button"
                                        className={`interest-tag ${
                                            formData.interests.includes(interest) ? 'selected' : ''
                                        }`}
                                        onClick={() => handleInterestToggle(interest)}
                                        disabled={
                                            !formData.interests.includes(interest) && 
                                            formData.interests.length >= 5
                                        }
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {error && (
                    <div className="error-message">
                        <i className="fas fa-exclamation-triangle"></i>
                        {error}
                    </div>
                )}

                <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            {isSignIn ? 'Accesso...' : 'Registrazione...'}
                        </>
                    ) : (
                        <>
                            <i className={`fas ${isSignIn ? 'fa-sign-in-alt' : 'fa-user-plus'}`}></i>
                            {isSignIn ? 'Accedi' : 'Registrati'}
                        </>
                    )}
                </button>
            </form>
        </div>
    </div>
);
});
