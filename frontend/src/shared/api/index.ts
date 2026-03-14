import axios, { type AxiosError } from "axios";
import { storage } from "./storage";

export const baseURL =
	import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export enum MethodEnum {
	GET = "GET",
	POST = "POST",
	PUT = "PUT",
	DELETE = "DELETE",
	PATCH = "PATCH",
}

export interface BaseResponse {
	ok: boolean;
	message?: string;
	user_token?: string;
	error?: {
		code?: number;
		details?: string;
	};
	data?: unknown;
}

export interface RequestParams<D = void> {
	url: string;
	method: MethodEnum;
	data?: D;
	headers?: Record<string, string>;
}

export const handleRequest = async <T extends BaseResponse = BaseResponse, D = void>({
	url,
	method,
	data,
	headers,
}: RequestParams<D>): Promise<T> => {
	const buildHeaders = async (): Promise<Record<string, string>> => {
		const token = await storage.get("token");
		const base: Record<string, string> = {
			"Content-Type": "application/json",
		};
		if (token && token !== "undefined" && token !== "null") {
			base["Authorization"] = `Bearer ${token}`;
		}
		return headers ? { ...base, ...headers } : base;
	};

	try {
		const response = await axios<T>(baseURL + url, {
			method,
			data,
			headers: await buildHeaders(),
		});

		if (response.status >= 200 && response.status < 300) {
			if (response.data.ok === false) {
				throw new Error(
					response.data.error?.details ||
						response.data.message ||
						"Request failed",
				);
			}

			if (response.data.user_token) {
				await storage.set("token", response.data.user_token);
			}
			return response.data;
		}

		throw new Error(response.data.message || "Request failed");
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			const axiosErr = error as AxiosError<BaseResponse>;
			throw new Error(
				axiosErr.response?.data?.error?.details ||
					axiosErr.response?.data?.message ||
					"Network error",
			);
		}
		throw error;
	}
};
