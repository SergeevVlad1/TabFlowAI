import React, { useState } from 'react';
import { handleRequest, MethodEnum } from '../../shared/api';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Auth.module.scss';

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
                setError('Login failed. Please check your credentials.');
            }
        } catch (err: any) {
            setError(err.message || 'Error logging in');
        }
    };

    const handleGoogleLogin = async () => {
        console.log("Not fully implemented: Google OAuth flow");
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <h2>Welcome back</h2>
                <p>Log in to your TabFlowAI account</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                        Sign in
                    </button>
                </form>

                <div className={styles.divider}>OR</div>

                <button onClick={handleGoogleLogin} className={styles.googleBtn}>
                    <img src="https://www.google.com/favicon.ico" alt="Google" />
                    Continue with Google
                </button>

                <div className={styles.footer}>
                    Don't have an account? <Link to="/register">Create one for free</Link>
                </div>
            </div>
        </div>
    );
};
