import { useMutation } from "@tanstack/react-query";
import { handleRequest, MethodEnum } from "../../../shared/api";
import type { BaseResponse } from "../../../shared/api";
import { storage } from "../../../shared/api/storage";
import { useNavigate } from "react-router-dom";
import { PathEnum } from "../../../app/routers/routers.types";
import type {
	GoogleAuthPayload,
	LoginCredentials,
	LoginResponse,
	RegisterCredentials,
} from "./auth.api.type";
import { useCallback } from "react";

export const useRegisterMutation = (
	navigate: ReturnType<typeof useNavigate>,
	setError: (msg: string) => void,
) => {
	return useMutation({
		mutationFn: async ({ name, email, password }: RegisterCredentials) => {
			return await handleRequest<BaseResponse, RegisterCredentials>({
				url: "/auth/register",
				method: MethodEnum.POST,
				data: { name, email, password },
			});
		},
		onSuccess: async (data, variables) => {
			if (data.ok) {
				await storage.set("user_email", variables.email);
				await storage.set("user_fullname", variables.name);
				navigate(PathEnum.TASKS);
			} else {
				setError("Registration failed. Please try again.");
			}
		},
		onError: (err: Error) => {
			setError(err.message || "Error registering");
		},
	});
};

export const useLoginMutation = (
	navigate: ReturnType<typeof useNavigate>,
	setError: (msg: string) => void,
) => {
	return useMutation({
		mutationFn: async ({ email, password }: LoginCredentials) => {
			return await handleRequest<LoginResponse, LoginCredentials>({
				url: "/auth/login",
				method: MethodEnum.POST,
				data: { email, password },
			});
		},
		onSuccess: async (data, variables) => {
			if (data.ok) {
				const token = data.user_token || data.data?.token;
				if (token) await storage.set("token", token);
				await storage.set("user_email", variables.email);
				navigate(PathEnum.TASKS);
			} else {
				setError(data.message || "Login failed");
			}
		},
		onError: (err: Error) => {
			setError(err.message || "Error logging in");
		},
	});
};

export const useGoogleAuthMutation = (
	navigate: ReturnType<typeof useNavigate>,
	setError: (msg: string) => void,
) => {
	return useMutation({
		mutationFn: async (idToken: string) => {
			return await handleRequest<LoginResponse, GoogleAuthPayload>({
				url: "/auth/google",
				method: MethodEnum.POST,
				data: { id_token: idToken },
			});
		},
		onSuccess: async (data) => {
			if (data.ok) {
				const token = data.user_token || data.data?.token;
				if (token) await storage.set("token", token);
				if (data.data?.user?.email) {
					await storage.set("user_email", data.data.user.email);
				}
				navigate(PathEnum.TASKS);
			} else {
				setError("Google authentication failed on server");
			}
		},
		onError: (err: Error) => {
			setError(err.message || "Failed to authenticate with Google");
		},
	});
};

export const usehandleGoogleLogin = (
	navigate: ReturnType<typeof useNavigate>,
	setError: (msg: string) => void,
) => {
	const googleAuthMutation = useGoogleAuthMutation(navigate, setError);
	const login = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			setError("");
			const GOOGLE_CLIENT_ID =
				import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
			if (typeof chrome === "undefined" || !chrome.identity) {
				setError(
					"Chrome Identity API is not available. Please ensure you are running this in a Chrome Extension context and have reloaded the extension.",
				);
				return;
			}

			try {
				const clientId = GOOGLE_CLIENT_ID;
				const redirectUrl = chrome.identity.getRedirectURL();
				const authUrl = new URL(
					"https://accounts.google.com/o/oauth2/v2/auth",
				);

				authUrl.searchParams.append("client_id", clientId);
				authUrl.searchParams.append("response_type", "id_token");
				authUrl.searchParams.append("redirect_uri", redirectUrl);
				authUrl.searchParams.append("scope", "openid email profile");
				authUrl.searchParams.append("prompt", "select_account");
				authUrl.searchParams.append(
					"nonce",
					Math.random().toString(36).substring(2),
				);

				chrome.identity.launchWebAuthFlow(
					{ url: authUrl.toString(), interactive: true },
					(responseUrl) => {
						if (chrome.runtime.lastError || !responseUrl) {
							setError(
								chrome.runtime.lastError?.message ||
									"Auth flow cancelled",
							);
							return;
						}

						const url = new URL(responseUrl);
						const params = new URLSearchParams(
							url.hash.substring(1),
						);
						const idToken = params.get("id_token");

						if (idToken) {
							googleAuthMutation.mutate(idToken);
						} else {
							setError("Failed to obtain ID Token from Google");
						}
					},
				);
			} catch (err: unknown) {
				const message =
					err instanceof Error ? err.message : "Google Auth Error";
				setError(message);
			}
		},
		[googleAuthMutation, setError],
	);
	return {
		login: login,
		googleIsLoading: googleAuthMutation.isPending,
		error: googleAuthMutation.error,
	};
};
