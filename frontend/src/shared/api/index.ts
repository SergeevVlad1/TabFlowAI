import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor to add auth token
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Token ${token}`;
//   }
//   return config;
// });

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
    if (headers) {
      return headers;
    }
    return {
      "Content-Type": "application/json",
    };
  };
  const response = await axios(baseURL + url, {
    method,
    data,
    headers: hasHeaders(),
  });

  if (response.data.ok) {
    return response.data;
  }
  throw new Error(response.data.message);
};
