import { memo } from "react";
import styles from "./Auth.module.scss";
import { Logo } from "../../shared/ui/logo/Logo";
import { LoginForm } from "../../features/auth/ui/loginForm";
import { Link } from "react-router-dom";

export const LoginPage = memo(() => {
	return (
		<div className={styles.authPage}>
			<div className={styles.authCard}>
				<div className={styles.logoHeader}>
					<Logo size={48} />
				</div>
				<h2>Welcome back</h2>
				<p>Log in to your TabFlowAI account</p>

				<LoginForm />
				<div className={styles.footer}>
					Don't have an account?{" "}
					<Link to="/register">Create one for free</Link>
				</div>
			</div>
		</div>
	);
});

LoginPage.displayName = "LoginPage";
