"use client";

import Sidebar from "../components/Sidebar";
import BottomBar from "../components/BottomBar";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onIdTokenChanged, getIdTokenResult } from "firebase/auth";
import { getRoleFromFirebaseClaims } from "../lib/auth-roles";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function EmprendedorLayout({ children }: { children: React.ReactNode }) {
  const [tipoEmprendimiento, setTipoEmprendimiento] = useState<string | null>(null);
  const [role, setRole] = useState<string>("emprendedor");

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) return;
      
      try {
        // Forzar refresh del token para obtener claims actualizados
        await user.getIdToken(true);
        const tokenResult = await getIdTokenResult(user);
        const firebaseRole = getRoleFromFirebaseClaims((tokenResult?.claims as any) || {});
        
        console.log("Layout - Rol desde Firebase claims:", firebaseRole);
        setRole(firebaseRole);
        
        // Buscar tipo de emprendimiento en Firestore
        if (user?.uid) {
          const emprendedoresQuery = await getDocs(
            query(collection(db, "emprendedores"), where("uid", "==", user.uid))
          );
          
          if (!emprendedoresQuery.empty) {
            const data = emprendedoresQuery.docs[0].data();
            const tipo = data.tipoEmprendimiento || null;
            console.log("Layout - Tipo de emprendimiento desde Firestore:", tipo);
            setTipoEmprendimiento(tipo);
          } else {
            // Si no encuentra por uid, buscar por email
            if (user.email) {
              const emprendedoresQueryEmail = await getDocs(
                query(collection(db, "emprendedores"), where("email", "==", user.email.toLowerCase()))
              );
              
              if (!emprendedoresQueryEmail.empty) {
                const data = emprendedoresQueryEmail.docs[0].data();
                const tipo = data.tipoEmprendimiento || null;
                console.log("Layout - Tipo de emprendimiento desde Firestore (por email):", tipo);
                setTipoEmprendimiento(tipo);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error cargando datos del usuario:", error);
      }
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar role={role} tipoEmprendimiento={tipoEmprendimiento} />
      <main className="flex-1 min-h-screen">{children}</main>
      <BottomBar role={role} tipoEmprendimiento={tipoEmprendimiento} />
    </div>
  );
}
