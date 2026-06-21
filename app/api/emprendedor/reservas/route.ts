import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "../../../../lib/firebase-admin";
import { crearReservaStock } from "../../../../lib/stock-reserves-db";
import { getRoleFromFirebaseClaims } from "../../../../lib/auth-roles";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "Sesión no encontrada" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const role = getRoleFromFirebaseClaims(decoded as any);
    if (role !== "emprendedor" && role !== "admin") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const {
      studentName,
      studentEmail,
      studentPhone,
      visitDate,
      visitTime,
      items,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Debe seleccionar al menos un producto" }, { status: 400 });
    }

    if (!studentName || !studentPhone || !visitDate || !visitTime) {
      return NextResponse.json({ success: false, error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const email = studentEmail?.trim() || decoded.email || "sin-email@example.com";
    const userId = decoded.uid;

    const reserveItems = items.map((item: any) => ({
      productId: item.productId,
      cantidad: Number(item.cantidad || 0),
      snapshot: {
        precio: Number(item.precio || 0),
        stock: Number(item.stock || 0),
        nombre: item.nombre || "Producto",
      },
    }));

    const metadata = {
      studentName: studentName.trim(),
      studentEmail: studentEmail?.trim() || null,
      studentPhone: studentPhone.trim(),
      visitDate: visitDate.trim(),
      visitTime: visitTime.trim(),
      createdBy: {
        uid: decoded.uid,
        email: decoded.email || null,
        role,
      },
    };

    const result = await crearReservaStock(userId, email, reserveItems, metadata);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || "No se pudo crear la reserva" }, { status: 500 });
    }

    return NextResponse.json({ success: true, reserveId: result.reserveId });
  } catch (error: any) {
    console.error("[api/emprendedor/reservas] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Error interno" }, { status: 500 });
  }
}
