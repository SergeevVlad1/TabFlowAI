import { useMutation } from "@tanstack/react-query";
import { processTabsData } from "../services/services";
// Проверьте правильность пути к функции отправки и стору
import { SendTabsToAI } from "../sendTabsToAi/sendTabsToAi"; 
import { useTabStore } from "../../../shared/stores/popup.store";

interface OrganizeTabsParams {
    tabs: chrome.tabs.Tab[];
    categories: string[];
}

export const useOrganizeTabsMutation = () => {
    const setModalState = useTabStore(s => s.setModalState);
    
    return useMutation({
        mutationFn: async ({ tabs, categories }: OrganizeTabsParams) => {
            const data = processTabsData(tabs, categories);
            return await SendTabsToAI(data.simplified, data.categories);
        },
        onMutate: () => setModalState("sending"),
        onSuccess: () => setModalState("closed"),
        onError: (error) => {
            console.error("AI Error:", error);
            setModalState("selecting_param");
        }
    });
};
