import React from "react";
import { useTrackingStore } from "../../features/tracking/store/trackingStore";
import { useTabStore } from "../../features/tabs/store/tabStore";
import { useTaskStore } from "../../features/tasks/store/taskStore";
import { useTasksQuery } from "../../features/tasks/tasks.hooks";
import styles from "./StatsPage.module.scss";
import { Activity, ShieldCheck, Clock, Zap, ListTodo, CheckCircle2 } from "lucide-react";

export const StatsPage: React.FC = () => {
	const { sessions } = useTrackingStore();
	const { blockedDomains } = useTabStore();
	const { data: tasks } = useTasksQuery();

	const activeTaskId = useTaskStore((state) => state.activeTaskId);
	const startTime = useTaskStore((state) => state.startTime);

	const [, _setTick] = React.useState(0);
	React.useEffect(() => {
		let interval: ReturnType<typeof setInterval>;
		if (activeTaskId) {
			interval = setInterval(() => _setTick(t => t + 1), 1000);
		}
		return () => clearInterval(interval);
	}, [activeTaskId]);

	// const focusTime = getDailyDuration("focus");

	const totalTasks = tasks?.length || 0;
	const completedTasks = tasks?.filter(t => t.completed).length || 0;

	const calculateTotalTime = () => {
		let total = tasks?.reduce((acc, t) => acc + t.timeSpent, 0) || 0;
		if (activeTaskId && startTime) {
			total += (Date.now() - startTime);
		}
		return total / 1000 / 60; // in minutes
	};

	const totalTimeSpentMin = calculateTotalTime();

	return (
		<div className={styles.statsPage}>
			<div className={styles.card}>
				<h2>
					<Activity
						size={20}
						style={{ verticalAlign: "text-bottom", marginRight: 8 }}
					/>{" "}
					Statistics
				</h2>

				<div className={styles.statsGrid}>
					<div className={styles.statItem}>
						<span className={styles.statLabel}>
							<Clock size={14} /> Task Time
						</span>
						<span className={styles.statValue}>
							{Math.floor(totalTimeSpentMin / 60)}h {Math.floor(totalTimeSpentMin % 60)}m
						</span>
					</div>
					<div className={styles.statItem}>
						<span className={styles.statLabel}>
							<Zap size={14} /> Sessions
						</span>
						<span className={styles.statValue}>
							{sessions.length}
						</span>
					</div>

					<div className={styles.statItem}>
						<span className={styles.statLabel}>
							<ListTodo size={14} /> Total Tasks
						</span>
						<span className={styles.statValue}>
							{totalTasks}
						</span>
					</div>

					<div className={styles.statItem}>
						<span className={styles.statLabel}>
							<CheckCircle2 size={14} /> Completed
						</span>
						<span className={styles.statValue}>
							{completedTasks}
						</span>
					</div>
				</div>
			</div>

			<div className={styles.card}>
				<h3>
					<ShieldCheck
						size={18}
						style={{ verticalAlign: "text-bottom", marginRight: 8 }}
					/>{" "}
					Productivity Rules
				</h3>
				<p className={styles.statLabel}>
					Blocked Domains ({blockedDomains.length})
				</p>
				<ul className={styles.list}>
					{blockedDomains.map((d) => (
						<li key={d}>{d}</li>
					))}
					{blockedDomains.length === 0 && (
						<li
							style={{
								borderStyle: "dashed",
								background: "transparent",
							}}
						>
							No domains blocked yet
						</li>
					)}
				</ul>
			</div>
		</div>
	);
};
