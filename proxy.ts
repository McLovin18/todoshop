import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas consideradas "públicas" (landing, blog, carrito, etc.)
const PUBLIC_EXACT: string[] = ["/", "/login"];
const PUBLIC_PREFIXES: string[] = [
  "/blogs",
  "/cart",
  "/product-detail",
  "/products-by-category",
  "/search-results",
  "/order-confirmation",
  "/settings",
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("session");
  const roleCookie = req.cookies.get("role")?.value;

  const isAdminArea = pathname.startsWith("/admin");
  const isEmprendedorArea = pathname.startsWith("/emprendedor");
  const publicPath = isPublicPath(pathname);

  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, req.url));

  // Debug logging
  console.log(`[proxy] pathname: ${pathname}, session: ${!!session}, role: ${roleCookie}`);

  // Sin sesión: se bloquea zona protegida (/admin o /emprendedor) y se redirige al landing
  if (!session) {
    if (isAdminArea || isEmprendedorArea) {
      return redirectTo("/");
    }
    return NextResponse.next();
  }

  const role = roleCookie as "admin" | "emprendedor" | "cliente" | undefined;

  // Usuario autenticado sin rol válido: no puede entrar a /admin ni /emprendedor
  if (!role || (role !== "admin" && role !== "emprendedor")) {
    if (isAdminArea || isEmprendedorArea) {
      return redirectTo("/login");
    }
    return NextResponse.next();
  }

  // Admin autenticado
  if (role === "admin") {
    // Permitir a los administradores acceder a /emprendedor si lo necesitan
    // Solo redirigir si intenta acceder a páginas públicas/login
    if (publicPath) {
      return redirectTo("/admin");
    }
    return NextResponse.next();
  }

  // Emprendedor autenticado
  if (role === "emprendedor") {
    if (isAdminArea) {
      return redirectTo("/emprendedor/inventario");
    }
    if (publicPath) {
      return redirectTo("/emprendedor/inventario");
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/blogs/:path*",
    "/cart/:path*",
    "/product-detail/:path*",
    "/products-by-category/:path*",
    "/search-results/:path*",
    "/order-confirmation/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/emprendedor/:path*",
  ],
};
