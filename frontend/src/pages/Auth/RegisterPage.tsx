import React, { useState, memo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { handleRequest, MethodEnum, type BaseResponse } from "../../shared/api";
import { useNavigate, Link } from "react-router-dom";
import { PathEnum } from "../../app/routers/routers.types";
import styles from "./Auth.module.scss";
import { Input } from "../../shared/ui/input/input";
import { storage } from "../../shared/api/storage";
import { Logo } from "../../shared/ui/Logo/Logo";

interface RegisterCredentials {
	name: string;
	email: string;
	password: string;
}

export const RegisterPage = memo(() => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const registerMutation = useMutation({
		mutationFn: async () => {
			return await handleRequest<BaseResponse, RegisterCredentials>({
				url: "/auth/register",
				method: MethodEnum.POST,
				data: { name, email, password },
			});
		},
		onSuccess: async (data) => {
			if (data.ok) {
				await storage.set("user_email", email);
				await storage.set("user_fullname", name);
				navigate(PathEnum.TASKS);
			} else {
				setError("Registration failed. Please try again.");
			}
		},
		onError: (err: Error) => {
			setError(err.message || "Error registering");
		},
	});

	const handleRegister = useCallback((e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		registerMutation.mutate();
	}, [registerMutation]);

	const isLoading = registerMutation.isPending;

	return (
		<div className={styles.authPage}>
			<div className={styles.authCard}>
				<div className={styles.logoHeader}>
					<Logo size={48} />
				</div>
				<h2>Get started</h2>
				<p>Create your TabFlowAI account today</p>

				{error && <div className={styles.error}>{error}</div>}

				<form onSubmit={handleRegister} className={styles.form}>
					<Input
						label="Full Name"
						type="text"
						placeholder="John Doe"
						value={name}
						onChange={setName}
						required
						fullWidth
						disabled={isLoading}
					/>
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
						{isLoading ? "Creating..." : "Create account"}
					</button>
				</form>

				<div className={styles.footer}>
					Already have an account? <Link to="/login">Sign in</Link>
				</div>
			</div>
		</div>
	);
});

RegisterPage.displayName = "RegisterPage";
