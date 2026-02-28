import { useEffect } from "react";

import { useState } from "react";

export const Popup = () => {
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);
  useEffect(() => {
    const fetchTabs = async () => {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      setTabs(tabs);
    };
    fetchTabs();
  }, []);

  const handleGroupTabs = () => {
    const simplifiedTabs = tabs?.map((tab) => ({
      id: tab.id,
      title: tab.title,
      url: tab.url,
    })).filter(tab => tab.id !== undefined);

    chrome.runtime.sendMessage({
      action: "groupTabs",
      tabs: simplifiedTabs,
    }, (response) => {
      if (response?.success) {
        console.log("Tabs grouped successfully");
      } else {
        console.error("Failed to group tabs", response?.error);
      }
    });
  };

  return (
    <div style={{ padding: "16px", width: "300px" }}>
      <h3>Tab Manager AI</h3>
      <p>Click to automatically group your tabs using AI classification.</p>
      <button 
        onClick={handleGroupTabs}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "var(--primary-color, #007bff)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Group Tabs Now
      </button>
      <div style={{ marginTop: "12px", fontSize: "12px", color: "#666" }}>
        Found {tabs.length} tabs in current window
      </div>
    </div>
  );
};
