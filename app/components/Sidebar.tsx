"use client";
import React from "react";
import Link from "next/link";

const Sidebar = ({ role = "admin", tipoEmprendimiento = null }: { role?: string; tipoEmprendimiento?: string | null }) => {
  console.log("Sidebar - role:", role, "tipoEmprendimiento:", tipoEmprendimiento);
  
  const adminItems = [
    { name: "Inicio", path: "/admin", icon: "home" },
    { name: "Inventario", path: "/admin/inventario", icon: "inventory" },
    { name: "Emprendedores", path: "/admin/emprendedores", icon: "storefront" },
    { name: "Reseñas", path: "/admin/reviews", icon: "rate_review" },
    { name: "Mi perfil", path: "/admin/perfil", icon: "person" },
  ];
  
  // Items dinámicos según tipo de emprendedor
  const emprendedorItems = [
    { name: "Inicio", path: "/emprendedor", icon: "home" },
  ];
  
  // Normalizar el tipo de emprendimiento para comparación
  const tipoNormalizado = tipoEmprendimiento?.toLowerCase() || "";
  console.log("Tipo normalizado:", tipoNormalizado);
  
  // Agregar Inventario solo para emprendedores de productos
  if (tipoNormalizado.includes("producto") || !tipoEmprendimiento) {
    emprendedorItems.push({ name: "Inventario", path: "/emprendedor/inventario", icon: "inventory" });
  }
  
  // Agregar Reservas (gestión de alimentos) solo para emprendedores de comida
  if (tipoNormalizado.includes("comida") || !tipoEmprendimiento) {
    emprendedorItems.push({ name: "Alimentos", path: "/emprendedor/productosReserva", icon: "restaurant" });
    emprendedorItems.push({ name: "Reservas", path: "/emprendedor/reservas", icon: "calendar_month" });
  }
  
  console.log("Items de emprendedor:", emprendedorItems);
  
  const items = role === "emprendedor" ? emprendedorItems : adminItems;
  console.log("Items seleccionados:", items);
  console.log("Condición role === 'emprendedor':", role === "emprendedor");
  
  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-white dark:bg-black border-r border-slate-200 dark:border-slate-700 shadow-md px-6 py-4">
      <ul className="space-y-2">
        {items.map((item) => {
          let onboardingAttr = {};
          if (item.name === "Productos") onboardingAttr = { 'data-onboarding': 'productos' };
          if (item.name === "Ordenes") onboardingAttr = { 'data-onboarding': 'ordenes' };
          if (item.name === "Configuración") onboardingAttr = { 'data-onboarding': 'configuracion' };
          if (item.name === "Favoritos") onboardingAttr = { 'data-onboarding': 'favoritos' };
          if (item.name === "Inicio") onboardingAttr = { 'data-onboarding': 'inicio' };
          return (
            <li key={item.path}>
              <Link href={item.path} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-[#3a1859] dark:text-white font-medium" {...onboardingAttr}>
                <span className="material-icons-round text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default Sidebar;
