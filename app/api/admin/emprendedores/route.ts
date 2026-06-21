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

    const snapshot = await db.collection("emprendedores").orderBy("createdAt", "desc").get();
    const emprendedores = snapshot.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        uid: data.uid || doc.id,
        status: data.status || "pending",
        ...data,
      };
    });

    return NextResponse.json({ success: true, emprendedores });
  } catch (error: any) {
    console.error("[api/admin/emprendedores] GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const verifyResult = await verifyAdmin(req);
    if (verifyResult instanceof NextResponse) return verifyResult;

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const displayName = String(body.displayName || "").trim();
    const tipoEmprendimiento = String(body.tipoEmprendimiento || "").trim();

    if (!email || !displayName || !tipoEmprendimiento) {
      return NextResponse.json({ success: false, error: "Todos los campos son requeridos" }, { status: 400 });
    }

    const existingInvite = await db
      .collection("emprendedores")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existingInvite.empty) {
      return NextResponse.json({ success: false, error: "Este email ya está pre-aprobado o registrado" }, { status: 400 });
    }

    try {
      const existingUser = await adminAuth.getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json({ success: false, error: "Este email ya está registrado" }, { status: 400 });
      }
    } catch (err: any) {
      if (err.code !== "auth/user-not-found") {
        throw err;
      }
    }

    await db.collection("emprendedores").add({
      uid: null, // Se actualizará cuando el usuario se registre
      email,
      displayName,
      tipoEmprendimiento,
      role: "emprendedor",
      status: "pending",
      createdAt: Date.now(),
      createdBy: {
        uid: verifyResult.uid,
        email: verifyResult.email || null,
      },
    });

    return NextResponse.json({
      success: true,
      emprendedor: {
        email,
        displayName,
        tipoEmprendimiento,
      },
    });
  } catch (error: any) {
    console.error("[api/admin/emprendedores] POST error:", error);
    if (error?.code === "auth/email-already-exists") {
      return NextResponse.json({ success: false, error: "Este email ya está registrado" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message || "Error interno" }, { status: 500 });
  }
}
