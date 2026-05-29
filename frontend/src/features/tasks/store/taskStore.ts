import { create } from "zustand";

export interface Task {
	id: string;
	title: string;
	priority: "high" | "medium" | "low";
	time?: number;
	completed: boolean;
	completed_at?: string;
	createdAt: number;
	estimatedTime: number; // minutes
	timeSpent: number;     // milliseconds (last value synced to DB)
	isRunning: boolean;
}


const TIMER_STORAGE_KEY = "tabflow_active_timer";

export interface PersistedTimerState {
	activeTaskId: string;
	startTime:    number; // epoch ms — when Play was pressed
	baseTime:     number; // ms already accumulated before this session
}

export function persistTimerToStorage(state: PersistedTimerState | null): void {
	if (typeof chrome === "undefined" || !chrome.storage) return;
	if (state === null) {
		chrome.storage.local.remove(TIMER_STORAGE_KEY);
	} else {
		chrome.storage.local.set({ [TIMER_STORAGE_KEY]: state });
	}
}

/**
 * Read the persisted timer state.
 * Called ONCE in main.tsx before the React tree is rendered,
 * so every component already sees the correct timer on first paint.
 */
export function loadTimerFromStorage(): Promise<PersistedTimerState | null> {
	return new Promise((resolve) => {
		if (typeof chrome === "undefined" || !chrome.storage) {
			resolve(null);
			return;
		}
		chrome.storage.local.get([TIMER_STORAGE_KEY], (result) => {
			resolve((result[TIMER_STORAGE_KEY] as PersistedTimerState) ?? null);
		});
	});
}

// ─── Zustand store ────────────────────────────────────────────────────────────

interface TaskState {
	tasks:        Task[];
	loading:      boolean;
	error:        string | null;

	// Timer fields — populated by main.tsx hydration OR by startTask()
	activeTaskId: string | null;
	startTime:    number | null; // epoch ms when Play was pressed this session
	baseTime:     number;        // ms already accumulated before this session

	startTask: (id: string, currentSpent: number) => void;
	pauseTask: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
	tasks:        [],
	activeTaskId: null,
	startTime:    null,
	baseTime:     0,
	loading:      false,
	error:        null,

	startTask: (id, currentSpent) => {
		const startTime = Date.now();
		const baseTime  = currentSpent ?? 0;
		set({ activeTaskId: id, startTime, baseTime });

		// Single write to local storage — no server request
		persistTimerToStorage({ activeTaskId: id, startTime, baseTime });
	},

	pauseTask: () => {
		set({ activeTaskId: null, startTime: null, baseTime: 0 });

		// Clear the persisted session — nothing is running any more
		persistTimerToStorage(null);
	},
}));
