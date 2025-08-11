import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export function middleware(request: NextRequest) {
  // Rotas que não precisam de autenticação
  const publicPaths = ["/login", "/register", "/api/auth/login", "/api/auth/register", "/", "/produtos"]

  const { pathname } = request.nextUrl

  // Verificar se é uma rota pública
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Verificar se é uma rota de API pública
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/dashboard")) {
    return NextResponse.next()
  }

  // Verificar token para rotas protegidas
  const token = request.cookies.get("token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
