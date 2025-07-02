import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const responseLogin = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: 'include',
                body: new URLSearchParams({ email, password }),
            });

            if (!responseLogin.ok) {
                const errorText = await responseLogin.text();
                throw new Error(errorText || 'Login failed');
            }

            // Fetch current user after login
            const responseCP = await fetch('http://localhost:8080/api/current-player', {
                credentials: 'include',
            });

            if (responseCP.ok) {
                const userData = await responseCP.json();
                if (onLogin) onLogin(userData);
                setSuccessMessage('Login successful');

                // Navigate to game list page (root path)
                navigate('/');

            } else {
                throw new Error('Could not fetch user after login.');
            }
        } catch (error) {
            setErrorMessage(error.message || 'Login failed');
        }
    };

    const handleRegister = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await fetch('http://localhost:8080/api/players', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: 'include',
                body: new URLSearchParams({ email, password }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Registration failed');
            }

            setSuccessMessage('Registration successful. You can now log in.');
        } catch (err) {
            setErrorMessage(err.message || 'Registration failed');
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Login</h2>

            {errorMessage && <p className="login-error">{errorMessage}</p>}
            {successMessage && <p className="login-success">{successMessage}</p>}

            <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                    <label htmlFor="email" className="form-label">
                        Email:
                    </label>
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
                    <label htmlFor="password" className="form-label">
                        Password:
                    </label>
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
                    <button type="submit" className="btn btn-primary">
                        Login
                    </button>
                    <button type="button" onClick={handleRegister} className="btn btn-secondary">
                        Register
                    </button>
                </div>
            </form>
        </div>
    );
}
