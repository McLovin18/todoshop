"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Categoria = {
  id: string;
  nombre: string;
};

type Solicitud = {
  id: string;
  nombreCompleto: string;
  nombreNegocio: string;
  email: string;
  whatsapp: string;
  carrera: string;
  tipoEmprendimiento: string;
  tipoAlimentos?: string;
  preparaPersonalmente?: boolean;
  aceptaNormasAlimentos?: boolean;
  aceptaTerminos: boolean;
  aceptaResponsabilidad: boolean;
  categoriasSeleccionadas?: string[];
  status: string;
  createdAt: number;
};

export default function AdminSolicitudesEmprendedoresPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [processing, setProcessing] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasAlimentos, setCategoriasAlimentos] = useState<Categoria[]>([]);

  useEffect(() => {
    fetchSolicitudes();
    fetchCategorias();
  }, []);

  async function fetchCategorias() {
    try {
      const [resProductos, resAlimentos] = await Promise.all([
        fetch("/api/categorias?tipo=productos"),
        fetch("/api/categorias?tipo=alimentos"),
      ]);

      const [dataProductos, dataAlimentos] = await Promise.all([
        resProductos.json(),
        resAlimentos.json(),
      ]);

      if (dataProductos.success) setCategorias(dataProductos.categorias || []);
      if (dataAlimentos.success) setCategoriasAlimentos(dataAlimentos.categorias || []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  }

  async function fetchSolicitudes() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/solicitudes-emprendedores", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "No se pudo cargar las solicitudes");
      }
      const data = await res.json();
      setSolicitudes(data.solicitudes || []);
    } catch (err: any) {
      setError(err.message || "Error de red");
    }
    setLoading(false);
  }

  const handleApprove = async (solicitud: Solicitud) => {
    if (!confirm(`¿Aprobar la solicitud de ${solicitud.nombreNegocio}?`)) return;

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/solicitudes-emprendedores/${solicitud.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });

      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body?.error || "No se pudo aprobar la solicitud");
      }

      setSuccess(`Solicitud de ${solicitud.nombreNegocio} aprobada correctamente`);
      setSelectedSolicitud(null);
      fetchSolicitudes();

      // Abrir WhatsApp con mensaje de bienvenida e instrucciones
      const whatsappNumber = solicitud.whatsapp.replace(/\D/g, ''); // Eliminar caracteres no numéricos
      const mensaje = `¡Hola ${solicitud.nombreCompleto}! 🎉\n\nTu solicitud para *${solicitud.nombreNegocio}* ha sido aprobada en TodoMarket.\n\n📋 *Pasos para registrarte en la plataforma:*\n1. Ve a: www.todomarketec.com/login\n2. Usa tu correo institucional: ${solicitud.email}\n3. Crea una contraseña segura\n4. ¡Listo! Ya tendrás acceso a tu panel de emprendedor.\n\n📦 *Pasos para subir tus productos:*\n1. Entra a tu panel de emprendedor\n2. Ve a la sección de Inventario\n3. Haz clic en "Agregar producto"\n4. Completa la información (nombre, precio, imágenes, etc.)\n5. ¡Tu producto estará disponible para la comunidad!\n\nSi tienes alguna duda, contáctanos. ¡Bienvenido a la familia TodoMarket! 🚀`;
      
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
      window.open(whatsappUrl, '_blank');
    } catch (err: any) {
      setError(err.message || "Error al aprobar la solicitud");
    }

    setProcessing(false);
  };

  const handleReject = async (solicitud: Solicitud) => {
    if (!confirm(`¿Rechazar la solicitud de ${solicitud.nombreNegocio}?`)) return;

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/solicitudes-emprendedores/${solicitud.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });

      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body?.error || "No se pudo rechazar la solicitud");
      }

      setSuccess(`Solicitud de ${solicitud.nombreNegocio} rechazada`);
      setSelectedSolicitud(null);
      fetchSolicitudes();
    } catch (err: any) {
      setError(err.message || "Error al rechazar la solicitud");
    }

    setProcessing(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNombresCategorias = (categoriaIds: string[], tipoEmprendimiento: string) => {
    const cats = tipoEmprendimiento === "comida" ? categoriasAlimentos : categorias;
    const catMap = new Map(cats.map(c => [c.id, c.nombre]));
    return categoriaIds.map(id => catMap.get(id)).filter(Boolean) as string[];
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            ← Volver al panel de admin
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Solicitudes de Emprendedores
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gestiona las solicitudes de registro de nuevos emprendedores
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-300 text-sm">{success}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Cargando solicitudes...</p>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              No hay solicitudes pendientes de aprobación
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Solicitudes pendientes: <span className="text-blue-600 dark:text-blue-400">{solicitudes.length}</span>
              </p>
            </div>

            {solicitudes.map((solicitud) => (
              <div
                key={solicitud.id}
                className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border-l-4 border-blue-500"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {solicitud.nombreNegocio}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {solicitud.nombreCompleto}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">Email:</span>
                        <span className="ml-2 text-slate-600 dark:text-slate-400">{solicitud.email}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">WhatsApp:</span>
                        <span className="ml-2 text-slate-600 dark:text-slate-400">{solicitud.whatsapp}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">Carrera:</span>
                        <span className="ml-2 text-slate-600 dark:text-slate-400">{solicitud.carrera}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">Tipo:</span>
                        <span className="ml-2 text-slate-600 dark:text-slate-400 capitalize">
                          {solicitud.tipoEmprendimiento === "comida" ? "Comida" : "Productos"}
                        </span>
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Enviado:</span>
                        <span className="ml-2 text-slate-600 dark:text-slate-400">{formatDate(solicitud.createdAt)}</span>
                      </div>
                      {solicitud.categoriasSeleccionadas && solicitud.categoriasSeleccionadas.length > 0 && (
                        <div className="col-span-1 sm:col-span-2">
                          <span className="font-medium text-slate-700 dark:text-slate-300">Categorías:</span>
                          <span className="ml-2 text-slate-600 dark:text-slate-400">
                            {getNombresCategorias(solicitud.categoriasSeleccionadas, solicitud.tipoEmprendimiento).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {solicitud.tipoEmprendimiento === "comida" && (
                      <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-300 mb-1">
                          Información de alimentos
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-medium">Tipo:</span> {solicitud.tipoAlimentos}
                        </p>
                        {solicitud.preparaPersonalmente && (
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                            ✓ Prepara alimentos personalmente
                          </p>
                        )}
                        {solicitud.aceptaNormasAlimentos && (
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                            ✓ Acepta normas de inocuidad
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col gap-2">
                    <button
                      onClick={() => setSelectedSolicitud(solicitud)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                    >
                      Ver detalles
                    </button>
                    <button
                      onClick={() => handleApprove(solicitud)}
                      disabled={processing}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors text-sm font-medium"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleReject(solicitud)}
                      disabled={processing}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors text-sm font-medium"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de detalles */}
        {selectedSolicitud && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Detalles de la solicitud
                </h2>
                <button
                  onClick={() => setSelectedSolicitud(null)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Información personal</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Nombre completo:</span> {selectedSolicitud.nombreCompleto}</p>
                    <p><span className="font-medium">Nombre del negocio:</span> {selectedSolicitud.nombreNegocio}</p>
                    <p><span className="font-medium">Email:</span> {selectedSolicitud.email}</p>
                    <p><span className="font-medium">WhatsApp:</span> {selectedSolicitud.whatsapp}</p>
                    <p><span className="font-medium">Carrera:</span> {selectedSolicitud.carrera}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Tipo de emprendimiento</h3>
                  <p className="text-sm capitalize">
                    {selectedSolicitud.tipoEmprendimiento === "comida" ? "Comida" : "Productos"}
                  </p>
                </div>

                {selectedSolicitud.categoriasSeleccionadas && selectedSolicitud.categoriasSeleccionadas.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Categorías seleccionadas</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Categorías:</span> {getNombresCategorias(selectedSolicitud.categoriasSeleccionadas, selectedSolicitud.tipoEmprendimiento).join(", ")}</p>
                      <p className="text-xs text-slate-500">
                        Estas categorías se usarán para generar el nombre del emprendedor
                      </p>
                    </div>
                  </div>
                )}

                {selectedSolicitud.tipoEmprendimiento === "comida" && (
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Detalles de alimentos</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Tipo de alimentos:</span> {selectedSolicitud.tipoAlimentos}</p>
                      <p><span className="font-medium">Prepara personalmente:</span> {selectedSolicitud.preparaPersonalmente ? "Sí" : "No"}</p>
                      <p><span className="font-medium">Acepta normas:</span> {selectedSolicitud.aceptaNormasAlimentos ? "Sí" : "No"}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Términos aceptados</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Términos y condiciones:</span> {selectedSolicitud.aceptaTerminos ? "✓ Aceptado" : "✗ No aceptado"}</p>
                    <p><span className="font-medium">Responsabilidad:</span> {selectedSolicitud.aceptaResponsabilidad ? "✓ Aceptado" : "✗ No aceptado"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Fecha de envío</h3>
                  <p className="text-sm">{formatDate(selectedSolicitud.createdAt)}</p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      handleApprove(selectedSolicitud);
                    }}
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors font-medium"
                  >
                    Aprobar solicitud
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedSolicitud);
                    }}
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors font-medium"
                  >
                    Rechazar solicitud
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
