import { handleRequest, MethodEnum } from "../../../shared/api";

export const SendTabsToAI = async (tabs: chrome.tabs.Tab[], categories: string[]) => {
    const response = await handleRequest({
        url: "/tabs/groups",
        method: MethodEnum.POST,
        data: {
            tabs: tabs.map(t => ({ id: t.id, title: t.title, url: t.url })),
            categories: categories
        },
    });
    return response;
}