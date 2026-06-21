"use client";

import React, { useEffect, useState } from "react";

type Emprendedor = {
  uid: string;
  email: string;
  displayName: string;
  tipoEmprendimiento: string;
  status?: string;
  createdAt?: number;
};

const tipos = [
  { value: "comida", label: "Venta de comida" },
  { value: "productos", label: "Venta de productos" },
];

export default function AdminEmprendedoresPage() {
  const [emprendedores, setEmprendedores] = useState<Emprendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    displayName: "",
    tipoEmprendimiento: "comida",
  });

  useEffect(() => {
    fetchEmprendedores();
  }, []);

  async function fetchEmprendedores() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/emprendedores", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "No se pudo cargar la lista");
      }
      const data = await res.json();
      setEmprendedores(data.emprendedores || []);
    } catch (err: any) {
      setError(err.message || "Error de red");
    }
    setLoading(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/emprendedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body?.error || "No se pudo pre-aprobar el emprendedor");
      }
      setSuccess("Emprendedor pre-aprobado correctamente. Ahora puede registrar su contraseña.");
      setFormData({ email: "", displayName: "", tipoEmprendimiento: "comida" });
      fetchEmprendedores();
    } catch (err: any) {
      setError(err.message || "Error al pre-aprobar el emprendedor");
    }

    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Emprendedores</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Crea y administra las cuentas de emprendedores con su tipo de emprendimiento.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] mb-8">
          <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Crear emprendedor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre completo</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Nombre del emprendedor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="emprendedor@ejemplo.com"
                />
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-800 dark:text-white mb-2">Registro de emprendedor</p>
                <p>Este formulario pre-aprueba el correo electrónico del emprendedor. El emprendedor completará su contraseña desde la página de inicio de sesión.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de emprendimiento</label>
                <select
                  className="mt-2 w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                  value={formData.tipoEmprendimiento}
                  onChange={(e) => setFormData({ ...formData, tipoEmprendimiento: e.target.value })}
                >
                  {tipos.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-70"
              >
                {saving ? "Guardando..." : "Crear emprendedor"}
              </button>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Resumen</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Los emprendedores creados aquí recibirán el rol <span className="font-semibold">emprendedor</span> y podrán acceder al panel de emprendedor.</p>
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Total de emprendedores</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{emprendedores.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Tipos de emprendimiento</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  {tipos.map((tipo) => (
                    <li key={tipo.value} className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 py-2 last:border-b-0">
                      <span>{tipo.label}</span>
                      <span>{emprendedores.filter((item) => item.tipoEmprendimiento === tipo.value).length}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Lista de emprendedores</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Revisa los emprendedores que se han creado desde el admin.</p>
            </div>
          </div>
          {loading ? (
            <div className="py-16 text-center text-slate-500 dark:text-slate-400">Cargando emprendedores...</div>
          ) : emprendedores.length === 0 ? (
            <div className="py-16 text-center text-slate-500 dark:text-slate-400">No hay emprendedores creados aún.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-700 dark:text-slate-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {emprendedores.map((item) => (
                    <tr key={item.uid} className="border-t border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-4">{item.displayName || "Sin nombre"}</td>
                      <td className="px-4 py-4">{item.email}</td>
                      <td className="px-4 py-4">{tipos.find((tipo) => tipo.value === item.tipoEmprendimiento)?.label || item.tipoEmprendimiento}</td>
                      <td className="px-4 py-4 capitalize">{item.status || "pending"}</td>
                      <td className="px-4 py-4">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("es-EC") : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
