import type { SimplifiedTab } from "../popup/popup.types";

export const processTabsData = (
	tabs: chrome.tabs.Tab[],
	categories: string[],
): { simplified: SimplifiedTab[]; categories: string[] } => {
	const simplified: SimplifiedTab[] = tabs
		.filter((tab) => !!tab.url)
		.map((tab) => ({
			id: tab.id,
			title: tab.title || "",
			url: tab.url || "",
		}));

	return { simplified, categories };
};
