import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConfigState {
	theme: "light" | "dark";
	setTheme: (theme: "light" | "dark") => void;
	toggleTheme: () => void;
	notificationsEnabled: boolean;
	setNotificationsEnabled: (enabled: boolean) => void;
	aiModel: "gpt-4o" | "gpt-3.5-turbo" | "claude-3-sonnet";
	setAiModel: (model: "gpt-4o" | "gpt-3.5-turbo" | "claude-3-sonnet") => void;
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
			aiModel: "gpt-4o",
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
