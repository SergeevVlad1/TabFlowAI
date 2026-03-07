import React, { useState } from 'react';
import { handleRequest, MethodEnum } from '../../shared/api';
import { useNavigate, Link } from 'react-router-dom';
import { PathEnum } from '../../app/routers/routers.types';

export const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await handleRequest({
                url: '/auth/register',
                method: MethodEnum.POST,
                data: { name, email, password },
            });
            if (response && response.ok) {
                navigate(PathEnum.DASHBOARD)
            } else {
                setError('Registration failed');
            }
        } catch (err: any) {
            setError(err.message || 'Error registering');
        }
    };

    return (
        <div className="auth-container p-8 max-w-md mx-auto mt-20 bg-[var(--color-bg-panel)] rounded-2xl shadow-lg border border-[var(--color-border)]">
            <h2 className="text-3xl font-bold mb-6 text-center text-[var(--color-text-primary)]">Create an Account</h2>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="p-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    required
                />
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
                    Register
                </button>
            </form>

            <div className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
                Already have an account? <Link to="/login" className="text-[var(--color-primary)] hover:underline">Login</Link>
            </div>
        </div>
    );
};
