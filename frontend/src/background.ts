/// <reference types="chrome" />

// ─── Tab Updated ─────────────────────────────────────────────────────────────

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete" && tab.url) {
		console.log(`Tab updated: ${tab.url}`);

		chrome.storage.local.get(
			["blockedDomains"],
			(result: { blockedDomains?: string[] }) => {
				const blocked = result.blockedDomains || [];
				const hostname = new URL(tab.url!).hostname;

				if (blocked.some((domain: string) => hostname.includes(domain))) {
					chrome.tabs.update(tabId, { url: "blocked.html" });
				}
			},
		);
	}
});

// ─── On Install ──────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
	console.log("TabFlowAI Installed");

	// Alarm for optional AI analysis (throttled, won't spam the server)
	chrome.alarms.create("ai-check", { periodInMinutes: 60 });

	// Auto-open side panel on extension icon click
	chrome.sidePanel
		.setPanelBehavior({ openPanelOnActionClick: true })
		.catch((error) => console.error(error));
});

// ─── Alarms ──────────────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name === "ai-check") {
		console.log("Running background AI analysis...");
		// Runs at most once per hour — no server spam
	}
});

// ─── Message Handler ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {

	// Tab grouping via AI backend
	if (message.action === "groupTabs") {
		const { tabs } = message;

		fetch("http://localhost:8000/classify-tabs", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ tabs }),
		})
			.then((response) => response.json())
			.then(async (data) => {
				const { groups } = data;

				for (const [groupName, tabIds] of Object.entries(groups)) {
					if (Array.isArray(tabIds) && tabIds.length > 0) {
						try {
							const groupId = await chrome.tabs.group({
								tabIds: tabIds as [number],
							});
							await chrome.tabGroups.update(groupId, {
								title: groupName,
								color: "blue",
							});
						} catch (err) {
							console.error(`Error grouping tabs for ${groupName}:`, err);
						}
					}
				}
				sendResponse({ success: true });
			})
			.catch((error) => {
				console.error("Error connecting to AI Backend:", error);
				sendResponse({ success: false, error: error.message });
			});

		return true; // Keep channel open for async response
	}

	// Open side panel programmatically
	if (message.action === "openSidePanel") {
		chrome.windows.getCurrent((window) => {
			if (window.id) {
				chrome.sidePanel
					.open({ windowId: window.id })
					.catch((error) =>
						console.error("Failed to open side panel:", error),
					);
			}
		});
		sendResponse({ success: true });
	}
});
