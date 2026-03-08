/**
 * Robust storage utility that works both in Chrome Extension context
 * and in regular browser context (for development).
 */

export const storage = {
  get: async (key: string): Promise<any> => {
    try {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        const result = await chrome.storage.local.get(key);
        return result[key];
      }
    } catch (e) {
      console.warn(
        "chrome.storage.local is not available, falling back to localStorage",
      );
    }
    return localStorage.getItem(key);
  },

  set: async (key: string, value: any): Promise<void> => {
    try {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        await chrome.storage.local.set({ [key]: value });
        return;
      }
    } catch (e) {
      console.warn(
        "chrome.storage.local is not available, falling back to localStorage",
      );
    }
    localStorage.setItem(key, value);
  },

  remove: async (key: string): Promise<void> => {
    try {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        await chrome.storage.local.remove(key);
        return;
      }
    } catch (e) {
      console.warn(
        "chrome.storage.local is not available, falling back to localStorage",
      );
    }
    localStorage.removeItem(key);
  },
};
