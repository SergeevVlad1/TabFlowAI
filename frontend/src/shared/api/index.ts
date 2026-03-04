import axios from "axios";

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
  const hasHeaders = () => {
    const token = localStorage.getItem("token");
    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
    if (headers) {
      return { ...defaultHeaders, ...headers };
    }
    return defaultHeaders;
  };
  const response = await axios(baseURL + url, {
    method,
    data,
    headers: hasHeaders(),
  });

  if (response.data.ok) {
    localStorage.setItem("token", response.data.user_token);
    return response.data;
  }

  throw new Error(
    response.data.error?.details || response.data.message || "Request failed",
  );
};
