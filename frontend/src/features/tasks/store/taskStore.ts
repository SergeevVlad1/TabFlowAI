import { create } from "zustand";
import { persist } from "zustand/middleware";
import { handleRequest, MethodEnum } from "../../../shared/api";

export interface Task {
	id: string;
	title: string;
	description?: string;
	priority: "high" | "medium" | "low";
	deadline?: number; // timestamp
	completed: boolean;
	createdAt: number;
	estimatedTime: number; // in minutes
	timeSpent: number; // in milliseconds
	isRunning: boolean;
}

interface TaskState {
	tasks: Task[];
	activeTaskId: string | null;
	addTask: (
		task: Omit<
			Task,
			"id" | "createdAt" | "completed" | "timeSpent" | "isRunning"
		>,
	) => void;
	toggleTask: (id: string) => void;
	deleteTask: (id: string) => void;
	updateTask: (id: string, updates: Partial<Task>) => void;
	startTask: (id: string) => void;
	pauseTask: (id: string) => void;
	tickTask: (id: string, ms: number) => void;
	getTasksByPriority: () => Task[];
	showTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskState>()(
	persist(
		(set, get) => ({
			tasks: [],
			activeTaskId: null,
			addTask: async (taskData) => {
				const response = await handleRequest<
					Task,
					Omit<
						Task,
						| "id"
						| "createdAt"
						| "completed"
						| "timeSpent"
						| "isRunning"
					>
				>({
					url: "/tasks",
					method: MethodEnum.POST,
					data: taskData,
				});
				if (response) {
					set((state) => ({ tasks: [...state.tasks, response] }));
				}
			},
			toggleTask: (id) =>
				set((state) => {
					const task = state.tasks.find((t) => t.id === id);
					const newCompleted = !task?.completed;
					const isNowActive = state.activeTaskId === id;

					return {
						activeTaskId:
							isNowActive && newCompleted
								? null
								: state.activeTaskId,
						tasks: state.tasks.map((t) =>
							t.id === id
								? {
										...t,
										completed: newCompleted,
										isRunning: newCompleted
											? false
											: t.isRunning,
									}
								: t,
						),
					};
				}),
			showTasks: async () => {
				const response = await handleRequest<Task[]>({
					url: "/tasks",
					method: MethodEnum.GET,
				});
				if (response) {
					set({ tasks: response });
				}
			},
			deleteTask: (id) =>
				set((state) => ({
					tasks: state.tasks.filter((t) => t.id !== id),
					activeTaskId:
						state.activeTaskId === id ? null : state.activeTaskId,
				})),
			updateTask: (id, updates) =>
				set((state) => ({
					tasks: state.tasks.map((t) =>
						t.id === id ? { ...t, ...updates } : t,
					),
				})),
			startTask: (id) =>
				set((state) => ({
					activeTaskId: id,
					tasks: state.tasks.map((t) =>
						// Pause others, start this one
						t.id === id
							? { ...t, isRunning: true }
							: { ...t, isRunning: false },
					),
				})),
			pauseTask: (id) =>
				set((state) => ({
					activeTaskId: null,
					tasks: state.tasks.map((t) =>
						t.id === id ? { ...t, isRunning: false } : t,
					),
				})),
			tickTask: (id, ms) =>
				set((state) => {
					const tasks = state.tasks.map((t) => {
						if (t.id === id) {
							const newTimeSpent = t.timeSpent + ms;
							const limitMs = t.estimatedTime * 60 * 1000;

							// If we reached or exceeded the limit, stop the timer
							if (newTimeSpent >= limitMs) {
								return {
									...t,
									timeSpent: limitMs,
									isRunning: false,
								};
							}
							return { ...t, timeSpent: newTimeSpent };
						}
						return t;
					});

					// If the task was stopped because it reached the limit, clear activeTaskId
					const updatedTask = tasks.find((t) => t.id === id);
					const activeTaskId =
						updatedTask && !updatedTask.isRunning
							? null
							: state.activeTaskId;

					return { tasks, activeTaskId };
				}),
			getTasksByPriority: () => {
				const priorityOrder = { high: 0, medium: 1, low: 2 };
				return [...get().tasks].sort(
					(a, b) =>
						priorityOrder[a.priority] - priorityOrder[b.priority],
				);
			},
		}),
		{
			name: "task-storage",
		},
	),
);
