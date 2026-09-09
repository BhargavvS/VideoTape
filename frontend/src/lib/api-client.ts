import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach bearer token if present (backend also reads httpOnly cookie)
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.set("authorization", `Bearer ${token}`);
  }
  return config;
});

let refreshing = false;
let queue: Array<(token: string | null) => void> = [];

function flush(token: string | null) {
  queue.forEach((cb) => cb(token));
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push((token) => {
            if (token) {
              original.headers.set("authorization", `Bearer ${token}`);
              resolve(api(original));
            } else reject(error);
          });
        });
      }
      refreshing = true;
      try {
        const { data } = await axios.post(
          `${API_URL}/api/v1/users/refresh-token`,
          {},
          { withCredentials: true }
        );
        const payload = normalize<Record<string, string | undefined>>(data);
        const accessToken: string | undefined =
          payload?.accessToken ?? payload?.newRefreshToken ?? payload?.token;
        if (accessToken) localStorage.setItem("accessToken", accessToken);
        flush(accessToken ?? null);
        if (accessToken) original.headers.set("authorization", `Bearer ${accessToken}`);
        return api(original);
      } catch {
        localStorage.removeItem("accessToken");
        flush(null);
        return Promise.reject(error);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

/** Backend ApiResponse has inconsistent arg order — always unwrap safely. */
export function normalize<T = unknown>(raw: unknown): T {
  if (raw && typeof raw === "object" && "data" in (raw as Record<string, unknown>)) {
    return (raw as { data: T }).data as T;
  }
  return raw as T;
}

export interface ApiErrorInfo {
  message: string;
  status?: number;
}

function extractServerMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;
  if (typeof d.message === "string" && d.message.trim()) return d.message;
  if (typeof d.error === "string" && d.error.trim()) return d.error;
  const errors = d.errors;
  if (Array.isArray(errors)) {
    const first = errors
      .map((e) =>
        typeof e === "string" ? e : e && typeof e === "object" && typeof (e as Record<string, unknown>).message === "string"
          ? ((e as Record<string, unknown>).message as string)
          : undefined
      )
      .find((m) => m && m.trim());
    if (first) return first;
  }
  return undefined;
}

/** Structured error info: HTTP status + best human-readable message. */
export function getApiError(error: unknown, fallback = "Something went wrong"): ApiErrorInfo {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const serverMessage = extractServerMessage(error.response?.data);
    if (serverMessage) return { message: serverMessage, status };
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      return {
        message:
          "Cannot reach the server. Check that the backend is running, VITE_API_URL is correct, and the backend CORS_ORIGIN allows this page.",
        status,
      };
    }
    if (error.code === "ECONNABORTED") {
      return { message: "The request timed out. Please try again.", status };
    }
    if (status === 401) return { message: "You are not signed in. Please sign in and try again.", status };
    if (status === 403) return { message: "You don't have permission to do that.", status };
    if (status === 409) return { message: "That already exists. Try a different value.", status };
    if (status && status >= 500) return { message: "The server had a problem. Please try again in a moment.", status };
    if (typeof error.message === "string" && error.message) return { message: error.message, status };
  }
  if (error instanceof Error && error.message) return { message: error.message };
  return { message: fallback };
}

export function apiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  return getApiError(error, fallback).message;
}

export function toFormData(fields: Record<string, string | File | Blob | undefined>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined && v !== "") fd.append(k, v as string | Blob);
  }
  return fd;
}
