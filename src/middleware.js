import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // If the user is authenticated, redirect them away from auth pages
    if (token && pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Role-based access control
    if ((pathname.startsWith("/dashboard/admin") || pathname.startsWith("/admin")) && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if ((pathname.startsWith("/dashboard/lecturer") || pathname.startsWith("/lecturer")) && token?.role !== "LECTURER") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if ((pathname.startsWith("/dashboard/student") || pathname.startsWith("/student")) && token?.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Public pages
        if (
          pathname === "/" || 
          pathname.startsWith("/auth") || 
          pathname.startsWith("/api/users") || 
          pathname.startsWith("/_next") ||
          pathname.startsWith("/static") ||
          pathname.includes(".")
        ) {
          return true;
        }

        // Must be logged in for everything else
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth check)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
