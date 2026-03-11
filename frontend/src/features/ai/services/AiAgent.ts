import { useTaskStore } from "../../tasks/store/taskStore";
import { useTabStore } from "../../tabs/store/tabStore";
import { useTrackingStore } from "../../tracking/store/trackingStore";
import { useAiStore } from "../store/aiStore";

class ProductivityAiAgent {
	public analyze() {
		this.analyzeTabs();
		this.analyzeTasks();
		this.analyzeWorkSessions();
	}

	private analyzeTabs() {
		const { tabs, groups } = useTabStore.getState();
		const { addInsight } = useAiStore.getState();

		if (tabs.length > 8 && groups.length === 0) {
			addInsight({
				type: "optimization",
				message: `You have ${tabs.length} tabs open. Consider grouping them by topic to reduce cognitive load.`,
				actionLabel: "Group Tabs",
				action: () => console.log("Action: Group Tabs triggered"), // In real app, open modal
			});
		}

		const socialMediaTabs = tabs.filter(
			(t) =>
				t.url.includes("facebook.com") ||
				t.url.includes("twitter.com") ||
				t.url.includes("youtube.com"),
		);
		if (socialMediaTabs.length > 2) {
			addInsight({
				type: "warning",
				message:
					"High distraction potential detected. You have multiple social media tabs open.",
				actionLabel: "Focus Mode",
				action: () => console.log("Action: Focus Mode"),
			});
		}
	}

	private analyzeTasks() {
		const { tasks } = useTaskStore.getState();
		const { addInsight } = useAiStore.getState();
		const highPriTasks = tasks.filter(
			(t) => t.priority === "high" && !t.completed,
		);

		if (highPriTasks.length > 2) {
			addInsight({
				type: "warning",
				message: `You have ${highPriTasks.length} high priority tasks pending. Focus on " ${highPriTasks[0].title} " first.`,
			});
		}
	}

	private analyzeWorkSessions() {
		const { currentSession, getDailyDuration } =
			useTrackingStore.getState();
		const { addInsight } = useAiStore.getState();

		if (currentSession && currentSession.type === "focus") {
			const durationMin =
				(Date.now() - currentSession.startTime) / 1000 / 60;
			if (durationMin > 50) {
				addInsight({
					type: "kudos",
					message:
						"Great focus session! You have been working for over 50 minutes. Time for a short break?",
					actionLabel: "Take Break",
					action: () =>
						useTrackingStore.getState().startSession("break"),
				});
			}
		}

		const focusTime = getDailyDuration("focus");
		if (focusTime < 30 && new Date().getHours() > 14) {
			addInsight({
				type: "optimization",
				message:
					"Your focus time is low today. Try the Pomodoro technique for the next hour.",
			});
		}
	}
}

export const aiAgent = new ProductivityAiAgent();
