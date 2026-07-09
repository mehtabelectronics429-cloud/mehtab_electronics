import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Protect /admin. Unauthenticated users are sent to /admin/login. */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = req.cookies.get("me_admin_role")?.value;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!role) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }
  if (pathname === "/admin/login" && role) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
