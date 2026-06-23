"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  mapCategorySnapshot,
  sortCategoriasByOrder,
} from "../lib/categorias-db";
import { obtenerProductos } from "../lib/productos-db";
import { useUser } from "../context/UserContext";
import { productMatches } from "../lib/search-utils";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────
// Acordeón de categorías para el drawer móvil
// ─────────────────────────────────────────────
function MobileCategoriesAccordion({ basePath }: { basePath: string }) {
  const [categorias, setCategorias] = React.useState<any[]>([]);
  const [openCat, setOpenCat] = React.useState<string | null>(null);
  const [openSub, setOpenSub] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, "categorias"), (snap) => {
      setCategorias(sortCategoriasByOrder(mapCategorySnapshot(snap.docs)));
    });
    return () => unsub();
  }, []);

  return (
    <div className="flex flex-col gap-1 my-3">
      <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-1"
        style={{ color: "rgba(255,255,255,0.7)" }}>
        Categorías
      </p>
      {categorias.map((cat) => (
        <div key={cat.id}>
          <button
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ color: "#ffffff" }}
            onClick={() =>
              setOpenCat(openCat === cat.id ? null : cat.id)
            }
          >
            <span className="flex items-center gap-2">
              {cat.icono && (
                <span className="material-icons-round text-base"
                  style={{ color: "#E0A11A" }}>
                  {cat.icono}
                </span>
              )}
              {cat.nombre}
            </span>
            {cat.subcategorias?.length > 0 && (
              <span
                className="material-icons-round text-sm transition-transform duration-200"
                style={{
                  color: "#ffffff",
                  transform: openCat === cat.id ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                arrow_drop_down
              </span>
            )}
          </button>

          {cat.subcategorias?.length > 0 && openCat === cat.id && (
            <div className="ml-4 mb-1 rounded-xl overflow-hidden border"
              style={{ borderColor: "rgba(255,255,255,0.2)" }}>
              {cat.subcategorias.map((sub: any) => (
                <div key={sub.id}>
                  {sub.subcategorias?.length > 0 ? (
                    <>
                      <button
                        className="w-full flex items-center justify-between px-3 py-2 text-sm transition-shadow hover:shadow-sm rounded-md"
                        style={{ color: "#ffffff" }}
                        onClick={() =>
                          setOpenSub(openSub === sub.id ? null : sub.id)
                        }
                      >
                        <span>{sub.nombre}</span>
                        <span
                          className="material-icons-round text-sm transition-transform duration-200"
                          style={{
                            color: "#ffffff",
                            transform:
                              openSub === sub.id
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                          }}
                        >
                          arrow_drop_down
                        </span>
                      </button>
                      {openSub === sub.id && (
                        <div className="ml-3 border-l"
                          style={{ borderColor: "rgba(255,255,255,0.2)" }}>
                          {sub.subcategorias.map((subsub: any) => (
                            <a
                              key={subsub.id}
                              href={`${basePath}?cat=${cat.id}&sub=${sub.id}&subsub=${subsub.id}`}
                              className="block px-4 py-2 text-xs transition-colors"
                              style={{ color: "rgba(255,255,255,0.7)" }}
                            >
                              {subsub.nombre}
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <a
                      href={`${basePath}?cat=${cat.id}&sub=${sub.id}`}
                      className="block px-3 py-2 text-sm transition-shadow hover:shadow-sm rounded-md"
                      style={{ color: "#ffffff" }}
                    >
                      {sub.nombre}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {!cat.subcategorias?.length && openCat === cat.id && (
            <a
              href={`${basePath}?cat=${cat.id}`}
              className="block px-3 py-2 text-sm"
              style={{ color: "#ffffff" }}
            >
              {cat.nombre}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Navbar principal
// ─────────────────────────────────────────────
export const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [openCatId, setOpenCatId] = useState<string | null>(null);
  const [openSubId, setOpenSubId] = useState<string | null>(null);
  const { user, carrito } = useUser();
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categorias"), (snap) => {
      setCategorias(sortCategoriasByOrder(mapCategorySnapshot(snap.docs)));
    });
    return () => unsub();
  }, []);

  // Cargar productos para la búsqueda
  useEffect(() => {
    async function loadProducts() {
      const products = await obtenerProductos();
      setAllProducts(products);
    }
    loadProducts();
  }, []);

  // Filtrar productos según la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const filtered = allProducts.filter(p => productMatches(p, searchQuery)).slice(0, 5);
    setSearchResults(filtered);
    setShowSearchDropdown(filtered.length > 0);
  }, [searchQuery, allProducts]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  if (!mounted) return null;

  const isAdmin = user?.role === "admin";
  const basePath = isAdmin
    ? "/admin/products-by-category"
    : "/products-by-category";

  const links: { href: string; label: string }[] = [];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search-results?query=${encodeURIComponent(searchQuery)}`);
      setShowSearchDropdown(false);
    }
  };

  const handleProductClick = (productId: string) => {
    const isAdmin = user?.role === "admin";
    const detailUrl = isAdmin ? `/admin/product-detail?id=${productId}` : `/product-detail?id=${productId}`;
    router.push(detailUrl);
    setShowSearchDropdown(false);
    setSearchQuery("");
  };

  const getDetailUrl = (productId: string) => {
    const isAdmin = user?.role === "admin";
    return isAdmin ? `/admin/product-detail?id=${productId}` : `/product-detail?id=${productId}`;
  };

  return (
    <>
      {/* ══════════════════ NAVBAR ══════════════════ */}
      <nav
        className="sticky top-0 z-40 border-b py-3 shadow-sm backdrop-blur-md"
        style={{
          background: "#FFFFFF",
          borderColor: "#E0E0E0"
        }}
      >
        {/* ── Header principal ── */}
        <div
          className="relative flex items-center justify-between gap-4 px-4 py-2 lg:px-6 lg:py-2"
          style={{ color: "#000000" }}
        >
          {/* Logo y buscador - izquierda */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              className="lg:hidden p-2 rounded-xl transition-colors text-black hover:bg-black/10"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <span className="material-icons-round text-2xl">menu</span>
            </button>

            <a
              href="/"
              className="flex items-center gap-2 shrink-0 text-black"
            >
              <span className="font-heading tracking-tight whitespace-nowrap text-lg sm:text-2xl font-black">
                TodoMarket
              </span>
            </a>

            {/* Buscador */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit();
                    }
                  }}
                  className="w-64 px-4 py-2 rounded-full border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-sm"
                />
                <button
                  onClick={handleSearchSubmit}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  <span className="material-icons-round text-lg">search</span>
                </button>

                {/* Dropdown de resultados de búsqueda */}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border-2 border-slate-200 shadow-xl max-h-96 overflow-y-auto z-50">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                      >
                        {product.imagenes && product.imagenes.length > 0 && (
                          <img
                            src={typeof product.imagenes[0] === 'string' ? product.imagenes[0] : URL.createObjectURL(product.imagenes[0])}
                            alt={product.nombre}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-black truncate">{product.nombre}</p>
                          <p className="text-xs text-slate-500 truncate">{product.marca || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Categorías visibles en navbar - centro */}
          <div className="hidden lg:flex items-center gap-2">

            <Link
              href="/productos"
              className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:scale-105 whitespace-nowrap bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-700 hover:to-slate-800 shadow-md"
            >
              🍽️ Productos
            </Link>


            <Link
              href="/reservas"
              className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:scale-105 whitespace-nowrap bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-800 hover:to-slate-900 shadow-md"
            >
              🍽️ Reservas
            </Link>
            
            {/* Mostrar categorías visibles (máximo 8) */}
            {categorias
              .filter(cat => cat.visibleEnNavbar)
              .sort((a, b) => (a.orden || 0) - (b.orden || 0))
              .slice(0, 8)
              .map(cat => (
                <Link
                  key={cat.id}
                  href={`${basePath}?cat=${cat.id}`}
                  className="px-5 py-2.5 rounded-full text-sm font-bold text-black transition-all hover:bg-black/10 hover:scale-105 whitespace-nowrap border-2 border-slate-200 flex items-center gap-1"
                >
                  {cat.icono && (
                    <span className="material-icons-round" style={{ fontSize: 16 }}>{cat.icono}</span>
                  )}
                  {cat.nombre}
                </Link>
              ))}
            
            {/* Botón "Ver más" si hay más categorías visibles */}
            {categorias.filter(cat => cat.visibleEnNavbar).length > 8 && (
              <Link
                href="/products-by-category"
                className="px-5 py-2.5 rounded-full text-sm font-bold text-slate-600 transition-all hover:bg-black/10 hover:scale-105 whitespace-nowrap border-2 border-slate-200"
              >
                Ver más...
              </Link>
            )}
          </div>

          {/* Carrito y usuario - derecha */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <div className="relative flex flex-col items-center">
              <a
                href="/cart"
                className="flex items-center justify-center px-2 py-2 rounded-xl transition-colors text-black hover:bg-black/10"
                aria-label="Carrito"
                data-onboarding="carrito"
              >
                <span className="material-icons-round text-xl">shopping_cart</span>
                {carrito && carrito.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white z-10">
                    {carrito.length}
                  </span>
                )}
              </a>
            </div>

            {user ? (
              <div className="relative">
                <button
                  className="rounded-full transition-opacity hover:opacity-80"
                  onClick={() => setUserMenu(!userMenu)}
                  title="Opciones de usuario"
                  data-onboarding="usuario"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Foto de perfil"
                      className="w-9 h-9 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <span className="material-icons-round text-3xl text-black">
                      account_circle
                    </span>
                  )}
                </button>

                {userMenu && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-2xl border shadow-xl overflow-hidden z-50"
                    style={{ background: "#ffffff", borderColor: "rgba(17,24,39,0.12)" }}
                  >
                    <button
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left text-red-500 font-medium transition-colors hover:bg-slate-50 text-body"
                      onClick={async () => {
                        const { logoutUser } = await import("../lib/firebase-auth");
                        await logoutUser();
                        try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
                        window.location.href = "/";
                      }}
                    >
                      <span className="material-icons-round text-base">logout</span>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>

            ) : null}

            
          </div>
        </div>
      </nav>

      {/* ══════════════════ MOBILE DRAWER ══════════════════ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm mb-12"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute left-0 top-0 w-[85vw] max-w-xs max-h-[calc(100vh-80px)] overflow-y-auto shadow-lg flex flex-col"
            style={{
              background: "#FFFFFF",
              color: "#000000"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header drawer */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "#E0E0E0" }}
            >
              <span className="font-bold text-base" style={{ color: "#000000" }}>
                � todoShop
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg transition-colors hover:bg-black/10"
                style={{ color: "#000000" }}
              >
                <span className="material-icons-round text-xl">close</span>
              </button>
            </div>

            <div className="flex-1 px-4 py-4 flex flex-col gap-1">
              {/* Buscador móvil */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchSubmit();
                        setMobileOpen(false);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-sm"
                  />
                  <button
                    onClick={() => {
                      handleSearchSubmit();
                      setMobileOpen(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    <span className="material-icons-round text-lg">search</span>
                  </button>

                  {/* Dropdown de resultados de búsqueda móvil */}
                  {showSearchDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border-2 border-slate-200 shadow-xl max-h-96 overflow-y-auto z-50">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            handleProductClick(product.id);
                            setMobileOpen(false);
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                        >
                          {product.imagenes && product.imagenes.length > 0 && (
                            <img
                              src={typeof product.imagenes[0] === 'string' ? product.imagenes[0] : URL.createObjectURL(product.imagenes[0])}
                              alt={product.nombre}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-black truncate">{product.nombre}</p>
                            <p className="text-xs text-slate-500 truncate">{product.marca || ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Links principales */}
              <a
                href="/reservas"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors bg-emerald-50 text-emerald-700"
              >
                <span className="material-icons-round text-lg">restaurant</span>
                🍽️ Reservas
              </a>
              
              {/* Categorías visibles en navbar móvil */}
              {categorias
                .filter(cat => cat.visibleEnNavbar)
                .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                .slice(0, 8)
                .map(cat => (
                  <a
                    key={cat.id}
                    href={`${basePath}?cat=${cat.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-black/5"
                    style={{ color: "#000000" }}
                  >
                    {cat.icono && (
                      <span className="material-icons-round text-lg">{cat.icono}</span>
                    )}
                    {cat.nombre}
                  </a>
                ))}
              
              <a
                href="/products-by-category"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-black/5"
                style={{ color: "#000000" }}
              >
                <span className="material-icons-round text-lg">category</span>
                📂 Ver todas las categorías
              </a>

              {/* Links antiguos (vacío) */}
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-black/5"
                  style={{ color: "#000000" }}
                >
                  {link.label}
                </a>
              ))}

              {/* Categorías en acordeón */}
              <MobileCategoriesAccordion basePath={basePath} />

              {/* Divisor */}
              <div className="border-t my-2" style={{ borderColor: "#E0E0E0" }} />
              <div className="border-t my-2" style={{ borderColor: "#E0E0E0" }} />

              {/* Usuario - Opciones si está autenticado */}
              {user && (
                <>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left text-black font-medium transition-colors hover:bg-black/5"
                    onClick={async () => {
                      const { logoutUser } = await import("../lib/firebase-auth");
                      await logoutUser();
                      try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
                      window.location.href = "/";
                    }}
                  >
                    <span className="material-icons-round text-base">logout</span>
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Navbar;

