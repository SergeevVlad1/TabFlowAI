export interface SimplifiedTab {
	id?: number;
	title?: string;
	url?: string;
	favIconUrl?: string;
	category?: string;
}

export interface Category {
	id: string;
	name: string;
	icon?: string;
	color?: string;
}

export type ModalState = "closed" | "selecting" | "sending";

export interface AIResponse {
	success: boolean;
	groupedTabs?: Record<string, number[]>; // categoryId -> tabIds
	error?: string;
}
