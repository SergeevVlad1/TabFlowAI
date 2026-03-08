import { create } from "zustand";

export interface Insight {
	id: string;
	type: "optimization" | "warning" | "kudos";
	message: string;
	action?: () => void;
	actionLabel?: string;
	createdAt: number;
}

interface AiState {
	insights: Insight[];
	addInsight: (insight: Omit<Insight, "id" | "createdAt">) => void;
	clearInsights: () => void;
}

export const useAiStore = create<AiState>((set) => ({
	insights: [],
	addInsight: (insight) =>
		set((state) => ({
			insights: [
				{ ...insight, id: crypto.randomUUID(), createdAt: Date.now() },
				...state.insights,
			],
		})),
	clearInsights: () => set({ insights: [] }),
}));
