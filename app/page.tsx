"use client";
import { useRouter, useSearchParams } from "next/navigation";
import ProductoCard from "./components/ProductoCard";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import type { Producto } from "./lib/productos-db";
import { obtenerProductos } from "./lib/productos-db";
import {
  mapCategorySnapshot,
  sortCategoriasByOrder,
  sameCategoryId,
  productMatchesCategoria,
  productMatchesSubcategoria,
  productMatchesSubsubcategoria,
} from "./lib/categorias-db";
import { collection, query, onSnapshot, getDocs, where } from "firebase/firestore";
import { db } from "./lib/firebase";
import { obtenerAlimentos } from "./lib/alimentos-db";
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
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const [alimentos, setAlimentos] = useState<any[]>([]);
  const [emprendedores, setEmprendedores] = useState<any[]>([]);

  useEffect(() => {
    const categoriasRef = collection(db, "categorias");
    const unsubscribe = onSnapshot(query(categoriasRef), (snapshot) => {
      setCategorias(sortCategoriasByOrder(mapCategorySnapshot(snapshot.docs)));
    });
    return () => unsubscribe();
  }, []);

  // Cargar alimentos para el menú de hoy
  useEffect(() => {
    async function fetchAlimentos() {
      try {
        const all = await obtenerAlimentos();
        const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const diaHoy = diasSemana[new Date().getDay()];
        
        const alimentosHoy = all.filter(a => 
          !a.diasDisponibles || 
          a.diasDisponibles.length === 0 || 
          a.diasDisponibles.includes(diaHoy)
        );
        
        setAlimentos(alimentosHoy.slice(0, 6));
      } catch (error) {
        console.error("Error cargando alimentos:", error);
      }
    }
    fetchAlimentos();
  }, []);

  // Cargar emprendedores destacados
  useEffect(() => {
    async function fetchEmprendedores() {
      try {
        const q = query(collection(db, "emprendedores"), where("status", "==", "completed"), where("destacado", "==", true));
        const snapshot = await getDocs(q);
        const emps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEmprendedores(emps.slice(0, 5));
      } catch (error) {
        console.error("Error cargando emprendedores:", error);
      }
    }
    fetchEmprendedores();
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
        // Ordenar por createdAt descendente y tomar los últimos 6
        const sorted = all.sort((a, b) => {
          const dateA = typeof a.createdAt === 'number' ? a.createdAt : (a.createdAt instanceof Date ? a.createdAt.getTime() : 0);
          const dateB = typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt instanceof Date ? b.createdAt.getTime() : 0);
          return dateB - dateA;
        });
        setProductos(sorted.slice(0, 6));
      } catch (error) {
        console.error("Error cargando productos:", error);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProductos();
  }, []);

  useEffect(() => {
    const loggedIn = Boolean(localStorage.getItem("token"));
    setIsAuthenticated(loggedIn);
  }, []);

  const productosFiltrados = useMemo(() => {
    return productos
      .filter((p: any) => {
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
  }, [productosFiltrados.length, categoria, subcategoria, subsubcategoria, search, precioMin, precioMax]);

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

        {/* Botones principales */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => router.push("/productos")}
            className="flex flex-col items-center justify-center p-6 rounded-3xl shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", border: "2px solid rgba(59, 130, 246, 0.3)" }}
          >
            <span className="material-icons-round text-5xl text-white mb-2">shopping_bag</span>
            <span className="text-white font-bold text-lg">Comprar Productos</span>
          </button>
          <button
            onClick={() => router.push("/reservas")}
            className="flex flex-col items-center justify-center p-6 rounded-3xl shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "2px solid rgba(16, 185, 129, 0.3)" }}
          >
            <span className="material-icons-round text-5xl text-white mb-2">restaurant_menu</span>
            <span className="text-white font-bold text-lg">Reservar Alimentos</span>
          </button>
        </div>

        {/* Menú de hoy */}
        {alimentos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: "#3b82f6" }}>
              <span className="material-icons-round">today</span>
              Menú de Hoy
            </h2>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
              {alimentos.slice(0, 6).map((alimento, index) => (
                <div
                  key={alimento.id}
                  onClick={() => router.push(`/reservas?alimento=${alimento.id}`)}
                  className="rounded-2xl overflow-hidden bg-white shadow-lg cursor-pointer transition-all hover:scale-105 border-2"
                  style={{ borderColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"][index % 6] }}
                >
                  {alimento.imagenes && alimento.imagenes[0] && (
                    <img
                      src={alimento.imagenes[0] as string}
                      alt={alimento.nombre}
                      className="w-full h-32 sm:h-48 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <h3 className="font-bold text-sm mb-1">{alimento.nombre}</h3>
                    <p className="text-xs text-slate-600 mb-2">{alimento.descripcion}</p>
                    <p className="font-bold text-lg" style={{ color: "#3b82f6" }}>${alimento.precio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Productos recientes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: "#10b981" }}>
            <span className="material-icons-round">new_releases</span>
            Productos Recientes
          </h2>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {productos.slice(0, 8).map((producto, index) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
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
        </div>

        {/* Emprendedores destacados */}
        {emprendedores.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: "#8b5cf6" }}>
              <span className="material-icons-round">stars</span>
              Emprendedores Destacados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {emprendedores.map((emprendedor, index) => (
                <div
                  key={emprendedor.id}
                  className="rounded-2xl p-4 bg-white shadow-lg transition-all hover:scale-105 border-2"
                  style={{ borderColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][index % 5] }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {emprendedor.photoURL ? (
                      <img
                        src={emprendedor.photoURL}
                        alt={emprendedor.displayName || "Emprendedor"}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                        style={{ background: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][index % 5] }}
                      >
                        {emprendedor.displayName?.charAt(0).toUpperCase() || "E"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm">{emprendedor.displayName || "Emprendedor"}</h3>
                      <p className="text-xs text-slate-600">{emprendedor.tipoEmprendimiento || "General"}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{emprendedor.email}</p>
                  <button
                    onClick={() => {
                      const targetPath = emprendedor.tipoEmprendimiento === "comida" 
                        ? `/reservas?emprendedor=${emprendedor.uid}`
                        : `/productos?emprendedor=${emprendedor.uid}`;
                      router.push(targetPath);
                    }}
                    className="w-full py-2 rounded-xl text-white font-bold bg-slate-700 text-sm transition-all hover:opacity-90"
                  >
                    Ver Productos
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );

}
