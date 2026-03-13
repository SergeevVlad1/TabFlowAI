import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { loadTimerFromStorage } from "./features/tasks/store/taskStore.ts";
import { useTaskStore } from "./features/tasks/store/taskStore.ts";

// ─── Pre-render timer hydration ──────────────────────────────────────────────
// We restore the timer state from chrome.storage.local BEFORE rendering the
// React tree. This guarantees that the very first render already has the correct
// activeTaskId / startTime / baseTime, so there is no "paused" flash.
async function bootstrap() {
	const saved = await loadTimerFromStorage();
	if (saved) {
		// Directly set store state outside of React — safe with Zustand
		useTaskStore.setState({
			activeTaskId: saved.activeTaskId,
			startTime:    saved.startTime,
			baseTime:     saved.baseTime,
		});
	}

	ReactDOM.createRoot(document.getElementById("root")!).render(
		<React.StrictMode>
			<GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID_HERE">
				<App />
			</GoogleOAuthProvider>
		</React.StrictMode>,
	);
}

bootstrap();
