"use client";
import React from "react";
import Link from "next/link";
import { useUser } from "../context/UserContext";
import { usePathname } from "next/navigation";

const adminItems = [
  { name: "Dashboard", path: "/admin", icon: "dashboard" },
  { name: "Inventario", path: "/admin/inventario", icon: "inventory" },
  { name: "Emprendedores", path: "/admin/emprendedores", icon: "storefront" },
  { name: "Pedidos", path: "/admin/pedidos", icon: "assignment" },
  { name: "Clientes", path: "/admin/clientes", icon: "people" },
  { name: "Landing", path: "/admin/edit-landing", icon: "edit" },
  { name: "Blogs", path: "/admin/edit-blogs", icon: "library_books" },
  { name: "Perfil", path: "/admin/perfil", icon: "person" },
  { name: "Config", path: "/admin/config", icon: "settings" },
];

const publicItems = [
  { name: "Inicio", path: "/", icon: "home" },
  { name: "Productos", path: "/productos", icon: "shopping_bag" },
  { name: "Reservas", path: "/reservas", icon: "restaurant_menu" },
  { name: "Carrito", path: "/cart", icon: "shopping_cart" },
];

export default function BottomBar({ role = "admin", tipoEmprendimiento = null }: { role?: string; tipoEmprendimiento?: string | null }) {
  const pathname = usePathname();
  const { carrito } = useUser();
  
  // Determinar si es una página pública
  const isPublicPage = pathname === "/" || pathname === "/productos" || pathname === "/reservas" || pathname === "/cart" || pathname === "/search-results" || pathname === "/login";
  
  // Items dinámicos según tipo de emprendedor
  const emprendedorItems = [
    { name: "Inicio", path: "/emprendedor", icon: "home" },
  ];
  
  // Normalizar el tipo de emprendimiento para comparación
  const tipoNormalizado = tipoEmprendimiento?.toLowerCase() || "";
  
  // Agregar Inventario solo para emprendedores de productos
  if (tipoNormalizado.includes("producto") || !tipoEmprendimiento) {
    emprendedorItems.push({ name: "Inventario", path: "/emprendedor/inventario", icon: "inventory" });
  }
  
  // Agregar Reservas (gestión de alimentos) solo para emprendedores de comida
  if (tipoNormalizado.includes("comida") || !tipoEmprendimiento) {
    emprendedorItems.push({ name: "Alimentos", path: "/emprendedor/productosReserva", icon: "restaurant" });
    emprendedorItems.push({ name: "Reservas", path: "/emprendedor/reservas", icon: "calendar_month" });
  }
  
  const items = isPublicPage ? publicItems : (role === "emprendedor" ? emprendedorItems : adminItems);
  
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full flex overflow-x-auto z-50" style={{ background: "#1e293b", borderColor: "#334155", borderTop: "1px solid #334155" }}>
      <ul className="flex w-full justify-between items-center">
        {items.map((item) => (
          <li key={item.path} className="flex-1">
            <Link href={item.path} className="flex flex-col items-center py-3 px-2 hover:bg-white/10 relative transition-colors" style={{ color: "#ffffff" }}>
              <span className="material-icons-round text-xl">{item.icon}</span>
              {/* Badge solo para carrito */}
              {(item.icon === "shopping_bag" || item.icon === "shopping_cart") ? (
                carrito && carrito.length > 0 && (
                  <span className="absolute top-0 right-3 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 z-20" style={{ borderColor: "#1e293b" }}>
                    {carrito.length}
                  </span>
                )
              ) : null}
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
