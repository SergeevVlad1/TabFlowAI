import { handleRequest, MethodEnum, type BaseResponse } from "../../../shared/api";
import type { SimplifiedTab } from "../popup/popup.types";

interface TabsGroupsResponse extends BaseResponse {
	data: SimplifiedTab[];
}

export const SendTabsToAI = async (
	tabs: SimplifiedTab[],
	categories: string[],
): Promise<SimplifiedTab[]> => {
	const response = await handleRequest<any, any>({
		url: "/tabs/groups",
		method: MethodEnum.POST,
		data: {
			tabs,
			categories,
		},
	});

	// Гибкая проверка формата ответа: массив или объект с полем data
	if (Array.isArray(response)) return response;
	if (response && Array.isArray(response.data)) return response.data;
	
	return [];
};


