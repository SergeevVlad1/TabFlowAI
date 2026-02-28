/// <reference types="chrome" />

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Logic to check blocked domains could go here
    console.log(`Tab updated: ${tab.url}`);
    
    // Example: Check local storage for blocked domains (async)
    chrome.storage.local.get(['blockedDomains'], (result: { blockedDomains?: string[] }) => {
      const blocked = result.blockedDomains || [];
      const hostname = new URL(tab.url!).hostname;
      
      if (blocked.some((domain: string) => hostname.includes(domain))) {
        chrome.tabs.update(tabId, { url: 'blocked.html' }); // You'd need a blocked.html
      }
    });
  }
});

// Setup alarms for periodic AI checks (mock)
chrome.runtime.onInstalled.addListener(() => {
  console.log('Productivity Extension Installed');
  chrome.alarms.create('ai-check', { periodInMinutes: 60 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'ai-check') {
    console.log('Running background AI analysis...');
    // In a real app, this would analyze usage data stored in chrome.storage
  }
});

// Handle tab grouping requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "groupTabs") {
    const { tabs } = message;
    
    // Отправляем данные на наш Backend
    fetch("http://localhost:8000/classify-tabs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tabs }),
    })
      .then((response) => response.json())
      .then(async (data) => {
        const { groups } = data;
        
        // Создаем группы в браузере
        for (const [groupName, tabIds] of Object.entries(groups)) {
          if (Array.isArray(tabIds) && tabIds.length > 0) {
            try {
              // Создаем группу
              const groupId = await chrome.tabs.group({ tabIds: tabIds as number[] });
              // Настраиваем заголовок и цвет группы
              await chrome.tabGroups.update(groupId, {
                title: groupName,
                color: "blue", // Можно тоже получать от ИИ
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

    return true; // Держим канал открытым для асинхронного ответа
  }
});
