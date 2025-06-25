import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login({ onLogin, onLogout }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:8080/api/current-player', {
            credentials: 'include',
        })
            .then(res => {
                if (!res.ok) throw new Error('Not logged in');
                return res.json();
            })
            .then(data => setUser(data))
            .catch(() => setUser(null));

    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: 'include',
                body: new URLSearchParams({ email, password }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Login failed');
            }

            const res = await fetch('http://localhost:8080/api/current-player', {
                credentials: 'include',
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                if (onLogin) onLogin(userData);
                setSuccessMessage('Login successful');
                try {
                    const gpId = await fetchGpId(userData.id);
                    navigate(`/game_view/${gpId}`);
                } catch (err) {
                    console.error('Redirect error:', err);
                    navigate('/leaderboard'); // fallback
                }
            } else {
                throw new Error('Could not fetch user after login.');
            }
        } catch (err) {
            setErrorMessage(err.message || 'Login failed');
        }
    };
    const fetchGpId = async (currentPlayerId) => {
        const res = await fetch('http://localhost:8080/api/games', {
            credentials: 'include',
        });

        if (!res.ok) throw new Error('Failed to fetch games');

        const data = await res.json();
        const allGamePlayers = data.games.flatMap(game => game.gamePlayers);
        const gamePlayer = allGamePlayers.find(gp => gp.player.id === currentPlayerId);

        if (!gamePlayer) throw new Error('No gamePlayer found for this user');

        return gamePlayer.id;
    };
    const handleRegister = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const res = await fetch('http://localhost:8080/api/players', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: 'include',
                body: new URLSearchParams({ email, password }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || 'Registration failed');
            }

            setSuccessMessage('Registration successful. You can now log in.');
        } catch (err) {
            setErrorMessage(err.message || 'Registration failed');
        }
    };

    const handleLogout = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                setUser(null);
                if (onLogout) onLogout();
                setSuccessMessage('Logged out successfully');
                navigate('/login');
            } else {
                throw new Error('Logout failed');
            }
        } catch (err) {
            setErrorMessage(err.message || 'Logout failed');
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Login</h2>

            {errorMessage && <p className="login-error">{errorMessage}</p>}
            {successMessage && <p className="login-success">{successMessage}</p>}

            {!user ? (
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email:</label>
                        <input
                            id="email"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-input"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password:</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-input"
                            placeholder="Enter your password"
                        />
                    </div>

                    <div className="button-group">
                        <button type="submit" className="btn btn-primary">Login</button>
                        <button type="button" onClick={handleRegister} className="btn btn-secondary">Register</button>
                    </div>
                </form>
            ) : (
                <div className="logged-in-info">
                    <p className="welcome-text">Welcome, <strong>{user.email}</strong>!</p>
                    <button type="button" onClick={handleLogout} className="btn btn-logout">Logout</button>
                </div>
            )}
        </div>
    );
}
