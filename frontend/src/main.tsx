import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App.tsx";
import { loadTimerFromStorage } from "./features/tasks/store/taskStore.ts";
import { useTaskStore } from "./features/tasks/store/taskStore.ts";

// ─── Pre-render timer hydration ──────────────────────────────────────────────
async function bootstrap() {
	const saved = await loadTimerFromStorage();
	if (saved) {
		useTaskStore.setState({
			activeTaskId: saved.activeTaskId,
			startTime: saved.startTime,
			baseTime: saved.baseTime,
		});
	}

	ReactDOM.createRoot(document.getElementById("root")!).render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	);
}

bootstrap();
