import { memo } from "react";
import { Link } from "react-router-dom";
import styles from "./Auth.module.scss";
import { Logo } from "../../shared/ui/logo/Logo";
import { RegisterForm } from "../../features/auth/ui/registerForm";

export const RegisterPage = memo(() => {
	return (
		<div className={styles.authPage}>
			<div className={styles.authCard}>
				<div className={styles.logoHeader}>
					<Logo size={48} />
				</div>
				<h2>Get started</h2>
				<p>Create your TabFlowAI account today</p>

				<RegisterForm />

				<div className={styles.footer}>
					Already have an account? <Link to="/login">Sign in</Link>
				</div>
			</div>
		</div>
	);
});

RegisterPage.displayName = "RegisterPage";
