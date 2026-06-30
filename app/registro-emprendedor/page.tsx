"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

type Categoria = {
  id: string;
  nombre: string;
  orden?: number;
};

export default function RegistroEmprendedorPage() {
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    nombreNegocio: "",
    email: "",
    whatsapp: "",
    carrera: "",
    tipoEmprendimiento: "comida",
    tipoAlimentos: "",
    preparaPersonalmente: false,
    aceptaNormasAlimentos: false,
    aceptaTerminos: false,
    aceptaResponsabilidad: false,
    categoriasSeleccionadas: [] as string[],
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Cargar categorías según tipo de emprendimiento
  useEffect(() => {
    const fetchCategorias = async () => {
      setLoadingCategorias(true);
      try {
        const tipo = formData.tipoEmprendimiento === "comida" ? "alimentos" : "productos";
        const res = await fetch(`/api/categorias?tipo=${tipo}`);
        const data = await res.json();
        if (data.success) {
          setCategorias(data.categorias || []);
        }
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
      setLoadingCategorias(false);
    };

    fetchCategorias();
    // Resetear categorías seleccionadas al cambiar tipo
    setFormData(prev => ({ ...prev, categoriasSeleccionadas: [] }));
  }, [formData.tipoEmprendimiento]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCategoriaToggle = (categoriaId: string) => {
    setFormData(prev => {
      const seleccionadas = prev.categoriasSeleccionadas;
      if (seleccionadas.includes(categoriaId)) {
        return {
          ...prev,
          categoriasSeleccionadas: seleccionadas.filter(id => id !== categoriaId),
        };
      }
      if (seleccionadas.length >= 3) {
        setError("Máximo 3 categorías seleccionadas");
        return prev;
      }
      return {
        ...prev,
        categoriasSeleccionadas: [...seleccionadas, categoriaId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validar categorías seleccionadas
    if (formData.categoriasSeleccionadas.length === 0) {
      setError("Debes seleccionar al menos 1 categoría");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/solicitudes-emprendedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al enviar la solicitud");
      }

      setSuccess("¡Solicitud enviada correctamente! Te notificaremos cuando sea aprobada.");
      setFormData({
        nombreCompleto: "",
        nombreNegocio: "",
        email: "",
        whatsapp: "",
        carrera: "",
        tipoEmprendimiento: "comida",
        tipoAlimentos: "",
        preparaPersonalmente: false,
        aceptaNormasAlimentos: false,
        aceptaTerminos: false,
        aceptaResponsabilidad: false,
        categoriasSeleccionadas: [],
      });
    } catch (err: any) {
      setError(err.message || "Error al enviar la solicitud");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Registro de Emprendedores
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Únete a nuestra plataforma y muestra tus productos al mundo
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                Información básica
              </h2>

              <div>
                <label htmlFor="nombreCompleto" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  id="nombreCompleto"
                  name="nombreCompleto"
                  value={formData.nombreCompleto}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="nombreNegocio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del negocio *
                </label>
                <input
                  type="text"
                  id="nombreNegocio"
                  name="nombreNegocio"
                  value={formData.nombreNegocio}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Correo institucional *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Este correo será usado para tu registro en la plataforma
                </p>
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  required
                  placeholder="+593 99 123 4567"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="carrera" className="block text-sm font-medium text-slate-71 dark:text-slate-300 mb-1">
                  Carrera *
                </label>
                <input
                  type="text"
                  id="carrera"
                  name="carrera"
                  value={formData.carrera}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tipo de emprendimiento */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                Tipo de emprendimiento
              </h2>

              <div>
                <label htmlFor="tipoEmprendimiento" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  ¿Qué tipo de productos vendes? *
                </label>
                <select
                  id="tipoEmprendimiento"
                  name="tipoEmprendimiento"
                  value={formData.tipoEmprendimiento}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="comida">Comida</option>
                  <option value="productos">Productos</option>
                </select>
              </div>

              {/* Selección de categorías */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Categorías de productos (máximo 3) *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selecciona las categorías principales de tus productos. Estas se mostrarán en tu nombre de emprendedor.
                </p>
                {loadingCategorias ? (
                  <p className="text-sm text-slate-500">Cargando categorías...</p>
                ) : categorias.length === 0 ? (
                  <p className="text-sm text-slate-500">No hay categorías disponibles</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categorias.map((categoria) => (
                      <label
                        key={categoria.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.categoriasSeleccionadas.includes(categoria.id)
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.categoriasSeleccionadas.includes(categoria.id)}
                          onChange={() => handleCategoriaToggle(categoria.id)}
                          className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                          {categoria.nombre}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-500">
                  Seleccionadas: {formData.categoriasSeleccionadas.length}/3
                </p>
              </div>

              {formData.tipoEmprendimiento === "comida" && (
                <div className="space-y-4 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-3">
                    Información adicional para vendedores de alimentos
                  </h3>

                  <div>
                    <label htmlFor="tipoAlimentos" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      ¿Qué tipo de alimentos vendes? *
                    </label>
                    <textarea
                      id="tipoAlimentos"
                      name="tipoAlimentos"
                      value={formData.tipoAlimentos}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Bolones, ceviches, postres, etc."
                    />
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="preparaPersonalmente"
                      name="preparaPersonalmente"
                      checked={formData.preparaPersonalmente}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="preparaPersonalmente" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                      ¿Preparas los alimentos personalmente?
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="aceptaNormasAlimentos"
                      name="aceptaNormasAlimentos"
                      checked={formData.aceptaNormasAlimentos}
                      onChange={handleChange}
                      required
                      className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="aceptaNormasAlimentos" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                      Acepto las normas de inocuidad y calidad alimentaria *
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Términos y condiciones */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                Términos generales
              </h2>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="aceptaTerminos"
                  name="aceptaTerminos"
                  checked={formData.aceptaTerminos}
                  onChange={handleChange}
                  required
                  className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="aceptaTerminos" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                  He leído y acepto los <Link href="/terminos" className="text-blue-600 hover:underline">Términos y Condiciones</Link> *
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="aceptaResponsabilidad"
                  name="aceptaResponsabilidad"
                  checked={formData.aceptaResponsabilidad}
                  onChange={handleChange}
                  required
                  className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="aceptaResponsabilidad" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                  Comprendo que soy responsable de los productos que comercializo *
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? "Enviando solicitud..." : "Enviar solicitud"}
            </button>

            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-300 text-sm text-center">{success}</p>
              </div>
            )}

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Tu solicitud será revisada por el administrador. Te notificaremos cuando sea aprobada.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
