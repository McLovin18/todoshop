import { NextRequest, NextResponse } from "next/server";
import { adminAuth, db } from "../../../../../lib/firebase-admin";
import { getRoleFromFirebaseClaims } from "../../../../../lib/auth-roles";

async function verifyAdmin(req: NextRequest) {
  const sessionCookie = req.cookies.get("session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ success: false, error: "Sesión no encontrada" }, { status: 401 });
  }

  const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
  const role = getRoleFromFirebaseClaims(decoded as any);
  if (role !== "admin") {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
  }

  return decoded;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const verifyResult = await verifyAdmin(req);
    if (verifyResult instanceof NextResponse) return verifyResult;

    const { destacado } = await req.json();
    const { uid } = await params;

    // Buscar el documento del emprendedor por el campo uid
    const emprendedorSnapshot = await db.collection("emprendedores").where("uid", "==", uid).get();
    
    if (emprendedorSnapshot.empty) {
      return NextResponse.json({ success: false, error: "Emprendedor no encontrado" }, { status: 404 });
    }

    const emprendedorDoc = emprendedorSnapshot.docs[0];
    
    // Actualizar el campo destacado en Firestore usando admin API
    await emprendedorDoc.ref.update({ destacado });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error al actualizar destacado:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
