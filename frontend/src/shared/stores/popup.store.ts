import { create } from "zustand";
import { getAllTabs } from "../../features/tabs/popup/utils/getAllTabs";

export type CategoryType =
	| "work"
	| "study"
	| "entertainment"
	| "finance"
	| "shopping"
	| "news"
	| "social"
	| "development"
	| "productivity"
	| "health"
	| "travel"
	| "design"
	| "other";
export type ModalState = "closed" | "selecting_param" | "sending";

interface TabStore {
	tabs: chrome.tabs.Tab[];
	loading: boolean;
	modalState: ModalState;
	selectedCategories: CategoryType[];

	fetchTabs: () => Promise<void>;
	setModalState: (state: ModalState) => void;
	toggleCategory: (category: CategoryType) => void;
	setSelectedCategories: (categories: CategoryType[]) => void;
	reset: () => void;
}

const DEFAULT_CATEGORIES: CategoryType[] = [
	"work",
	"study",
	"entertainment",
	"finance",
	"shopping",
	"news",
	"social",
	"development",
	"productivity",
	"health",
	"travel",
	"design",
	"other",
];

export const useTabStore = create<TabStore>((set, get) => ({
	tabs: [],
	loading: false,
	modalState: "closed",
	selectedCategories: DEFAULT_CATEGORIES,

	fetchTabs: async () => {
		set({ loading: true });
		try {
			const allTabs = await getAllTabs();
			set({ tabs: allTabs });
		} catch (err) {
			console.error("Failed to fetch tabs:", err);
		} finally {
			set({ loading: false });
		}
	},

	setModalState: (state) => set({ modalState: state }),

	toggleCategory: (category) => {
		const { selectedCategories } = get();
		const newCategories = selectedCategories.includes(category)
			? selectedCategories.filter((c) => c !== category)
			: [...selectedCategories, category];
		set({ selectedCategories: newCategories });
	},

	setSelectedCategories: (categories) =>
		set({ selectedCategories: categories }),

	reset: () =>
		set({
			modalState: "closed",
			selectedCategories: DEFAULT_CATEGORIES,
		}),
}));

export const useSimplifiedTabs = () => {
	const tabs = useTabStore((state) => state.tabs);
	return tabs
		.filter((tab) => tab.url !== undefined)
		.map((tab) => ({
			id: tab.id,
			title: tab.title ?? "",
			url: tab.url ?? "",
			favIconUrl: tab.favIconUrl,
		}));
};
