import { handleRequest, MethodEnum, type BaseResponse } from "../../../shared/api";
import type { SimplifiedTab } from "../popup/popup.types";

interface TabsGroupsResponse extends BaseResponse {
	data: SimplifiedTab[];
}

export const SendTabsToAI = async (
	tabs: SimplifiedTab[],
	categories: string[],
): Promise<SimplifiedTab[]> => {
	const response = await handleRequest<TabsGroupsResponse, any>({
		url: "/tabs/groups",
		method: MethodEnum.POST,
		data: {
			tabs,
			categories,
		},
	});
	return response.data;
};

