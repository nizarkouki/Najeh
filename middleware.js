import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = new Set(["/", "/login", "/signup"]);
const KNOWN_ROUTES = new Set([
  "/",
  "/login",
  "/signup",
  "/main",
  "/main/dashboard",
  "/main/streaks",
  "/main/badges",
]);

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthenticated = Boolean(user);
  const isKnownRoute = KNOWN_ROUTES.has(pathname);

  if (isAuthenticated) {
    if (pathname === "/" || pathname === "/login" || pathname === "/signup" || !isKnownRoute) {
      return NextResponse.redirect(new URL("/main", request.url));
    }
    return response;
  }

  if (PUBLIC_ROUTES.has(pathname)) {
    return response;
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
