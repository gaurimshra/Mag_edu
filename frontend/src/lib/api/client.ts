const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type ApiError = {
  message: string;
  code?: string;
  status: number;
};

async function parseError(res: Response): Promise<ApiError> {
  let message = "Something went wrong. Please try again.";
  let code: string | undefined;
  try {
    const body = await res.json();
    if (body.detail) {
      if (Array.isArray(body.detail)) {
        message = body.detail.map((e: { msg?: string }) => e.msg || JSON.stringify(e)).join(", ");
      } else if (typeof body.detail === "object") {
        message = body.detail.msg || JSON.stringify(body.detail);
      } else {
        message = String(body.detail);
      }
    } else if (body.message) {
      message = String(body.message);
    }
    code = body.code;
  } catch {}
  return { message, code, status: res.status };
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("magedu_token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await parseError(res);
    throw error;
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
