const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://syntax-finance-api.syntaxweb.com.br/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T = unknown>(
  path: string,
  method: HttpMethod = "GET",
  body?: unknown,
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `Erro na requisição (${response.status})`;
    try {
      const data = await response.json();
      if (data && typeof data.message === "string") {
        message = data.message;
      }
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  // DELETE normalmente não retorna body
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
