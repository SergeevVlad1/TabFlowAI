// stores/tabStore.ts
import { create } from 'zustand';
import { getAllTabs } from '../../features/tabs/getAllTabs/getAllTabs';
import { SendTabsToAI } from '../../features/tabs/sendTabsToAi/sendTabsToAi';

export type Category = 'work' | 'study' | 'entertainment' | 'finance' | 'other';
export type ModalState = 'closed' | 'selecting_param' | 'sending';

interface TabStore {
  // Состояние
  tabs: chrome.tabs.Tab[];
  loading: boolean;
  modalState: ModalState;
  selectedCategories: Category[];
  
  // Методы
  fetchTabs: () => Promise<void>;
  setModalState: (state: ModalState) => void;
  toggleCategory: (category: Category) => void;
  setSelectedCategories: (categories: Category[]) => void;
  processTabsWithAI: () => Promise<void>;
  reset: () => void;
}

const DEFAULT_CATEGORIES: Category[] = ['work', 'study', 'entertainment', 'finance', 'other'];

export const useTabStore = create<TabStore>((set, get) => ({
  // Начальное состояние
  tabs: [],
  loading: false,
  modalState: 'closed',
  selectedCategories: DEFAULT_CATEGORIES,

  // Методы
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
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    set({ selectedCategories: newCategories });
  },

  setSelectedCategories: (categories) => set({ selectedCategories: categories }),

  processTabsWithAI: async () => {
    const { tabs, selectedCategories } = get();
    
    const simplifiedTabs = tabs
      ?.map((tab) => ({
        id: tab.id,
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl,
      }))
      .filter((tab): tab is chrome.tabs.Tab => tab.url !== undefined);

    if (!simplifiedTabs || simplifiedTabs.length === 0) {
      console.warn("No tabs found to process.");
      return;
    }

    set({ modalState: 'sending' });
    
    try {
      await SendTabsToAI(simplifiedTabs, selectedCategories);
      set({ modalState: 'closed' });
    } catch (error) {
      console.error("Failed to process tabs:", error);
      set({ modalState: 'selecting_param' }); // Возвращаем на шаг выбора при ошибке
    }
  },

  reset: () => set({ 
    modalState: 'closed', 
    selectedCategories: DEFAULT_CATEGORIES 
  }),
}));

// Селекторы для оптимизации
export const useSimplifiedTabs = () => {
  const tabs = useTabStore(state => state.tabs);
  return tabs
    ?.map((tab) => ({
      id: tab.id,
      title: tab.title,
      url: tab.url,
      favIconUrl: tab.favIconUrl,
    }))
    .filter((tab): tab is chrome.tabs.Tab => tab.url !== undefined);
};