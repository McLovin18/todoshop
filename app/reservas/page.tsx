"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { obtenerAlimentos } from "../lib/alimentos-db";
import { obtenerCategoriasAlimentos } from "../lib/categorias-db";
import type { Alimento } from "../lib/alimentos-db";
import { db } from "../lib/firebase";
import { doc, getDoc, query, where, getDocs, collection } from "firebase/firestore";
import { trackReserveFood } from "../lib/analytics";

export default function ReservasPage() {
  const searchParams = useSearchParams();
  const emprendedorIdFromUrl = searchParams?.get("emprendedor") || "";
  const alimentoIdFromUrl = searchParams?.get("alimento") || "";
  
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [selectedAlimento, setSelectedAlimento] = useState<Alimento | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExtras, setSelectedExtras] = useState<
    { nombre: string; precio: string }[]
  >([]);
  const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const diaActual = DIAS_SEMANA[new Date().getDay()];


  function toggleExtra(extra: { nombre: string; precio: string }) {
    setSelectedExtras(prev => {
      const existe = prev.some(e => e.nombre === extra.nombre);

      if (existe) {
        return prev.filter(e => e.nombre !== extra.nombre);
      }

      return [...prev, extra];
    });
  }

  const totalExtras = selectedExtras.reduce(
    (sum, extra) => sum + Number(extra.precio),
    0
  );

  useEffect(() => {
    async function loadData() {
      try {
        const [alimentosData, categoriasData] = await Promise.all([
          obtenerAlimentos({ incluirSinStock: true, emprendedorId: emprendedorIdFromUrl || undefined }),
          obtenerCategoriasAlimentos()
        ]);
        setAlimentos(alimentosData);
        setCategorias(categoriasData);
        
        // Si hay un alimento específico en la URL, seleccionarlo automáticamente
        if (alimentoIdFromUrl) {
          const alimento = alimentosData.find(a => a.id === alimentoIdFromUrl);
          if (alimento) {
            setSelectedAlimento(alimento);
          }
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [emprendedorIdFromUrl, alimentoIdFromUrl]);

  // Filtrar alimentos por día actual y categoría
  const alimentosFiltrados = alimentos.filter(alimento => {
    const disponibleHoy = !alimento.diasDisponibles || alimento.diasDisponibles.length === 0 || alimento.diasDisponibles.includes(diaActual);
    const categoriaMatch = !selectedCategoria || alimento.categoria === selectedCategoria;
    const stockDisponible = (alimento.stock || 0) > 0;
    
    return disponibleHoy && categoriaMatch && stockDisponible;
  });

  const categoriaSeleccionada = categorias.find(c => c.id === selectedCategoria);

  function handleReservar(alimento: Alimento) {
    setSelectedAlimento(alimento);
  }

  async function handleConfirmarReserva() {
    if (!selectedAlimento) return;

    // Obtener WhatsApp del emprendedor desde Firestore
    let whatsappEmprendedor = "593999999999"; // Valor por defecto
    
    if (selectedAlimento.emprendedorId) {
      try {
        const emprendedorDoc = await getDoc(doc(db, "emprendedores", selectedAlimento.emprendedorId));
        
        if (emprendedorDoc.exists()) {
          const data = emprendedorDoc.data();
          
          if (data.telefono) {
            whatsappEmprendedor = data.telefono.replace(/\D/g, '');
          }
        }
      } catch (error) {
        console.error("Error al obtener teléfono del emprendedor:", error);
      }
    }
    
    let mensaje = `Hola, quiero reservar: ${selectedAlimento.nombre}`;
    if (selectedExtras && selectedExtras.length > 0) {
      mensaje += ` ${selectedExtras.map(e => e.nombre).join("+ ")} (+$${selectedExtras.reduce((sum, e) => sum + Number(e.precio), 0)})`;
    }
    mensaje += `. Precio total: $${selectedAlimento.precio}${selectedExtras && selectedExtras.length > 0 ? ` + $${selectedExtras.reduce((sum, e) => sum + Number(e.precio), 0)}` : ""}`;
    
    const totalPrecio = Number(selectedAlimento.precio) + (selectedExtras ? selectedExtras.reduce((sum, e) => sum + Number(e.precio), 0) : 0);
    const cantidad = 1; // Por defecto 1 alimento por reserva
    
    // Track reserve event
    trackReserveFood(selectedAlimento.id, selectedAlimento.nombre, cantidad, totalPrecio);
    
    const whatsappUrl = `https://wa.me/${whatsappEmprendedor}?text=${encodeURIComponent(mensaje)}`;
    // Detectar si es móvil
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Móvil: evita bloqueo de popup, WhatsApp app intercepta el wa.me
      window.location.href = whatsappUrl;
    } else {
      // Desktop: abre WhatsApp Web en nueva pestaña sin problema
      window.open(whatsappUrl, "_blank");
    }
    
    setSelectedAlimento(null);
    setSelectedExtras([]);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando menú del día...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-orange-500 bg-clip-text text-transparent">
                🍽️ Reserva tu Alimento
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Menú disponible para hoy: <span className="font-semibold text-emerald-600">{diaActual}</span>
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
              <span className="text-2xl">📅</span>
              <span className="text-sm font-medium text-slate-700">{diaActual}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Categorías */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Categorías</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-emerald-200">
            <button
              onClick={() => setSelectedCategoria(null)}
              className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition ${
                !selectedCategoria
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200"
                  : "bg-white text-slate-600 border-2 border-slate-200 hover:border-emerald-300"
              }`}
            >
              🍽️ Todos
            </button>
            {categorias.map(categoria => (
              <button
                key={categoria.id}
                onClick={() => setSelectedCategoria(categoria.id)}
                className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition ${
                  selectedCategoria === categoria.id
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200"
                    : "bg-white text-slate-600 border-2 border-slate-200 hover:border-emerald-300"
                }`}
              >
                {categoria.icon || "🍴"} {categoria.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de alimentos */}
        {alimentosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No hay alimentos disponibles</h3>
            <p className="text-slate-600">
              {selectedCategoria
                ? `No hay alimentos de ${categoriaSeleccionada?.nombre} disponibles para ${diaActual}`
                : `No hay alimentos disponibles para ${diaActual}`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {alimentosFiltrados.map(alimento => (
              <div
                key={alimento.id}
                className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100"
              >
                {/* Imagen */}
                <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-orange-100 overflow-hidden">
                  {alimento.imagenes && alimento.imagenes.length > 0 && typeof alimento.imagenes[0] === "string" ? (
                    <img
                      src={alimento.imagenes[0]}
                      alt={alimento.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🍽️
                    </div>
                  )}
                  {alimento.destacado && (
                    <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow">
                      ⭐ Destacado
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2">{alimento.nombre}</h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{alimento.descripcion}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-emerald-600">${alimento.precio}</span>
                      {alimento.descuento && (
                        <span className="ml-2 text-sm text-red-500 line-through">${alimento.descuento}</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500">
                      Stock: {alimento.stock}
                    </div>
                  </div>

                  <button
                    onClick={() => handleReservar(alimento)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-2xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg shadow-emerald-200"
                  >
                    🛒 Reservar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de reserva */}
      {selectedAlimento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Reservar Alimento</h2>
                <button
                  onClick={() => {
                    setSelectedAlimento(null);
                    setSelectedExtras([]);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-3xl"
                >
                  ×
                </button>
              </div>

              {/* Imagen */}
              {selectedAlimento.imagenes && selectedAlimento.imagenes.length > 0 && typeof selectedAlimento.imagenes[0] === "string" && (
                <img
                  src={selectedAlimento.imagenes[0]}
                  alt={selectedAlimento.nombre}
                  className="w-full h-48 object-cover rounded-2xl mb-4"
                />
              )}

              {/* Información */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedAlimento.nombre}</h3>
                  <p className="text-slate-600 mt-1">{selectedAlimento.descripcion}</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                  <span className="text-slate-700">Precio base:</span>
                  <span className="text-2xl font-bold text-emerald-600">${selectedAlimento.precio}</span>
                </div>

                {/* Extras */}
                {selectedAlimento.extras && selectedAlimento.extras.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Opciones adicionales:</h4>
                    <div className="space-y-2">
                      {selectedAlimento.extras.map((extra, idx) => (
                      <label
                          key={idx}
                          className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${
                              selectedExtras.some(e => e.nombre === extra.nombre)
                                  ? "border-emerald-500 bg-emerald-50"
                                  : "border-slate-200 hover:border-emerald-300"
                          }`}
                      >
                          <div className="flex items-center gap-3">
                              <input
                                  type="checkbox"
                                  checked={selectedExtras.some(e => e.nombre === extra.nombre)}
                                  onChange={() => toggleExtra(extra)}
                                  className="h-5 w-5 accent-emerald-600"
                              />

                              <span className="font-medium text-slate-700">
                                  {extra.nombre}
                              </span>
                          </div>

                          <span className="font-bold text-emerald-600">
                              +${extra.precio}
                          </span>
                      </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl text-white">
                  <span className="font-semibold">Total a pagar:</span>
                  <span className="text-2xl font-bold">
                    ${Number(selectedAlimento.precio) + (selectedExtras ? totalExtras : 0)}
                  </span>
                </div>

                {/* Botón reservar */}
                <button
                  onClick={handleConfirmarReserva}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  <span>Reservar por WhatsApp</span>
                </button>

                <p className="text-center text-sm text-slate-500">
                  Al hacer clic, serás redirigido a WhatsApp para completar tu reserva con el emprendedor.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
