// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { DecodedToken } from "../types/auth"; // Assuming you have this type defined

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const access = request.cookies.get("access")?.value;

  // Redirect to /dashboard if access token exists and on /login or /register
  if (access && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect to /login if no access token and on /dashboard or /dashboard/*
  if (!access && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If access token exists and on /dashboard or /dashboard/*, check role
  if (access && pathname.startsWith("/dashboard")) {
    try {
      const decodedToken: JwtPayload & DecodedToken = jwtDecode(access);
      const currentUserRole = decodedToken.role || "";

      if (currentUserRole !== "super_admin") {
        // Redirect to /permission-denied if not super_admin
        return NextResponse.redirect(new URL("/permission-denied", request.url));
      }

      // Set Authorization header
      const response = NextResponse.next();
      response.headers.set("Authorization", `Bearer ${access}`);
      return response;
    } catch (error) {
      // Handle invalid token (e.g., redirect to login)
      console.error("Invalid token:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Allow other requests to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/permission-denied"],
};
