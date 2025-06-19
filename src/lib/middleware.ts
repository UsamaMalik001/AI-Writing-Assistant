import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  const protectedPaths = ["/app", "/dashboard", "/profile"]; // Add more protected routes here

  const isProtectedRoute = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // ✅ Block unauthenticated access to protected pages
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ Redirect logged-in user from /login → /app
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
