import type { SimplifiedTab } from "../popup.types";

export const getAllTabs = async (): Promise<chrome.tabs.Tab[]> => {
	return new Promise<chrome.tabs.Tab[]>((resolve) => {
		if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
			chrome.tabs.query({}, (tabs) => resolve(tabs));
		} else {
			console.warn(
				"chrome.tabs API not available. Using mock data for development.",
			);
			// Mock data for development
			resolve([
				{ id: 1, title: "Google", url: "https://google.com" },
				{ id: 2, title: "extensions", url: "chrome://extensions/" },
				{
					id: 3,
					title: "StackOverflow",
					url: "https://stackoverflow.com",
				},
			] as unknown as chrome.tabs.Tab[]);
		}
	});
};

export const groupTabs = async (
	classifiedTabs: SimplifiedTab[],
): Promise<void> => {
	// Для группировки нам нужно знать, в каком окне находится вкладка
	const allChromeTabs = await chrome.tabs.query({});
	const tabIdToWindowId = new Map(allChromeTabs.map(t => [t.id, t.windowId]));

	// Группируем ID вкладок по [windowId][categoryName]
	const windowGroups: Record<number, Record<string, number[]>> = {};

	classifiedTabs.forEach((tab: SimplifiedTab) => {
		if (tab.category && tab.category !== "unnecessary" && typeof tab.id === "number") {
			const windowId = tabIdToWindowId.get(tab.id);
			if (windowId !== undefined) {
				if (!windowGroups[windowId]) windowGroups[windowId] = {};
				if (!windowGroups[windowId][tab.category]) windowGroups[windowId][tab.category] = [];
				windowGroups[windowId][tab.category].push(tab.id);
			}
		}
	});

	// Проходим по каждому окну и создаем группы
	for (const windowIdStr in windowGroups) {
		const windowId = Number(windowIdStr);
		const groups = windowGroups[windowId];

		for (const category in groups) {
			const tabIds = groups[category];
			if (tabIds.length > 0) {
				try {
					const groupId = await chrome.tabs.group({
						tabIds: tabIds as [number, ...number[]],
						createProperties: { windowId }
					});

					await chrome.tabGroups.update(groupId, {
						title: category,
					});
				} catch (error) {
					console.error(`Failed to group tabs in window ${windowId}:`, error);
				}
			}
		}
	}
};

