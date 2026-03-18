import { handleRequest, MethodEnum } from "../../../shared/api";
import type { SimplifiedTab } from "../popup/popup.types";

interface TabsGroupsResponse {
	data: SimplifiedTab[];
}

interface TabsGroupsRequest {
	tabs: SimplifiedTab[];
	categories: string[];
}

export const SendTabsToAI = async (
	tabs: SimplifiedTab[],
	categories: string[],
): Promise<SimplifiedTab[]> => {
	const response = await handleRequest<TabsGroupsResponse, TabsGroupsRequest>({
		url: "/tabs/groups",
		method: MethodEnum.POST,
		data: {
			tabs,
			categories,
		},
	});

	if (Array.isArray(response)) return response;
	if (response && Array.isArray(response.data)) return response.data;
	
	return [];
};