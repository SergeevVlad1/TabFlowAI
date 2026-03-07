export const getAllTabs = async () => {
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