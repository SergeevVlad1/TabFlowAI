import React, { useEffect } from "react";
import styles from "./Layout.module.scss";
import clsx from "clsx";
import {
	CheckSquare,
	BarChart3,
	Settings,
} from "lucide-react";
import { useConfigStore } from "../../../shared/stores/config.store";
import { AiChat } from "../../ai-chat";
import { useNavigate } from "react-router-dom";
import { PathEnum } from "../../../app/routers/routers.types";
import { Logo } from "../../../shared/ui/Logo/Logo";

interface LayoutProps {
	children: React.ReactNode;
	activeTab: "tasks" | "stats" | "settings";
	onTabChange: (tab: "tasks" | "stats" | "settings") => void;
}

export const Layout: React.FC<LayoutProps> = ({
	children,
	activeTab,
	onTabChange,
}) => {
	const { theme } = useConfigStore();
	const navigate = useNavigate();

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
	}, [theme]);

	const handleChangeNavigate = (
		tab: "tasks" | "stats" | "settings",
		path: PathEnum,
	) => {
		navigate(path);
		onTabChange(tab);
	};

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<div className={styles.topRow}>
					<div className={styles.brand}>
						<Logo size={28} />
						<span className={styles.brandName}>TabFlow</span>
					</div>

					<nav className={styles.navGroup}>
						<button
							className={clsx(styles.navLink, {
								[styles.active]: activeTab === "tasks",
							})}
							onClick={() =>
								handleChangeNavigate("tasks", PathEnum.TASKS)
							}
						>
							<CheckSquare size={18} strokeWidth={2.5} />
							<span>Tasks</span>
						</button>
						<button
							className={clsx(styles.navLink, {
								[styles.active]: activeTab === "stats",
							})}
							onClick={() =>
								handleChangeNavigate("stats", PathEnum.STATS)
							}
						>
							<BarChart3 size={18} strokeWidth={2.5} />
							<span>Stats</span>
						</button>
					</nav>

					<div className={styles.headerActions}>
						<button
							className={clsx(styles.iconButton, {
								[styles.active]: activeTab === "settings",
							})}
							onClick={() =>
								handleChangeNavigate(
									"settings",
									PathEnum.SETTINGS,
								)
							}
							title="Settings"
						>
							<Settings size={18} />
						</button>
					</div>
				</div>
			</header>

			<main className={styles.main}>
				<div className={styles.contentWrapper}>
					<div className={styles.content}>{children}</div>
				</div>

				<div className={styles.chatSection}>
					<AiChat />
				</div>
			</main>
		</div>
	);
};
