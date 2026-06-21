export type UserRole = "admin" | "emprendedor" | "cliente" | "unknown";

export function getRoleFromFirebaseClaims(claims: Record<string, any> | null | undefined): UserRole {
  if (!claims || typeof claims !== "object") return "cliente";

  if (claims.admin === true || claims.role === "admin") {
    return "admin";
  }

  if (claims.role === "emprendedor" || claims.emprendedor === true) {
    return "emprendedor";
  }

  if (claims.role === "cliente") {
    return "cliente";
  }

  return "cliente";
}

export function isDashboardRole(role: UserRole): boolean {
  return role === "admin" || role === "emprendedor";
}

export function getDashboardRedirectPath(role: UserRole): string {
  if (role === "admin") return "/admin";
  if (role === "emprendedor") return "/emprendedor/inventario";
  return "/login";
}
