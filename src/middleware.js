import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const res = NextResponse.next();
    const pathname = req.nextUrl.pathname;

    // --- CORS Headers ---
    if (pathname.startsWith("/api")) {
      res.headers.append("Access-Control-Allow-Credentials", "true");
      res.headers.append("Access-Control-Allow-Origin", "*"); 
      res.headers.append("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT,OPTIONS");
      res.headers.append(
        "Access-Control-Allow-Headers",
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
      );

      if (req.method === "OPTIONS") {
        return new NextResponse(null, {
          status: 200,
          headers: res.headers,
        });
      }
    }

    const token = req.nextauth.token;

    // 1. If the user is authenticated, redirect them away from auth pages
    if (token && pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2. Role-based access control
    if ((pathname.startsWith("/dashboard/admin") || pathname.startsWith("/admin")) && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if ((pathname.startsWith("/dashboard/lecturer") || pathname.startsWith("/lecturer")) && token?.role !== "LECTURER") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if ((pathname.startsWith("/dashboard/student") || pathname.startsWith("/student")) && token?.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return res;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Public pages & Auth internals
        if (
          pathname === "/" || 
          pathname.startsWith("/auth") || 
          pathname.startsWith("/api/auth") || // <--- EXTREMELY IMPORTANT
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
