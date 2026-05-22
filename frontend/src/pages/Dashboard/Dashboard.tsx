import React, { useEffect } from "react";
import styles from "./Dashboard.module.scss";
import { useAiStore } from "../../features/ai/store/aiStore";
import { useTaskStore } from "../../features/tasks/store/taskStore";
import { useTrackingStore } from "../../features/tracking/store/trackingStore";
import { aiAgent } from "../../features/ai-agent";
import { Sparkles, Play, Flame, Zap, Target } from "lucide-react";
import clsx from "clsx";
import { Popup } from "../../features/tabs/popup/popup";

export const Dashboard: React.FC = () => {
	const { insights } = useAiStore();
	const { tasks } = useTaskStore();
	const { getDailyDuration } = useTrackingStore();

	useEffect(() => {
		aiAgent.analyze();
	}, []);

	const pendingTasks =
		Array.isArray(tasks) && tasks.filter((t) => !t.completed).length;
	const highPriTasks =
		Array.isArray(tasks) &&
		tasks.filter((t) => !t.completed && t.priority === "high").length;

	return (
		<div className={styles.dashboard}>
			<header className={styles.header}>
				<div className={styles.greeting}>
					<h1>Focus Dashboard</h1>
					<p>Your productivity at a glance</p>
				</div>
				<div className={styles.quickStats}>
					<div className={styles.miniStat}>
						<Flame size={14} className={styles.streakIcon} />
						<span>2 day streak</span>
					</div>
				</div>
			</header>

			<section className={styles.mainAction}>
				<div className={styles.actionCard}>
					<div className={styles.actionInfo}>
						<Target size={24} />
						<div>
							<h3>Ready to focus?</h3>
							<p>Start a session to block distractions</p>
						</div>
					</div>
					<button 
						className={styles.primaryButton}
						onClick={() => useTrackingStore.getState().startSession("focus")}
					>
						<Play size={18} fill="currentColor" />
						<span>Start Session</span>
					</button>
				</div>
			</section>

			<div className={styles.statsRow}>
				<div className={styles.statBox}>
					<span className={styles.statLabel}>Pending</span>
					<span className={styles.statValue}>{pendingTasks}</span>
				</div>
				<div className={styles.statBox}>
					<span className={styles.statLabel}>Priority</span>
					<span className={clsx(styles.statValue, styles.urgent)}>{highPriTasks}</span>
				</div>
				<div className={styles.statBox}>
					<span className={styles.statLabel}>Focused</span>
					<span className={styles.statValue}>{Math.round(getDailyDuration("focus"))}m</span>
				</div>
			</div>

			<section className={styles.insightsSection}>
				<div className={styles.sectionHeader}>
					<h2><Sparkles size={16} /> AI Insights</h2>
					<button className={styles.textLink}>View all</button>
				</div>
				<div className={styles.insightList}>
					{insights.length === 0 ? (
						<div className={styles.emptyInsights}>
							<Zap size={20} />
							<p>Analyze your tabs to get personalized insights</p>
						</div>
					) : (
						insights.slice(0, 2).map((insight) => (
							<div
								key={insight.id}
								className={clsx(styles.insightCard, styles[insight.type])}
							>
								<p>{insight.message}</p>
								{insight.action && (
									<button onClick={insight.action} className={styles.actionBtn}>
										{insight.actionLabel || "Take Action"}
									</button>
								)}
							</div>
						))
					)}
				</div>
			</section>

			<div className={styles.bottomSection}>
				<Popup />
			</div>
		</div>
	);
};

