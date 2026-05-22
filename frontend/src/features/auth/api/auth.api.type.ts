import type { BaseResponse } from "../../../shared/api";

export interface RegisterCredentials {
	name: string;
	email: string;
	password: string;
}

export type LoginCredentials = Omit<RegisterCredentials, "name">;

export interface LoginResponse extends BaseResponse {
	user_token?: string;
	data?: {
		token?: string;
		user?: {
			id: number;
			email: string;
			name: string;
		};
	};
}

export interface GoogleAuthPayload {
	id_token: string;
}
