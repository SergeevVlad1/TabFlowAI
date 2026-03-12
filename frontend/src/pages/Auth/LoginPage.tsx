import React, { useState } from "react";
import { handleRequest, MethodEnum } from "../../shared/api";
import type { BaseResponse } from "../../shared/api";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Auth.module.scss";
import { Input } from "../../shared/ui/input/input";
import { storage } from "../../shared/api/storage";
import { PathEnum } from "../../app/routers/routers.types";
import { Logo } from "../../shared/ui/Logo/Logo";

export const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const response = await handleRequest<BaseResponse, any>({
				url: "/auth/login",
				method: MethodEnum.POST,
				data: { email, password },
			});
			if (response && response.ok) {
				await storage.set('user_email', email)
				navigate(PathEnum.TASKS);
			} else {
				setError("Login failed. Please check your credentials.");
			}
		} catch (err: any) {
			setError(err.message || "Error logging in");
		}
	};

	const handleGoogleLogin = async () => {
		console.log("Not fully implemented: Google OAuth flow");
	};

	return (
		<div className={styles.authPage}>
			<div className={styles.authCard}>
				<div className={styles.logoHeader}>
					<Logo size={48} />
				</div>
				<h2>Welcome back</h2>
				<p>Log in to your TabFlowAI account</p>

				{error && <div className={styles.error}>{error}</div>}

				<form onSubmit={handleLogin} className={styles.form}>
					<button
						onClick={handleGoogleLogin}
						className={styles.googleBtn}
					>
						<img
							src="https://www.google.com/favicon.ico"
							alt="Google"
						/>
						Continue with Google
					</button>
					<div className={styles.divider}>Or continue with</div>
					<Input
						label="Email Address"
						type="email"
						placeholder="name@company.com"
						value={email}
						onChange={setEmail}
						required
						fullWidth
					/>
					<Input
						label="Password"
						type="password"
						placeholder="••••••••"
						value={password}
						onChange={setPassword}
						required
						fullWidth
					/>

					<button type="submit" className={styles.submitBtn}>
						Sign in
					</button>
				</form>

				<div className={styles.footer}>
					Don't have an account?{" "}
					<Link to="/register">Create one for free</Link>
				</div>
			</div>
		</div>
	);
};
