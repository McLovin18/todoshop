import { NextRequest, NextResponse } from "next/server";
import { adminAuth, db } from "../../../../lib/firebase-admin";
import { getRoleFromFirebaseClaims } from "../../../../lib/auth-roles";

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const verifyResult = await verifyAdmin(req);
    if (verifyResult instanceof NextResponse) return verifyResult;

    const { id: solicitudId } = await params;
    const body = await req.json();
    const action = body.action; // "approve" or "reject"

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ success: false, error: "Acción inválida" }, { status: 400 });
    }

    const solicitudDoc = await db.collection("solicitudes-emprendedores").doc(solicitudId).get();
    if (!solicitudDoc.exists) {
      return NextResponse.json({ success: false, error: "Solicitud no encontrada" }, { status: 404 });
    }

    const solicitud = solicitudDoc.data();
    if (!solicitud) {
      return NextResponse.json({ success: false, error: "Solicitud no encontrada" }, { status: 404 });
    }

    if (solicitud.status !== "pending") {
      return NextResponse.json({ success: false, error: "La solicitud ya fue procesada" }, { status: 400 });
    }

    if (action === "reject") {
      await db.collection("solicitudes-emprendedores").doc(solicitudId).update({
        status: "rejected",
        rejectedAt: Date.now(),
        rejectedBy: {
          uid: verifyResult.uid,
          email: verifyResult.email || null,
        },
      });

      return NextResponse.json({ success: true, message: "Solicitud rechazada" });
    }

    // Aprobar solicitud
    const email = solicitud.email;
    const nombreNegocio = solicitud.nombreNegocio;
    const tipoEmprendimiento = solicitud.tipoEmprendimiento;
    const categoriasSeleccionadas = solicitud.categoriasSeleccionadas || [];

    // Obtener nombres de categorías para el displayName
    let nombresCategorias: string[] = [];
    if (categoriasSeleccionadas.length > 0) {
      const collectionName = tipoEmprendimiento === "comida" ? "categoriasAlimentos" : "categorias";
      const categoriasSnapshot = await db.collection(collectionName).get();
      const categoriasMap = new Map(
        categoriasSnapshot.docs.map(doc => [doc.id, doc.data().nombre])
      );
      
      nombresCategorias = categoriasSeleccionadas
        .map((id: string) => categoriasMap.get(id))
        .filter(Boolean) as string[];
    }

    // Generar displayName con formato "Nombre - categorías"
    const displayName = nombresCategorias.length > 0
      ? `${nombreNegocio} - ${nombresCategorias.join(", ")}`
      : nombreNegocio;

    // Verificar si ya existe un usuario con este email
    try {
      const existingUser = await adminAuth.getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json({ success: false, error: "Este email ya está registrado en Firebase Auth" }, { status: 400 });
      }
    } catch (err: any) {
      if (err.code !== "auth/user-not-found") {
        throw err;
      }
    }

    // Verificar si ya existe en emprendedores
    const existingEmprendedor = await db
      .collection("emprendedores")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existingEmprendedor.empty) {
      return NextResponse.json({ success: false, error: "Este email ya está registrado como emprendedor" }, { status: 400 });
    }

    // Crear documento en emprendedores
    const emprendedorData: any = {
      uid: null, // Se actualizará cuando el usuario se registre
      email,
      displayName,
      tipoEmprendimiento,
      role: "emprendedor",
      status: "pending",
      createdAt: Date.now(),
      approvedBy: {
        uid: verifyResult.uid,
        email: verifyResult.email || null,
      },
      approvedAt: Date.now(),
      whatsapp: solicitud.whatsapp,
      nombreCompleto: solicitud.nombreCompleto,
      carrera: solicitud.carrera,
    };

    if (tipoEmprendimiento === "comida") {
      emprendedorData.tipoAlimentos = solicitud.tipoAlimentos;
      emprendedorData.preparaPersonalmente = solicitud.preparaPersonalmente;
      emprendedorData.aceptaNormasAlimentos = solicitud.aceptaNormasAlimentos;
    }

    await db.collection("emprendedores").add(emprendedorData);

    // Actualizar solicitud a aprobada
    await db.collection("solicitudes-emprendedores").doc(solicitudId).update({
      status: "approved",
      approvedAt: Date.now(),
      approvedBy: {
        uid: verifyResult.uid,
        email: verifyResult.email || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Solicitud aprobada correctamente. El emprendedor puede registrarse ahora.",
    });
  } catch (error: any) {
    console.error("[api/admin/solicitudes-emprendedores/[id]] PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message || "Error interno" }, { status: 500 });
  }
}
