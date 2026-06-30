import { NextRequest, NextResponse } from "next/server";
import { db } from "../../lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const nombreCompleto = String(body.nombreCompleto || "").trim();
    const nombreNegocio = String(body.nombreNegocio || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const whatsapp = String(body.whatsapp || "").trim();
    const carrera = String(body.carrera || "").trim();
    const tipoEmprendimiento = String(body.tipoEmprendimiento || "").trim();
    const tipoAlimentos = String(body.tipoAlimentos || "").trim();
    const preparaPersonalmente = Boolean(body.preparaPersonalmente);
    const aceptaNormasAlimentos = Boolean(body.aceptaNormasAlimentos);
    const aceptaTerminos = Boolean(body.aceptaTerminos);
    const aceptaResponsabilidad = Boolean(body.aceptaResponsabilidad);
    const categoriasSeleccionadas = Array.isArray(body.categoriasSeleccionadas) 
      ? body.categoriasSeleccionadas 
      : [];

    // Validaciones básicas
    if (!nombreCompleto || !nombreNegocio || !email || !whatsapp || !carrera || !tipoEmprendimiento) {
      return NextResponse.json({ success: false, error: "Todos los campos básicos son requeridos" }, { status: 400 });
    }

    if (!email.includes("@")) {
      return NextResponse.json({ success: false, error: "Email inválido" }, { status: 400 });
    }

    if (!categoriasSeleccionadas || categoriasSeleccionadas.length === 0) {
      return NextResponse.json({ success: false, error: "Debes seleccionar al menos 1 categoría" }, { status: 400 });
    }

    if (categoriasSeleccionadas.length > 3) {
      return NextResponse.json({ success: false, error: "Máximo 3 categorías permitidas" }, { status: 400 });
    }

    if (!aceptaTerminos || !aceptaResponsabilidad) {
      return NextResponse.json({ success: false, error: "Debes aceptar los términos y condiciones" }, { status: 400 });
    }

    // Si es comida, validar campos específicos
    if (tipoEmprendimiento === "comida") {
      if (!tipoAlimentos) {
        return NextResponse.json({ success: false, error: "Debes especificar el tipo de alimentos" }, { status: 400 });
      }
      if (!aceptaNormasAlimentos) {
        return NextResponse.json({ success: false, error: "Debes aceptar las normas de inocuidad alimentaria" }, { status: 400 });
      }
    }

    // Verificar si ya existe una solicitud con este email
    const existingSolicitud = await db
      .collection("solicitudes-emprendedores")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existingSolicitud.empty) {
      const existing = existingSolicitud.docs[0].data();
      if (existing.status === "pending") {
        return NextResponse.json({ success: false, error: "Ya tienes una solicitud pendiente de aprobación" }, { status: 400 });
      }
      if (existing.status === "approved") {
        return NextResponse.json({ success: false, error: "Este email ya ha sido aprobado como emprendedor" }, { status: 400 });
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

    // Crear solicitud
    const solicitudData: any = {
      nombreCompleto,
      nombreNegocio,
      email,
      whatsapp,
      carrera,
      tipoEmprendimiento,
      categoriasSeleccionadas,
      aceptaTerminos,
      aceptaResponsabilidad,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (tipoEmprendimiento === "comida") {
      solicitudData.tipoAlimentos = tipoAlimentos;
      solicitudData.preparaPersonalmente = preparaPersonalmente;
      solicitudData.aceptaNormasAlimentos = aceptaNormasAlimentos;
    }

    const docRef = await db.collection("solicitudes-emprendedores").add(solicitudData);

    return NextResponse.json({
      success: true,
      solicitudId: docRef.id,
      message: "Solicitud enviada correctamente. Te notificaremos cuando sea aprobada.",
    });
  } catch (error: any) {
    console.error("[api/solicitudes-emprendedores] POST error:", error);
    return NextResponse.json({ success: false, error: error.message || "Error interno" }, { status: 500 });
  }
}
