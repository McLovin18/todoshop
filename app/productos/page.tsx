"use client";
import { useRouter, useSearchParams } from "next/navigation";
import ProductoCard from "../components/ProductoCard";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import type { Producto } from "../lib/productos-db";
import { obtenerProductos } from "../lib/productos-db";
import {
  mapCategorySnapshot,
  sortCategoriasByOrder,
  sameCategoryId,
  productMatchesCategoria,
  productMatchesSubcategoria,
  productMatchesSubsubcategoria,
} from "../lib/categorias-db";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
export default function Home() {
const router = useRouter();
  const searchParams = useSearchParams();

  const categoriaFromUrl = (
    searchParams?.get("cat") ||
    searchParams?.get("category") ||
    ""
  ).trim();
  const subcategoriaFromUrl = (
    searchParams?.get("subcat") ||
    searchParams?.get("subcategory") ||
    searchParams?.get("sub") ||
    ""
  ).trim();
  const subsubcategoriaFromUrl = (
    searchParams?.get("subsubcat") ||
    searchParams?.get("subsubcategory") ||
    searchParams?.get("subsub") ||
    ""
  ).trim();

  const [filterCat, setFilterCat] = useState(categoriaFromUrl);
  const [filterSub, setFilterSub] = useState(subcategoriaFromUrl);
  const [filterSubsub, setFilterSubsub] = useState(subsubcategoriaFromUrl);

  useEffect(() => {
    setFilterCat(categoriaFromUrl);
    setFilterSub(subcategoriaFromUrl);
    setFilterSubsub(subsubcategoriaFromUrl);
  }, [categoriaFromUrl, subcategoriaFromUrl, subsubcategoriaFromUrl]);

  const categoria = filterCat;
  const subcategoria = filterSub;
  const subsubcategoria = filterSubsub;

  const [currentPage, setCurrentPage] = useState(1);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [orden, setOrden] = useState("price-high");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [emprendedores, setEmprendedores] = useState<any[]>([]);
  const [filterNegocio, setFilterNegocio] = useState("");
  const [showNegocioDropdown, setShowNegocioDropdown] = useState(false);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const categoriasRef = collection(db, "categorias");
    const unsubscribe = onSnapshot(query(categoriasRef), (snapshot) => {
      setCategorias(sortCategoriasByOrder(mapCategorySnapshot(snapshot.docs)));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const emprendedoresRef = collection(db, "emprendedores");
    const unsubscribe = onSnapshot(query(emprendedoresRef), (snapshot) => {
      const allEmprendedores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Filtrar solo emprendedores de venta de productos (no comida)
      const productosEmprendedores = allEmprendedores.filter((emp: any) => {
        const tipo = (emp.tipoEmprendimiento || "").toLowerCase();
        return !tipo.includes("comida") && !tipo.includes("alimento") && !tipo.includes("food");
      });
      setEmprendedores(productosEmprendedores);
    });
    return () => unsubscribe();
  }, []);

  const selectCategoria = useCallback(
    (catId: string) => {
      setFilterCat(catId);
      setFilterSub("");
      setFilterSubsub("");
    },
    []
  );

  const selectTodas = useCallback(() => {
    setFilterCat("");
    setFilterSub("");
    setFilterSubsub("");
  }, []);

  useEffect(() => {
    async function fetchProductos() {
      setLoading(true);
      try {
        const all = await obtenerProductos();
        let prods = all;

        if (categoria && categorias.length > 0) {
          prods = prods.filter((p) =>
            productMatchesCategoria(p, categoria, categorias)
          );
          if (subcategoria) {
            prods = prods.filter((p) =>
              productMatchesSubcategoria(
                p,
                categoria,
                subcategoria,
                categorias
              )
            );
          }
          if (subsubcategoria) {
            prods = prods.filter((p) =>
              productMatchesSubsubcategoria(
                p,
                categoria,
                subcategoria,
                subsubcategoria,
                categorias
              )
            );
          }
        } else if (categoria) {
          const needle = categoria.trim().toLowerCase();
          prods = all.filter(
            (p) =>
              String(p.categoria || "").trim().toLowerCase() === needle
          );
        }

        setProductos(prods);
      } catch (error) {
        console.error("Error cargando productos:", error);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProductos();
  }, [categoria, subcategoria, subsubcategoria, categorias]);

  useEffect(() => {
    const loggedIn = Boolean(localStorage.getItem("token"));
    setIsAuthenticated(loggedIn);
  }, []);

  const productosFiltrados = useMemo(() => {
    return productos
      .filter((p: any) => {
        // Filtro por negocio
        if (filterNegocio && p.emprendedorId !== filterNegocio) {
          return false;
        }

        if (categoria && categorias.length > 0) {
          if (!productMatchesCategoria(p, categoria, categorias)) return false;
        } else if (categoria && !sameCategoryId(p.categoria, categoria)) {
          return false;
        }

        if (subcategoria && categorias.length > 0) {
          if (
            !productMatchesSubcategoria(
              p,
              categoria,
              subcategoria,
              categorias
            )
          ) {
            return false;
          }
        } else if (subcategoria && !sameCategoryId(p.subcategoria, subcategoria)) {
          return false;
        }

        if (subsubcategoria && categorias.length > 0) {
          if (
            !productMatchesSubsubcategoria(
              p,
              categoria,
              subcategoria,
              subsubcategoria,
              categorias
            )
          ) {
            return false;
          }
        } else if (
          subsubcategoria &&
          !sameCategoryId(p.subsubcategoria, subsubcategoria)
        ) {
          return false;
        }

        const texto = search.toLowerCase().trim();
        const matchTexto =
          !texto ||
          (p.nombre?.toLowerCase() || "").includes(texto) ||
          (p.descripcion?.toLowerCase() || "").includes(texto);

        const base = Number(p.precio || 0);
        const disc = Number(p.descuento || 0);
        const finalPrice =
          disc > 0 && disc < 100 ? base * (1 - disc / 100) : base;

        const min = precioMin ? parseFloat(precioMin) : null;
        const max = precioMax ? parseFloat(precioMax) : null;
        const matchMin = min === null || finalPrice >= min;
        const matchMax = max === null || finalPrice <= max;

        return matchTexto && matchMin && matchMax;
      })
      .sort((a: any, b: any) => {
        const fp = (p: any) => {
          const base = Number(p.precio || 0);
          const d = Number(p.descuento || 0);
          return d > 0 && d < 100 ? base * (1 - d / 100) : base;
        };

        if (orden === "price-low") return fp(a) - fp(b);
        if (orden === "price-high") return fp(b) - fp(a);
        if (a.createdAt && b.createdAt) return b.createdAt - a.createdAt;
        return 0;
      });
  }, [
    productos,
    categoria,
    subcategoria,
    subsubcategoria,
    categorias,
    search,
    precioMin,
    precioMax,
    orden,
    filterNegocio,
  ]);

  const getProductsPerPage = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) return 10;
      if (window.innerWidth >= 1024) return 12;
      if (window.innerWidth >= 768) return 9;
      if (window.innerWidth >= 640) return 6;
    }
    return 10;
  };
  const [productsPerPage, setProductsPerPage] = useState(getProductsPerPage());

  useEffect(() => {
    function handleResize() {
      setProductsPerPage(getProductsPerPage());
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(productosFiltrados.length / productsPerPage);
  const paginatedProducts = productosFiltrados.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [productosFiltrados.length, categoria, subcategoria, subsubcategoria, search, precioMin, precioMax, filterNegocio]);

  const hasFilters = !!(search || precioMin || precioMax || orden !== "newest");

  const clearFilters = useCallback(() => {
    setSearch("");
    setPrecioMin("");
    setPrecioMax("");
    setOrden("newest");
  }, []);

  const inputCls =
    "px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-#e8c862 transition-all";

  return (
    <div className="min-h-screen flex flex-col text-slate-900 dark:text-white transition-colors" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" }}>
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-5 py-6 sm:py-15 flex-1">


        <div className="rounded-3xl px-4 py-3.5 mb-5 space-y-3 shadow-lg" style={{ background: "linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(16,185,129,0.1) 100%)", border: "2px solid rgba(59,130,246,0.3)" }}>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-40 max-w-[min(75vw,300px)] sm:max-w-sm">
              <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 text-[17px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputCls} w-full pl-9 pr-8`}
                style={{ borderColor: "#3b82f6", borderWidth: "2px", fontWeight: "600" }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-500 hover:text-green-500"
                >
                  <span className="material-icons-round text-[15px]">close</span>
                </button>
              )}
            </div>

            {emprendedores.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNegocioDropdown(!showNegocioDropdown)}
                  className={`${inputCls} flex items-center gap-2 min-w-[180px] justify-between`}
                  style={{ borderColor: "#10b981", borderWidth: "2px", fontWeight: "600" }}
                >
                  <span className="text-sm">
                    {filterNegocio
                      ? emprendedores.find((e) => e.id === filterNegocio)?.displayName || "Negocio"
                      : "Todos los negocios"}
                  </span>
                  <span className="material-icons-round text-green-500 text-[18px]">
                    {showNegocioDropdown ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {showNegocioDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-full min-w-[200px] bg-white rounded-xl shadow-xl border-2 border-green-500 z-50 max-h-[300px] overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterNegocio("");
                        setShowNegocioDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-green-50 transition-colors border-b border-gray-100"
                    >
                      🏪 Todos los negocios
                    </button>
                    {emprendedores.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => {
                          setFilterNegocio(emp.id);
                          setShowNegocioDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        {emp.displayName || "Negocio"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {categorias.length > 0 && (
          <div className="mb-6 overflow-x-auto pb-2" ref={categoriesScrollRef}>
            <div className="flex gap-2 min-w-max">
              <button
                type="button"
                onClick={selectTodas}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-bold text-sm transition-all shadow-md hover:shadow-lg ${
                  !categoria
                    ? "bg-blue-500 text-white border-2 border-blue-500 scale-105"
                    : "bg-white text-black border-2 border-blue-500 hover:shadow-md"
                }`}
              >
                🎓 Todas
              </button>
              {categorias.map((cat, idx) => {
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => selectCategoria(cat.id)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap font-bold text-sm transition-all shadow-md hover:shadow-lg ${
                      sameCategoryId(categoria, cat.id)
                        ? "bg-blue-500 text-white border-2 border-blue-500 scale-105"
                        : "bg-white text-black border-2 border-blue-500"
                    }`}
                  >
                    {cat.icono && <span className="mr-1">✨</span>}
                    {cat.nombre}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
  <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-lg animate-pulse border-2" style={{ borderColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][i % 5] }}>
        {/* Imagen placeholder */}
        <div className="w-full h-32 sm:h-48 bg-gradient-to-br" style={{ background: ["linear-gradient(45deg, #93c5fd 0%, #10b981 100%)", "linear-gradient(45deg, #86efac 0%, #3b82f6 100%)", "linear-gradient(45deg, #fcd34d 0%, #10b981 100%)", "linear-gradient(45deg, #f87171 0%, #3b82f6 100%)", "linear-gradient(45deg, #a78bfa 0%, #10b981 100%)"][i % 5] }} />
        {/* Contenido placeholder */}
        <div className="p-1.5 sm:p-4 flex flex-col gap-2">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-6 bg-slate-200 rounded w-1/3 mt-1" />
        </div>
      </div>
    ))}
  </div>
  ) : productosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-lg">
              <span className="material-icons-round text-3xl text-white">
                mood
              </span>
            </div>
            <div>
              <p className="font-bold text-lg text-blue-500">Sin resultados 😢</p>
              <p className="text-sm text-slate-600 mt-1 max-w-60">
                {categoria
                  ? `No hay productos en "${categorias.find((c) => sameCategoryId(c.id, categoria))?.nombre || "esta categoría"}".`
                  : "Prueba otros términos o ajusta los filtros de precio"}
              </p>
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-bold text-white py-2 px-6 rounded-full transition-transform hover:scale-110 shadow-lg"
                style={{ background: "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)" }}
              >
                🔄 Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-5 animate-in fade-in duration-700">
              {paginatedProducts.map((p: any, index: number) => (
                <ProductoCard
                  key={p.id}
                  producto={p}
                  index={index}
                  showCart
                  showEye
              
                  showFav={isAuthenticated}
                  onClick={() => {}}
                  onAddCart={() => {}}
                  onEye={() => {}}
                  isCompact={false}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 mt-8 select-none w-full">
                <button
                  className="px-3 py-1.5 rounded border text-xs font-medium bg-white border-blue-300 text-slate-900 hover:border-blue-500 transition-all disabled:opacity-40"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className={`px-3 py-1.5 rounded border text-xs font-medium transition-all ${currentPage === n ? "bg-blue-500 border-blue-500 text-white shadow-sm" : "bg-white border-blue-300 text-slate-900 hover:border-blue-500"}`}
                    onClick={() => setCurrentPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  className="px-3 py-1.5 rounded border text-xs font-medium bg-white border-blue-300 text-slate-900 hover:border-blue-500 transition-all disabled:opacity-40"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );

}
