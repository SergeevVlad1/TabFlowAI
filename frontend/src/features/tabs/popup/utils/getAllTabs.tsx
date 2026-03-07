import type { SimplifiedTab } from "../popup.types";

export const getAllTabs = async (): Promise<chrome.tabs.Tab[]> => {
  return new Promise<chrome.tabs.Tab[]>((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({}, (tabs) => resolve(tabs));
    } else {
      console.warn("chrome.tabs API not available. Using mock data for development.");
      // Mock data for development
      resolve([
        { id: 1, title: "Google", url: "https://google.com" },
        { id: 2, title: "GitHub", url: "https://github.com" },
        { id: 3, title: "StackOverflow", url: "https://stackoverflow.com" },
      ] as unknown as chrome.tabs.Tab[]);
    }
  });
};

export const groupTabs = async (classifiedTabs: SimplifiedTab[]): Promise<void> => {
  const groups: Record<string, number[]> = {};

  classifiedTabs.forEach((tab: SimplifiedTab) => {
    if (tab.category && typeof tab.id === 'number') {
      if (!groups[tab.category]) {
        groups[tab.category] = [];
      }
      groups[tab.category].push(tab.id);
    }
  });

  for (const category in groups) {
    const tabIds = groups[category];
    if (tabIds.length > 0) {
      try {
        const groupId = await chrome.tabs.group({
          tabIds: tabIds as [number, ...number[]]
        });

        await chrome.tabGroups.update(groupId, {
          title: category
        });
      } catch (error) {
        console.error(`Failed to group tabs for category ${category}:`, error);
      }
    }
  }
};