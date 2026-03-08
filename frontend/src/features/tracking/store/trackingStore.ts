import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ActivitySession {
	id: string;
	startTime: number;
	endTime?: number;
	type: "focus" | "break" | "idle";
	label?: string;
}

interface TrackingState {
	sessions: ActivitySession[];
	currentSession: ActivitySession | null;

	startSession: (type: "focus" | "break", label?: string) => void;
	stopSession: () => void;
	getDailyDuration: (type: "focus" | "break") => number; // in minutes
}

export const useTrackingStore = create<TrackingState>()(
	persist(
		(set, get) => ({
			sessions: [],
			currentSession: null,

			startSession: (type, label) => {
				const active = get().currentSession;
				if (active) get().stopSession();

				set({
					currentSession: {
						id: crypto.randomUUID(),
						startTime: Date.now(),
						type,
						label,
					},
				});
			},

			stopSession: () => {
				const active = get().currentSession;
				if (!active) return;

				const finishedSession = { ...active, endTime: Date.now() };
				set((state) => ({
					sessions: [...state.sessions, finishedSession],
					currentSession: null,
				}));
			},

			getDailyDuration: (type) => {
				const now = new Date();
				const startOfDay = new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate(),
				).getTime();

				return get()
					.sessions.filter(
						(s) =>
							s.type === type &&
							s.startTime >= startOfDay &&
							s.endTime,
					)
					.reduce(
						(acc, s) =>
							acc + (s.endTime! - s.startTime) / 1000 / 60,
						0,
					);
			},
		}),
		{ name: "tracking-storage" },
	),
);
