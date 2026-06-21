"use client";
import React, { useState, useEffect } from "react";
import { obtenerReservasPorEmprendedor, actualizarEstadoReserva, type Reserva } from "../../lib/reservas-db";
import { getCurrentUser } from "../../lib/firebase-auth";
import { auth } from "../../lib/firebase";
import { onIdTokenChanged } from "firebase/auth";

export default function ReservasEmprendedorPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<Reserva["estado"] | "todas">("todas");
  const [emprendedorId, setEmprendedorId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) return;
      setEmprendedorId(user.uid);
      await cargarReservas(user.uid);
    });
    return () => unsubscribe();
  }, []);

  async function cargarReservas(uid: string) {
    try {
      setLoading(true);
      const data = await obtenerReservasPorEmprendedor(uid);
      setReservas(data);
    } catch (error) {
      console.error("Error cargando reservas:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleActualizarEstado(id: string, estado: Reserva["estado"]) {
    try {
      await actualizarEstadoReserva(id, estado);
      if (emprendedorId) {
        await cargarReservas(emprendedorId);
      }
    } catch (error) {
      console.error("Error actualizando estado:", error);
      alert("Error al actualizar el estado de la reserva");
    }
  }

  // Filtrar y ordenar reservas
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const reservasFiltradas = reservas
    .filter(r => filtroEstado === "todas" || r.estado === filtroEstado)
    .sort((a, b) => {
      const fechaA = new Date(a.fechaReserva);
      const fechaB = new Date(b.fechaReserva);
      
      // Prioridad: reservas de hoy y futuras primero
      const esHoyOFuturoA = fechaA >= hoy;
      const esHoyOFuturoB = fechaB >= hoy;
      
      if (esHoyOFuturoA && !esHoyOFuturoB) return -1;
      if (!esHoyOFuturoA && esHoyOFuturoB) return 1;
      
      // Dentro del mismo grupo, ordenar por fecha
      return fechaA.getTime() - fechaB.getTime();
    });

  const ESTADOS: { value: Reserva["estado"] | "todas"; label: string; color: string }[] = [
    { value: "todas", label: "Todas", color: "bg-slate-500" },
    { value: "pendiente", label: "Pendientes", color: "bg-yellow-500" },
    { value: "confirmada", label: "Confirmadas", color: "bg-emerald-500" },
    { value: "completada", label: "Completadas", color: "bg-blue-500" },
    { value: "cancelada", label: "Canceladas", color: "bg-red-500" },
  ];

  function getEstadoBadge(estado: Reserva["estado"]) {
    const config = {
      pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmada: "bg-emerald-100 text-emerald-800 border-emerald-200",
      completada: "bg-blue-100 text-blue-800 border-blue-200",
      cancelada: "bg-red-100 text-red-800 border-red-200",
    };
    return config[estado];
  }

  function formatearFecha(fecha: Date | string) {
    const f = typeof fecha === "string" ? new Date(fecha) : fecha;
    return f.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatearHora(fecha: Date | string) {
    const f = typeof fecha === "string" ? new Date(fecha) : fecha;
    return f.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-800">📅 Mis Reservas</h1>
          <p className="text-slate-600 mt-1">Gestiona las reservas de tus clientes</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-8">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-emerald-200">
            {ESTADOS.map(estado => (
              <button
                key={estado.value}
                onClick={() => setFiltroEstado(estado.value)}
                className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition ${
                  filtroEstado === estado.value
                    ? `${estado.color} text-white shadow-lg`
                    : "bg-white text-slate-600 border-2 border-slate-200 hover:border-emerald-300"
                }`}
              >
                {estado.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de reservas */}
        {reservasFiltradas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-200">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No hay reservas</h3>
            <p className="text-slate-600">
              {filtroEstado === "todas"
                ? "Aún no tienes reservas de clientes"
                : `No hay reservas con estado "${ESTADOS.find(e => e.value === filtroEstado)?.label}"`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Separador para hoy */}
            {reservasFiltradas.some(r => new Date(r.fechaReserva) >= hoy) && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-2xl">
                <h3 className="font-bold text-emerald-800">🗓️ Reservas de Hoy y Futuras</h3>
              </div>
            )}

            {reservasFiltradas.map(reserva => {
              const esHoyOFuturo = new Date(reserva.fechaReserva) >= hoy;
              const fechaReserva = new Date(reserva.fechaReserva);
              
              return (
                <div
                  key={reserva.id}
                  className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden ${
                    esHoyOFuturo ? "border-emerald-200" : "border-slate-200"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Información de la reserva */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">🍽️</div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-800">{reserva.alimentoNombre}</h3>
                            <p className="text-slate-600 mt-1">
                              Cliente: <span className="font-semibold">{reserva.clienteNombre}</span>
                            </p>
                            <p className="text-slate-600">
                              Teléfono: <a href={`tel:${reserva.clienteTelefono}`} className="text-emerald-600 hover:underline">{reserva.clienteTelefono}</a>
                            </p>
                            {reserva.clienteEmail && (
                              <p className="text-slate-600">
                                Email: <a href={`mailto:${reserva.clienteEmail}`} className="text-emerald-600 hover:underline">{reserva.clienteEmail}</a>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Fecha</p>
                            <p className="font-semibold text-slate-800">{formatearFecha(reserva.fechaReserva)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Hora</p>
                            <p className="font-semibold text-slate-800">{formatearHora(reserva.fechaReserva)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Total</p>
                            <p className="font-bold text-emerald-600 text-lg">${reserva.total}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Estado</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getEstadoBadge(reserva.estado)}`}>
                              {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                            </span>
                          </div>
                        </div>

                        {reserva.extra && (
                          <div className="bg-orange-50 p-3 rounded-xl">
                            <p className="text-sm text-orange-800">
                              <span className="font-semibold">Extra:</span> {reserva.extra.nombre} (+${reserva.extra.precio})
                            </p>
                          </div>
                        )}

                        {reserva.notas && (
                          <div className="bg-slate-50 p-3 rounded-xl">
                            <p className="text-sm text-slate-700">
                              <span className="font-semibold">Notas:</span> {reserva.notas}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-col gap-2 lg:min-w-[200px]">
                        {reserva.estado === "pendiente" && (
                          <>
                            <button
                              onClick={() => handleActualizarEstado(reserva.id, "confirmada")}
                              className="w-full bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 transition"
                            >
                              ✅ Confirmar
                            </button>
                            <button
                              onClick={() => handleActualizarEstado(reserva.id, "cancelada")}
                              className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition"
                            >
                              ❌ Cancelar
                            </button>
                          </>
                        )}
                        {reserva.estado === "confirmada" && (
                          <button
                            onClick={() => handleActualizarEstado(reserva.id, "completada")}
                            className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition"
                          >
                            🎉 Completar
                          </button>
                        )}
                        <a
                          href={`https://wa.me/${reserva.emprendedorWhatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition text-center"
                        >
                          💬 Contactar por WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Separador para pasadas */}
            {reservasFiltradas.some(r => new Date(r.fechaReserva) < hoy) && (
              <div className="bg-slate-100 border-l-4 border-slate-400 p-4 rounded-r-2xl mt-8">
                <h3 className="font-bold text-slate-700">📋 Reservas Pasadas</h3>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
