import { API_BASE_URL, AI_API_BASE_URL } from "@/lib/config";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const DEFAULT_TIMEOUT_MS = 30_000;

async function request<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
      signal: init?.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError("The request timed out. Please try again.", 0);
    }
    throw new ApiError(
      "Could not reach the server. Check that the backend is running.",
      0,
    );
  }

  if (!response.ok) {
    // Error bodies vary between the two services (Spring default body, FastAPI
    // validation detail); best-effort message extraction.
    let message = `Request failed with status ${response.status}.`;
    try {
      const body: unknown = await response.json();
      if (body && typeof body === "object") {
        const record = body as Record<string, unknown>;
        if (typeof record.error === "string") {
          message = record.error;
        } else if (typeof record.detail === "string") {
          message = record.detail;
        } else if (Array.isArray(record.detail) && record.detail.length > 0) {
          const first = record.detail[0] as Record<string, unknown>;
          if (typeof first?.msg === "string") {
            message = first.msg;
          }
        }
      }
    } catch {
      // keep the generic message
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export interface ApiClient {
  get<T>(path: string, signal?: AbortSignal): Promise<T>;
  post<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T>;
  patch<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T>;
}

function createClient(base: string): ApiClient {
  return {
    get: (path, signal) => request(base, path, { method: "GET", signal }),
    post: (path, body, signal) =>
      request(base, path, {
        method: "POST",
        body: JSON.stringify(body ?? {}),
        signal,
      }),
    patch: (path, body, signal) =>
      request(base, path, {
        method: "PATCH",
        body: JSON.stringify(body ?? {}),
        signal,
      }),
  };
}

/** Spring Boot core API (users, contents, seasons, story units). */
export const coreApi = createClient(API_BASE_URL);

/** FastAPI AI service (conversations, chat). */
export const aiApi = createClient(AI_API_BASE_URL);
