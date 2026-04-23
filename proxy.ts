import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { consumeRateLimit } from "@/lib/rate-limit";

const AUTH_LOGIN_PATH = "/login";
const AUTH_REGISTER_PATH = "/register";
const AUTH_REDIRECT_PATH = "/dashboard";

const PUBLIC_PAGE_PATHS = new Set(["/", AUTH_LOGIN_PATH, AUTH_REGISTER_PATH]);
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/articles", "/api/stories"];
const PROTECTED_API_PREFIXES = [
  "/api/mood",
  "/api/streak",
  "/api/analytics",
  "/api/journal",
  "/api/plans",
  "/api/achievements",
];

function isPublicApiPath(pathname: string) {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isProtectedApiPath(pathname: string) {
  return PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const firstForwardedIp = forwarded?.split(",")[0]?.trim();
  return firstForwardedIp || request.headers.get("x-real-ip") || "127.0.0.1";
}

function applyRateLimitHeaders(response: NextResponse, result: ReturnType<typeof consumeRateLimit>) {
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(result.resetInSeconds));
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isApiRequest = pathname.startsWith("/api/");

  if (isApiRequest) {
    const ip = getClientIp(request);
    const rateLimitResult = consumeRateLimit(`api:${ip}`, {
      capacity: 120,
      refillRate: 120,
      intervalMs: 60_000,
    });

    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          data: null,
          error: "Rate limit exceeded",
        },
        { status: 429 },
      );
      return applyRateLimitHeaders(response, rateLimitResult);
    }

    if (isProtectedApiPath(pathname) && !isPublicApiPath(pathname)) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

      if (!token?.sub) {
        const response = NextResponse.json(
          {
            success: false,
            data: null,
            error: "Unauthorized",
          },
          { status: 401 },
        );
        return applyRateLimitHeaders(response, rateLimitResult);
      }
    }

    return applyRateLimitHeaders(NextResponse.next(), rateLimitResult);
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const isAuthPage = pathname === AUTH_LOGIN_PATH || pathname === AUTH_REGISTER_PATH;
  const isDashboardRoute = pathname.startsWith(AUTH_REDIRECT_PATH);

  if (isDashboardRoute && !token) {
    const redirectUrl = new URL(AUTH_LOGIN_PATH, request.url);
    redirectUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL(AUTH_REDIRECT_PATH, request.url));
  }

  if (pathname.startsWith("/dashboard") && !PUBLIC_PAGE_PATHS.has(pathname) && !token?.sub) {
    const loginUrl = new URL(AUTH_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/login", "/register"],
};