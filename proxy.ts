import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { AUTH_LOGIN_PATH, AUTH_REDIRECT_PATH, AUTH_REGISTER_PATH } from "@/features/auth/constants";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname, search } = request.nextUrl;

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};