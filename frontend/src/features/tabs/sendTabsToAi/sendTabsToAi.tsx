import { handleRequest, MethodEnum } from "../../../shared/api";
import type { SimplifiedTab } from "../popup/popup.types";

export const SendTabsToAI = async (
	tabs: SimplifiedTab[],
	categories: string[],
): Promise<SimplifiedTab[]> => {
	const response = await handleRequest<SimplifiedTab[], any>({
		url: "/tabs/groups",
		method: MethodEnum.POST,
		data: {
			tabs,
			categories,
		},
	});
	return response;
};
