import React, { useState } from 'react';
import { handleRequest, MethodEnum } from '../../shared/api';
import { useNavigate, Link } from 'react-router-dom';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await handleRequest({
                url: '/auth/login',
                method: MethodEnum.POST,
                data: { email, password },
            });
            if (response && response.ok) {
                navigate('/');
            } else {
                setError('Login failed');
            }
        } catch (err: any) {
            setError(err.message || 'Error logging in');
        }
    };

    const handleGoogleLogin = async () => {
        // Placeholder for Google OAuth logic
        console.log("Not fully implemented: Google OAuth flow");
    };

    return (
        <div className="auth-container p-8 max-w-md mx-auto mt-20 bg-[var(--color-bg-panel)] rounded-2xl shadow-lg border border-[var(--color-border)]">
            <h2 className="text-3xl font-bold mb-6 text-center text-[var(--color-text-primary)]">Login to TabFlowAI</h2>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="p-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    required
                />
                <button type="submit" className="p-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                    Login
                </button>
            </form>

            <div className="mt-6">
                <button
                    onClick={handleGoogleLogin}
                    className="w-full p-3 bg-white text-gray-800 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition-colors flex justify-center items-center gap-2"
                >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    Continue with Google
                </button>
            </div>

            <div className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
                Don't have an account? <Link to="/register" className="text-[var(--color-primary)] hover:underline">Register</Link>
            </div>
        </div>
    );
};
