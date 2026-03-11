import React, { useState } from "react";
import { handleRequest, MethodEnum } from "../../shared/api";
import type { BaseResponse } from "../../shared/api";
import { useNavigate, Link } from "react-router-dom";
import { PathEnum } from "../../app/routers/routers.types";
import styles from "./Auth.module.scss";
import { Input } from "../../shared/ui/input/input";
import { storage } from "../../shared/api/storage";
import { Logo } from "../../shared/ui/Logo/Logo";

export const RegisterPage = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const response = await handleRequest<BaseResponse, any>({
				url: "/auth/register",
				method: MethodEnum.POST,
				data: { name, email, password },
			});
			if (response && response.ok) {
				await storage.set('user_email', email)
				await storage.set('user_fullname', name)
				navigate(PathEnum.DASHBOARD);
			} else {
				setError("Registration failed. Please try again.");
			}
		} catch (err: any) {
			setError(err.message || "Error registering");
		}
	};

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
					/>
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
						Create account
					</button>
				</form>

				<div className={styles.footer}>
					Already have an account? <Link to="/login">Sign in</Link>
				</div>
			</div>
		</div>
	);
};
