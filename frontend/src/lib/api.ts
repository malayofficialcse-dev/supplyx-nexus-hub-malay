export const API_BASE =
  (import.meta.env['VITE_API_URL'] as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:5006/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  const token = typeof window !== "undefined" ? localStorage.getItem("supplyx_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> ?? {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError(
      `Cannot reach the SCM API at ${API_BASE}. Make sure the backend is running.`,
      0,
    );
  }

  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    const msg =
      (body && typeof body === "object" && "message" in body
        ? String((body as Record<string, unknown>)['message'])
        : null) ||
      (body && typeof body === "object" && "error" in body
        ? String((body as Record<string, unknown>)['error'])
        : null) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(msg, res.status);
  }

  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(data ?? {}) }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(data ?? {}) }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(data ?? {}) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  download: async (path: string, defaultFilename: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("supplyx_token") : null;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, { headers });
    if (!res.ok) throw new Error(`Download failed with status ${res.status}`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  },
};

/** Backends vary: unwrap {data:[...]} / {items:[...]} / raw array shapes. */
export function unwrapList<T = Record<string, unknown>>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const key of ["data", "items", "results", "rows", "records"]) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
    const nested = obj['data'];
    if (nested && typeof nested === "object") return unwrapList<T>(nested);
  }
  return [];
}

export function unwrapOne<T = Record<string, unknown>>(payload: unknown): T | null {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;
  if (obj['data'] && typeof obj['data'] === "object" && !Array.isArray(obj['data'])) {
    return obj['data'] as T;
  }
  return obj as T;
}
