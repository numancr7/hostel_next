import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";


export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Check if the user is authenticated.
        const {pathname} = req.nextUrl;
         if (
          pathname === "/" || // Allow root path
          pathname.startsWith("/api/auth") ||
          pathname === "/login" ||
          pathname === "/signup"
        )
          return true;

        return !!token;
      },
    },
  }
);


export const config = {
  matcher: [
    /*
     *
     * Match all request paths except:
     * - / (the root path)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|/).*)",
  ],
};