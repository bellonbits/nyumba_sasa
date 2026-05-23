import { NextResponse, type NextRequest } from "next/server";

// Edge-compatible JWT claims parser
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });
  const token = request.cookies.get("sb-access-token")?.value;
  
  let user = null;
  if (token) {
    const decoded = parseJwt(token);
    // Check if token signature claims exist and are not expired
    if (decoded && decoded.sub && decoded.exp * 1000 > Date.now()) {
      user = {
        id: decoded.sub,
        email: decoded.email,
        user_metadata: decoded.user_metadata || {},
      };
    }
  }

  const { pathname } = request.nextUrl;
  const protectedPaths = ["/home", "/search", "/favorites", "/messages", "/profile", "/agent", "/admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
