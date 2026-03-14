import React, { useState, useCallback, memo } from "react";
import { useMutation } from "@tanstack/react-query";
import { handleRequest, MethodEnum, type BaseResponse } from "../../shared/api";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Auth.module.scss";
import { Input } from "../../shared/ui/input/input";
import { storage } from "../../shared/api/storage";
import { PathEnum } from "../../app/routers/routers.types";
import { Logo } from "../../shared/ui/Logo/Logo";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

interface LoginResponse extends BaseResponse {
	user_token?: string;
	data?: {
		token?: string;
		user?: {
			id: number;
			email: string;
			name: string;
		};
	};
}

interface LoginCredentials {
	email: string;
	password: string;
}

interface GoogleAuthPayload {
	id_token: string;
}

export const LoginPage = memo(() => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	
	const navigate = useNavigate();

	const loginMutation = useMutation({
		mutationFn: async () => {
			return await handleRequest<LoginResponse, LoginCredentials>({
				url: "/auth/login",
				method: MethodEnum.POST,
				data: { email, password },
			});
		},
		onSuccess: async (data) => {
			if (data.ok) {
				const token = data.user_token || data.data?.token;
				if (token) await storage.set("token", token);
				await storage.set("user_email", email);
				navigate(PathEnum.TASKS);
			} else {
				setError(data.message || "Login failed");
			}
		},
		onError: (err: Error) => {
			setError(err.message || "Error logging in");
		}
	});

	const googleAuthMutation = useMutation({
		mutationFn: async (idToken: string) => {
			return await handleRequest<LoginResponse, GoogleAuthPayload>({
				url: "/auth/google",
				method: MethodEnum.POST,
				data: { id_token: idToken },
			});
		},
		onSuccess: async (data) => {
			if (data.ok) {
				const token = data.user_token || data.data?.token;
				if (token) await storage.set("token", token);
				if (data.data?.user?.email) {
					await storage.set("user_email", data.data.user.email);
				}
				navigate(PathEnum.TASKS);
			} else {
				setError("Google authentication failed on server");
			}
		},
		onError: (err: Error) => {
			setError(err.message || "Failed to authenticate with Google");
		}
	});

	const handleLogin = useCallback((e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		loginMutation.mutate();
	}, [loginMutation]);

	const handleGoogleLogin = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setError("");

		if (typeof chrome === "undefined" || !chrome.identity) {
			setError("Chrome Identity API is not available. Please ensure you are running this in a Chrome Extension context and have reloaded the extension.");
			return;
		}

		try {
			const clientId = GOOGLE_CLIENT_ID;
			const redirectUrl = chrome.identity.getRedirectURL();
			const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
			
			authUrl.searchParams.append("client_id", clientId);
			authUrl.searchParams.append("response_type", "id_token");
			authUrl.searchParams.append("redirect_uri", redirectUrl);
			authUrl.searchParams.append("scope", "openid email profile");
			authUrl.searchParams.append("prompt", "select_account");
			authUrl.searchParams.append("nonce", Math.random().toString(36).substring(2));

			chrome.identity.launchWebAuthFlow(
				{ url: authUrl.toString(), interactive: true },
				(responseUrl) => {
					if (chrome.runtime.lastError || !responseUrl) {
						setError(chrome.runtime.lastError?.message || "Auth flow cancelled");
						return;
					}

					const url = new URL(responseUrl);
					const params = new URLSearchParams(url.hash.substring(1));
					const idToken = params.get("id_token");

					if (idToken) {
						googleAuthMutation.mutate(idToken);
					} else {
						setError("Failed to obtain ID Token from Google");
					}
				}
			);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Google Auth Error";
			setError(message);
		}
	}, [googleAuthMutation]);

	const isLoading = loginMutation.isPending || googleAuthMutation.isPending;

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
						type="button"
						onClick={handleGoogleLogin}
						className={styles.googleBtn}
						disabled={isLoading}
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
						disabled={isLoading}
					/>
					<Input
						label="Password"
						type="password"
						placeholder="••••••••"
						value={password}
						onChange={setPassword}
						required
						fullWidth
						disabled={isLoading}
					/>

					<button 
						type="submit" 
						className={styles.submitBtn}
						disabled={isLoading}
					>
						{isLoading ? "Signing in..." : "Sign in"}
					</button>
				</form>

				<div className={styles.footer}>
					Don't have an account?{" "}
					<Link to="/register">Create one for free</Link>
				</div>
			</div>
		</div>
	);
});

LoginPage.displayName = "LoginPage";
