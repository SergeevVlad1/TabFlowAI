export const SendTabsToAI = async (tabs: chrome.tabs.Tab[]) => {
    const response = await fetch('/api/group-tabs/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tabs }),
    });
    return await response.json();
}