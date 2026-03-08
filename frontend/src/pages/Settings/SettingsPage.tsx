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

	const navigate = useNavigate();

	const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);

	useEffect(() => {
		let timer: any;
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
				<h1 className={styles.title}>Настройки</h1>
				<p className={styles.subtitle}>
					Персонализируйте свое пространство TabFlow AI
				</p>
			</header>

			<div className={styles.content}>
				{/* User Section */}
				<section className={styles.section}>
					<div className={styles.profileCard}>
						<div className={styles.avatar}>S</div>
						<div className={styles.userInfo}>
							<h3 className={styles.userName}>
								Sergey Vladimirovich
							</h3>
							<p className={styles.userEmail}>
								sergey@tabflow.ai
							</p>
						</div>
						<span className={styles.proBadge}>PRO</span>
					</div>
				</section>

				{/* Theme & Display */}
				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>Оформление</h2>
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
										Темная тема
									</span>
									<p className={styles.description}>
										Переключить оформление интерфейса
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
										Уведомления
									</span>
									<p className={styles.description}>
										Показывать напоминания и алерты
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

				{/* AI Preferences */}
				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>
						Искусственный интеллект
					</h2>
					<div className={styles.card}>
						<div className={styles.settingItem}>
							<div className={styles.labelGroup}>
								<div className={styles.iconBox}>
									<Cpu size={18} />
								</div>
								<div className={styles.textStack}>
									<span className={styles.label}>
										Модель ИИ
									</span>
									<select
										className={styles.select}
										value={aiModel}
										onChange={(e) =>
											setAiModel(e.target.value as any)
										}
									>
										<option value="gpt-4o">
											GPT-4o (Самый умный)
										</option>
										<option value="gpt-3.5-turbo">
											GPT-3.5 Turbo (Быстрый)
										</option>
										<option value="claude-3-sonnet">
											Claude 3.5 Sonnet
										</option>
									</select>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Additional Settings */}
				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>Прочее</h2>
					<div className={styles.card}>
						<div className={styles.navItem}>
							<div className={styles.labelGroup}>
								<div className={styles.iconBox}>
									<Shield size={18} />
								</div>
								<span className={styles.label}>
									Конфиденциальность
								</span>
							</div>
							<ChevronRight
								size={16}
								className={styles.chevron}
							/>
						</div>
						<div className={styles.divider} />
						<div className={styles.navItem}>
							<div className={styles.labelGroup}>
								<div className={styles.iconBox}>
									<HelpCircle size={18} />
								</div>
								<span className={styles.label}>
									Центр помощи
								</span>
							</div>
							<ChevronRight
								size={16}
								className={styles.chevron}
							/>
						</div>
					</div>
				</section>

				{/* Logout Button */}
				<div className={styles.authActions}>
					<button
						className={`${styles.logoutBtn} ${isConfirmingLogout ? styles.confirming : ""}`}
						onClick={handleLogout}
					>
						{isConfirmingLogout ? (
							<>
								<AlertTriangle size={18} />
								<span>Вы точно уверены?</span>
							</>
						) : (
							<>
								<LogOut size={18} />
								<span>Выйти из аккаунта</span>
							</>
						)}
					</button>
				</div>

				<footer className={styles.footer}>
					<p>TabFlow AI v1.0.0 — Сделано с любовью</p>
				</footer>
			</div>
		</div>
	);
};
