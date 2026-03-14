/**
 * Robust storage utility that works both in Chrome Extension context
 * and in regular browser context (for development).
 */

const isChromeStorageAvailable = (): boolean =>
	typeof chrome !== "undefined" &&
	!!chrome.storage &&
	!!chrome.storage.local;

export const storage = {
	get: async (key: string): Promise<string | null> => {
		try {
			if (isChromeStorageAvailable()) {
				const result = await chrome.storage.local.get(key);
				return (result[key] as string) ?? null;
			}
		} catch {
			console.warn("chrome.storage.local unavailable, falling back to localStorage");
		}
		return localStorage.getItem(key);
	},

	set: async (key: string, value: string): Promise<void> => {
		try {
			if (isChromeStorageAvailable()) {
				await chrome.storage.local.set({ [key]: value });
				return;
			}
		} catch {
			console.warn("chrome.storage.local unavailable, falling back to localStorage");
		}
		localStorage.setItem(key, value);
	},

	remove: async (key: string): Promise<void> => {
		try {
			if (isChromeStorageAvailable()) {
				await chrome.storage.local.remove(key);
				return;
			}
		} catch {
			console.warn("chrome.storage.local unavailable, falling back to localStorage");
		}
		localStorage.removeItem(key);
	},
};
