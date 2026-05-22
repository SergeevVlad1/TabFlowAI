import { Controller, useForm } from "react-hook-form";
import { Form } from "../../../shared/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { usehandleGoogleLogin, useLoginMutation } from "../api/auth.api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../pages/Auth/Auth.module.scss";
import { Input } from "../../../shared/ui/input/input";

export const LoginForm = () => {
	const loginSchema = z.object({
		email: z.email("Invalid email").min(5, "Name is too short"),
		password: z
			.string()
			.min(6, "Password must be at least 6 characters long"),
	});
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(loginSchema),
		mode: "onChange",
	});
	const [error, setError] = useState<string>("");

	const navigate = useNavigate();
	const loginMutation = useLoginMutation(navigate, setError);
	const isLoading = loginMutation.isPending;
	const { login, googleIsLoading } = usehandleGoogleLogin(navigate, setError);

	const onSubmit = (data: z.infer<typeof loginSchema>) => {
		loginMutation.mutate(data);
	};

	return (
		<Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
			{error && <div className={styles.error}>{error}</div>}

			<button
				type="button"
				onClick={login}
				className={styles.googleBtn}
				disabled={isLoading}
			>
				<img src="https://www.google.com/favicon.ico" alt="Google" />
				Continue with Google
			</button>
			<div className={styles.divider}>Or continue with</div>
			<Controller
				name="email"
				control={control}
				render={({ field }) => (
					<Input
						label="Email Address"
						type="email"
						placeholder="name@company.com"
						onChange={field.onChange}
						required
						fullWidth
						value={field.value}
						error={errors.email?.message}
					/>
				)}
			/>

			<Controller
				name="password"
				control={control}
				render={({ field }) => (
					<Input
						label="Password"
						type="password"
						placeholder="••••••••"
						onChange={field.onChange}
						required
						value={field.value}
						fullWidth
						error={errors.password?.message}
					/>
				)}
			/>

			<button
				type="submit"
				className={styles.submitBtn}
				disabled={isLoading}
			>
				{isLoading ? (
					<span className={styles.loadingText}>
						<span>Signing in</span>
						<span className={styles.loadingDots}>
							<span>.</span>
							<span>.</span>
							<span>.</span>
						</span>
					</span>
				) : (
					"Sign in"
				)}
			</button>
		</Form>
	);
};
