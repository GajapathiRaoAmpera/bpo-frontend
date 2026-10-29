import { type NextRequest, NextResponse } from "next/server";

import { SCREEN_HREF, type Screen } from "@/lib/routes";

const COOKIE = "av_session";

interface Session {
  landing: Screen;
}

// Routing only: the payload is NOT verified here (no JWT secret in the frontend).
// The backend re-authorises every API call, so a forged cookie gets nothing but 401s.
function readSession(req: NextRequest): Session | null {
  const token = req.cookies.get(COOKIE)?.value;
  const part = token?.split(".")[1];
  if (!part) return null;
  try {
    const json = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof json.exp !== "number" || json.exp * 1000 <= Date.now()) return null;
    return json.landing in SCREEN_HREF ? { landing: json.landing } : null;
  } catch {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const session = readSession(req);

  if (pathname === "/login") {
    return session ? NextResponse.redirect(new URL(SCREEN_HREF[session.landing], req.url)) : NextResponse.next();
  }
  if (!session) {
    const url = new URL("/login", req.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  if (pathname === "/") return NextResponse.redirect(new URL(SCREEN_HREF[session.landing], req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico|webp)$).*)"],
};
