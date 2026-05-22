import { Controller, useForm } from "react-hook-form";
import { Input } from "../../../shared/ui/input/input";
import styles from "../../../pages/Auth/Auth.module.scss";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "../../../shared/ui/form/form";
import { useRegisterMutation } from "../api/auth.api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const RegisterForm = () => {
	const registerSchema = z.object({
		name: z
			.string()
			.min(3, "Name is too short")
			.max(20, "Name is too long"),
		email: z.string().email("Invalid email"),
		password: z
			.string()
			.min(6, "Password must be at least 6 characters long"),
	});

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(registerSchema),
		mode: "onChange",
	});

	const navigate = useNavigate();

	const [error, setError] = useState<string>("");
	const registerMutation = useRegisterMutation(navigate, setError);
	const isLoading = registerMutation.isPending;

	const onSubmit = (data: z.infer<typeof registerSchema>) => {
		registerMutation.mutate(data);
	};

	return (
		<>
			<Form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
				{error && <div className={styles.error}>{error}</div>}
				<Controller
					name="name"
					control={control}
					render={({ field }) => (
						<Input
							label="Full Name"
							type="text"
							placeholder="John Doe"
							fullWidth
							disabled={isLoading}
							onChange={field.onChange}
							error={errors.name?.message}
						/>
					)}
				/>
				<Controller
					name="email"
					control={control}
					render={({ field }) => (
						<Input
							label="Email"
							type="email"
							placeholder="name@company.com"
							fullWidth
							disabled={isLoading}
							onChange={field.onChange}
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
							fullWidth
							disabled={isLoading}
							onChange={field.onChange}
							error={errors.password?.message}
						/>
					)}
				/>
				<button
					type="submit"
					disabled={isLoading}
					className={styles.submitBtn}
				>
					{isLoading ? (
						<span className={styles.loadingText}>
							<span>Creating</span>
							<span className={styles.loadingDots}>
								<span>.</span>
								<span>.</span>
								<span>.</span>
							</span>
						</span>
					) : (
						"Create account"
					)}
				</button>
			</Form>
		</>
	);
};
