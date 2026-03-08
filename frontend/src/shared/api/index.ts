import axios from "axios";
import { storage } from "./storage";

export const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export enum MethodEnum {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export interface RequestParams {
  url: string;
  method: MethodEnum;
  data: any;
  headers?: Record<string, string>;
}

export const handleRequest = async ({
  url,
  method,
  data,
  headers,
}: RequestParams) => {
  const getFullHeaders = async () => {
    const token = await storage.get("token");
    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token && token !== "undefined" && token !== "null") {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
    if (headers) {
      return { ...defaultHeaders, ...headers };
    }
    return defaultHeaders;
  };

  try {
    const response = await axios(baseURL + url, {
      method,
      data,
      headers: await getFullHeaders(),
    });

    // Check for success statuses (200, 201 etc.)
    if (response.status >= 200 && response.status < 300) {
      // If the response explicitly returns ok: false, it's a domain error
      if (response.data.ok === false) {
        throw new Error(
          response.data.error?.details ||
            response.data.message ||
            "Request failed",
        );
      }

      // Update token if it's in the response (usually on login/register)
      if (response.data.user_token) {
        await storage.set("token", response.data.user_token);
      }
      return response.data;
    }

    throw new Error(response.data.message || "Request failed");
  } catch (error: any) {
    if (error.response) {
      // The server responded with a status outside of 2xx
      throw new Error(
        error.response.data.error?.details ||
          error.response.data.message ||
          "Network error",
      );
    }
    throw error;
  }
};
