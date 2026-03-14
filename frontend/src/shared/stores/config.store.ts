import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConfigState {
	theme: "light" | "dark";
	setTheme: (theme: "light" | "dark") => void;
	toggleTheme: () => void;
	notificationsEnabled: boolean;
	setNotificationsEnabled: (enabled: boolean) => void;
	aiModel: "gemini-2.5-flash" | "gpt-4o" | "claude-3-sonnet";
	setAiModel: (model: "gemini-2.5-flash" | "gpt-4o" | "claude-3-sonnet") => void;
}

export const useConfigStore = create<ConfigState>()(
	persist(
		(set) => ({
			theme: "light",
			setTheme: (theme) => {
				set({ theme });
				document.documentElement.setAttribute("data-theme", theme);
			},
			toggleTheme: () =>
				set((state) => {
					const newTheme = state.theme === "light" ? "dark" : "light";
					document.documentElement.setAttribute(
						"data-theme",
						newTheme,
					);
					return { theme: newTheme };
				}),
			notificationsEnabled: true,
			setNotificationsEnabled: (notificationsEnabled) =>
				set({ notificationsEnabled }),
			aiModel: "gemini-2.5-flash",
			setAiModel: (aiModel) => set({ aiModel }),
		}),
		{
			name: "tabflow-config",
			onRehydrateStorage: () => (state) => {
				if (state) {
					document.documentElement.setAttribute(
						"data-theme",
						state.theme,
					);
				}
			},
		},
	),
);
