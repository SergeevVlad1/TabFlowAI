import axios, { type AxiosError } from "axios";
import { storage } from "./storage";

export const baseURL =
	import.meta.env.VITE_API_URL || "https://tabflowai.onrender.com/api";

export enum MethodEnum {
	GET = "GET",
	POST = "POST",
	PUT = "PUT",
	DELETE = "DELETE",
	PATCH = "PATCH",
}

export interface BaseResponse {
	ok?: boolean;
	message?: string;
	user_token?: string;
	error?: {
		code?: number;
		details?: string;
		field_errors?: Record<string, string[]>;
	};
	data?: unknown;
}

export class ApiError extends Error {
	fieldErrors: Record<string, string[]>;

	constructor(message: string, fieldErrors?: Record<string, string[]>) {
		super(message);
		this.name = "ApiError";
		this.fieldErrors = fieldErrors || {};
	}
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
				throw new ApiError(
					response.data.error?.details ||
						response.data.message ||
						"Request failed",
					response.data.error?.field_errors,
				);
			}

			if (response.data.user_token) {
				await storage.set("token", response.data.user_token);
			}
			return response.data;
		}

		throw new ApiError(response.data.message || "Request failed");
	} catch (error: unknown) {
		if (error instanceof ApiError) {
			throw error;
		}
		if (axios.isAxiosError(error)) {
			const axiosErr = error as AxiosError<BaseResponse>;
			const respData = axiosErr.response?.data;
			throw new ApiError(
				respData?.error?.details ||
					respData?.message ||
					"Network error",
				respData?.error?.field_errors,
			);
		}
		throw error;
	}
};

