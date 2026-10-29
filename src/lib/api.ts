import createClient from "openapi-fetch";

import type { components, paths } from "@/types/api";

export type Schemas = components["schemas"];

// Same-origin: Next.js rewrites /api/* to the backend, so the httpOnly session cookie is sent.
export const api = createClient<paths>({ baseUrl: "", credentials: "include" });

api.use({
  onResponse({ request, response }) {
    // Session expired mid-use: back to sign-in (the login call itself handles its own 401).
    if (response.status === 401 && typeof window !== "undefined" && !request.url.includes("/auth/login")) {
      // Full reload on purpose: drops all cached query data from the expired session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    }
  },
});

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function messageFrom(status: number, error: unknown): string {
  const detail = (error as { detail?: unknown } | undefined)?.detail;
  if (typeof detail === "string") return detail;
  if (status >= 500 || status === 0) return "Can't reach the AssureVoice service. Try again in a moment.";
  return "Something went wrong. Try again.";
}

/** Await an openapi-fetch call and return its data, or throw ApiError with a user-facing message. */
export async function unwrap<T>(call: Promise<{ data?: T; error?: unknown; response: Response }>): Promise<T> {
  let result;
  try {
    result = await call;
  } catch {
    throw new ApiError(0, messageFrom(0, undefined));
  }
  const { data, error, response } = result;
  if (!response.ok) throw new ApiError(response.status, messageFrom(response.status, error));
  return data as T;
}
