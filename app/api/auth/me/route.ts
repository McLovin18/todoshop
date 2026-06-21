import { NextRequest, NextResponse } from "next/server";
import { adminAuth, db } from "../../../lib/firebase-admin";
import { getRoleFromFirebaseClaims } from "../../../lib/auth-roles";

export async function GET(req: NextRequest) {
  console.log("[/api/auth/me] Endpoint llamado");
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.log("[/api/auth/me] No auth header");
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const decoded = await adminAuth.verifyIdToken(token);
    
    console.log("[/api/auth/me] UID:", decoded.uid);
    console.log("[/api/auth/me] Email:", decoded.email);
    console.log("[/api/auth/me] Claims completos:", JSON.stringify(decoded, null, 2));
    
    const role = getRoleFromFirebaseClaims(decoded as any);
    console.log("[/api/auth/me] Role desde Firebase claims:", role);
    
    // Buscar tipo de emprendimiento si el usuario existe en la colección de emprendedores
    let finalRole = role;
    let tipoEmprendimiento = null;
    
    // Primero buscar por uid
    let emprendedorSnapshot = await db
      .collection("emprendedores")
      .where("uid", "==", decoded.uid)
      .limit(1)
      .get();
    
    console.log("[/api/auth/me] Snapshot size por uid:", emprendedorSnapshot.size);
    
    // Si no encuentra por uid, buscar por email
    if (emprendedorSnapshot.empty && decoded.email) {
      emprendedorSnapshot = await db
        .collection("emprendedores")
        .where("email", "==", decoded.email.toLowerCase())
        .limit(1)
        .get();
      
      console.log("[/api/auth/me] Snapshot size por email:", emprendedorSnapshot.size);
    }
    
    if (!emprendedorSnapshot.empty) {
      const emprendedorData = emprendedorSnapshot.docs[0].data();
      tipoEmprendimiento = emprendedorData.tipoEmprendimiento || null;
      console.log("[/api/auth/me] Datos del emprendedor:", emprendedorData);
      console.log("[/api/auth/me] Tipo de emprendimiento:", tipoEmprendimiento);
      console.log("[/api/auth/me] finalRole antes de condición:", finalRole);
      
      // El rol de admin tiene prioridad absoluta
      // Solo cambiar a emprendedor si NO es admin y NO es emprendedor
      if (finalRole !== "admin" && finalRole !== "emprendedor") {
        finalRole = "emprendedor";
        console.log("[/api/auth/me] Rol actualizado a emprendedor");
      } else {
        console.log("[/api/auth/me] Rol mantenido como:", finalRole, "(admin o emprendedor tiene prioridad)");
      }
    } else {
      console.log("[/api/auth/me] No se encontró documento de emprendedor para uid:", decoded.uid, "ni email:", decoded.email);
    }
    
    console.log("[/api/auth/me] Respuesta final:", { role: finalRole, tipoEmprendimiento });
    return NextResponse.json({ role: finalRole, tipoEmprendimiento });
  } catch (e) {
    console.error("[/api/auth/me] Error:", e);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
