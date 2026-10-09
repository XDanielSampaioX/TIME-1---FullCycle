import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ACCESS, COOKIE_REFRESH } from "@/modules/autenticacao/server/cookiesSessao";

export function proxy(request: NextRequest) {
  if (request.cookies.has(COOKIE_ACCESS) || request.cookies.has(COOKIE_REFRESH)) {
    return NextResponse.next();
  }
  const destino = new URL("/login", request.url);
  destino.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(destino);
}

export const config = { matcher: "/minha-conta/:path*" };
