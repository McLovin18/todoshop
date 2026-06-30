"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/firebase-auth";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc, setDoc, query, where, getDocs, collection } from "firebase/firestore";

export default function EmprendedorHomePage() {
  const [tipoEmprendimiento, setTipoEmprendimiento] = useState<string | null>(null);
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emprendedorId, setEmprendedorId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserData() {
      const user = await getCurrentUser();
      setTipoEmprendimiento(user?.tipoEmprendimiento || null);
      
      if (user?.email) {
        try {
          // Buscar documento por email
          const q = query(collection(db, "emprendedores"), where("email", "==", user.email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data();
            // Priorizar whatsapp, sino usar telefono
            setTelefono(data.whatsapp || data.telefono || "");
            setEmprendedorId(docSnap.id);
          }
        } catch (error) {
          console.error("Error al cargar teléfono:", error);
        }
      }
    }
    loadUserData();
  }, []);

  const handleSaveTelefono = async () => {
    const user = await getCurrentUser();
    if (!user?.email || !emprendedorId) {
      alert("No se encontró tu documento de emprendedor");
      return;
    }

    setSaving(true);
    try {
      const emprendedorRef = doc(db, "emprendedores", emprendedorId);
      // Actualizar ambos campos para mantener consistencia
      await updateDoc(emprendedorRef, { 
        whatsapp: telefono,
        telefono: telefono 
      });
      alert("Número de WhatsApp actualizado correctamente");
    } catch (error) {
      console.error("Error al guardar teléfono:", error);
      alert("Error al guardar teléfono");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
          <h1 className="text-3xl font-semibold text-slate-900 mb-3">Panel de emprendedor</h1>
          <p className="text-slate-600 max-w-2xl mb-6">Gestiona tu inventario y crea reservas de comida para estudiantes desde un tablero simple y seguro.</p>
          
          {/* Campo de teléfono */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Número de WhatsApp</h3>
            <p className="text-sm text-slate-600 mb-4">Tu número de WhatsApp se usará para que los clientes te contacten cuando realicen compras. Si escribiste mal tu número en el registro, puedes corregirlo aquí.</p>
            <div className="flex gap-3">
              <input
                type="tel"
                placeholder="+593 99 123 4567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border-2 border-slate-300 focus:border-emerald-500 focus:outline-none text-sm"
              />
              <button
                onClick={handleSaveTelefono}
                disabled={saving || !telefono.trim()}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Guardando..." : "Actualizar"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Mostrar Inventario solo para emprendedores de productos */}
          {(tipoEmprendimiento?.toLowerCase().includes("producto") || !tipoEmprendimiento) && (
            <Link href="/emprendedor/inventario" className="block rounded-3xl bg-linear-to-br from-violet-600 to-indigo-600 p-8 text-white shadow-lg hover:scale-[1.01] transition-transform">
              <h2 className="text-2xl font-semibold mb-3">Inventario</h2>
              <p className="text-slate-100">Crea, edita y controla tus productos de comida y bebidas disponibles para reserva.</p>
            </Link>
          )}

          {/* Mostrar Reservas solo para emprendedores de comida */}
          {(tipoEmprendimiento?.toLowerCase().includes("comida") || !tipoEmprendimiento) && (
            <Link href="/emprendedor/productosReserva" className="block rounded-3xl bg-linear-to-br from-emerald-600 to-teal-600 p-8 text-white shadow-lg hover:scale-[1.01] transition-transform">
              <h2 className="text-2xl font-semibold mb-3">Reservas de alimentos</h2>
              <p className="text-slate-100">Abre un pedido para estudiantes, reserva stock y coordina la fecha y hora de retiro.</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
