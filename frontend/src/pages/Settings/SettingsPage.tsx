import React, { useState, useEffect } from "react";
import { useConfigStore } from "../../shared/stores/config.store";
import { Switch } from "../../shared/ui/switch/Switch";
import styles from "./SettingsPage.module.scss";
import {
	LogOut,
	Bell,
	Moon,
	Sun,
	Cpu,
	HelpCircle,
	ChevronRight,
	AlertTriangle,
	Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PathEnum } from "../../app/routers/routers.types";
import { storage } from "../../shared/api/storage";

export const SettingsPage: React.FC = () => {
	const {
		theme,
		toggleTheme,
		notificationsEnabled,
		setNotificationsEnabled,
		aiModel,
		setAiModel,
	} = useConfigStore();

	const [name, setName] = useState<string | null>(null);
	const [email, setEmail] = useState<string | null>(null);
	const navigate = useNavigate();
	const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);

	useEffect(() => {
		const fetchUserData = async () => {
			const storedName = await storage.get("user_fullname");
			const storedEmail = await storage.get("user_email");
			setName(storedName);
			setEmail(storedEmail);
		};
		fetchUserData();
	}, []);

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;
		if (isConfirmingLogout) {
			timer = setTimeout(() => setIsConfirmingLogout(false), 3500);
		}
		return () => clearTimeout(timer);
	}, [isConfirmingLogout]);

	const handleLogout = async () => {
		if (!isConfirmingLogout) {
			setIsConfirmingLogout(true);
			return;
		}
		await storage.remove("token");
		navigate(PathEnum.LOGIN);
	};

	return (
		<div className={styles.settingsPage}>
			<header className={styles.header}>
				<h1 className={styles.title}>Settings</h1>
				<p className={styles.subtitle}>
					Personalize your TabFlow AI workspace
				</p>
			</header>

			<div className={styles.content}>
				<section className={styles.section}>
					<div className={styles.profileCard}>
						<div className={styles.avatar}>{name?.[0] || email?.[0]}</div>
						<div className={styles.userInfo}>
							<h3 className={styles.userName}>
								{name}
							</h3>
							<p className={styles.userEmail}>
								{email}
							</p>
						</div>
						<span className={styles.proBadge}>BETA</span>
					</div>
				</section>

				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>Appearance</h2>
					<div className={styles.card}>
						<div
							className={styles.settingItem}
							onClick={toggleTheme}
						>
							<div className={styles.labelGroup}>
								<div className={styles.iconBox}>
									{theme === "dark" ? (
										<Moon size={18} />
									) : (
										<Sun size={18} />
									)}
								</div>
								<div>
									<span className={styles.label}>
										Dark Mode
									</span>
									<p className={styles.description}>
										Toggle dark theme for the interface
									</p>
								</div>
							</div>
							<Switch
								checked={theme === "dark"}
								onChange={toggleTheme}
							/>
						</div>

						<div className={styles.divider} />

						<div className={styles.settingItem}>
							<div className={styles.labelGroup}>
								<div className={styles.iconBox}>
									<Bell size={18} />
								</div>
								<div>
									<span className={styles.label}>
										Notifications
									</span>
									<p className={styles.description}>
										Show reminders and alerts
									</p>
								</div>
							</div>
							<Switch
								checked={notificationsEnabled}
								onChange={setNotificationsEnabled}
							/>
						</div>
					</div>
				</section>

				<section className={styles.section}>
					<div className={styles.labelWithBadge}>
						<h2 className={styles.sectionTitle}>
							Artificial Intelligence
						</h2>
						<span className={styles.betaBadge}>BETA</span>
					</div>
					<div className={styles.card}>
						<div className={styles.settingItem}>
							<div className={styles.labelGroup}>
								<div className={styles.iconBox}>
									<Cpu size={18} />
								</div>
								<div className={styles.textStack}>
									<span className={styles.label}>
										AI Model
									</span>
									<select
										className={styles.select}
										value={aiModel}
										onChange={(e) =>
											setAiModel(e.target.value as any)
										}
									>
										<option value="gemini-2.5-flash">
											Gemini 2.5 Flash (Fast)
										</option>
										<option value="gpt-4o" disabled>
											GPT-4o (Coming Soon)
										</option>
										<option value="claude-3-sonnet" disabled>
											Claude 3.5 Sonnet (Pro)
										</option>
									</select>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>Focus & Sound</h2>
					<div className={styles.card}>
						<div className={styles.settingItem}>
							<div className={styles.labelGroup}>
								<div className={styles.iconBox}>
									<Bell size={18} />
								</div>
								<div>
									<div className={styles.labelWithBadge}>
										<span className={styles.label}>
											Timer Sounds
										</span>
										<span className={styles.soonBadge}>Coming soon</span>
									</div>
									<p className={styles.description}>
										Play sound alert when timer finishes
									</p>
								</div>
							</div>
							<Switch
								checked={false}
								onChange={() => {}}
								disabled
							/>
						</div>
					</div>
				</section>

				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>General</h2>
					<div className={styles.card}>
						<div className={styles.navItem}>
							<div className={styles.labelGroup}>
								<div className={styles.iconBox}>
									<Shield size={18} />
								</div>
								<div className={styles.labelWithBadge}>
									<span className={styles.label}>
										Privacy
									</span>
									<span className={styles.soonBadge}>Coming soon</span>
								</div>
							</div>
							<ChevronRight
								size={16}
								className={styles.chevron}
							/>
						</div>
						<div className={styles.divider} />
						<div className={styles.helpItem}>
							<div className={styles.labelGroup}>
								<div className={styles.iconBox}>
									<HelpCircle size={18} />
								</div>
								<div>
									<span className={styles.label}>
										Help Center
									</span>
									<p className={styles.helpText}>
										Found a bug or have a suggestion?<br/>
										Email us: <a href="mailto:svv.kaz@gmail.com">svv.kaz@gmail.com</a>
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				<div className={styles.authActions}>
					<button
						className={`${styles.logoutBtn} ${isConfirmingLogout ? styles.confirming : ""}`}
						onClick={handleLogout}
					>
						{isConfirmingLogout ? (
							<>
								<AlertTriangle size={18} />
								<span>Are you absolutely sure?</span>
							</>
						) : (
							<>
								<LogOut size={18} />
								<span>Log Out</span>
							</>
						)}
					</button>
				</div>

				<footer className={styles.footer}>
					<p>TabFlow AI v1.0.1 - Made with ❤️</p>
				</footer>
			</div>
		</div>
	);
};
