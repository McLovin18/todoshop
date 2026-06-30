import { NextRequest, NextResponse } from "next/server";
import { adminAuth, db } from "../../../lib/firebase-admin";
import { getRoleFromFirebaseClaims } from "../../../lib/auth-roles";

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

export async function GET(req: NextRequest) {
  try {
    const verifyResult = await verifyAdmin(req);
    if (verifyResult instanceof NextResponse) return verifyResult;

    const snapshot = await db
      .collection("solicitudes-emprendedores")
      .where("status", "==", "pending")
      .orderBy("createdAt", "desc")
      .get();

    const solicitudes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, solicitudes });
  } catch (error: any) {
    console.error("[api/admin/solicitudes-emprendedores] GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Error interno" }, { status: 500 });
  }
}
