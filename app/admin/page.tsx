"use client";

import React from "react";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Panel de administración
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Arcoiris- Moda infantil
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            ¡Bienvenido!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Este es el panel de administración. Los clientes compran a través del catálogo y envían sus órdenes por WhatsApp.
          </p>
          <div className="mt-6">
            <Link href="/admin/emprendedores" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition">
              Gestionar emprendedores
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
