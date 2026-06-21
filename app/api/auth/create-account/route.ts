import { NextRequest, NextResponse } from "next/server";
import { adminAuth, db } from "../../../lib/firebase-admin";
import { checkRateLimit, markRegistrationSuccess, isEmailRegistrationBlocked, normalizeIp } from "../../../lib/rate-limit-v2";

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  return forwardedFor ? forwardedFor.split(",")[0].trim() : (realIp || "unknown");
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email y password son requeridos" }, { status: 400 });
    }

    // Obtener IP del cliente
    const ip = normalizeIp(getClientIp(req));
    
    // CHEQUEO 1: ¿Está este email bloqueado por registro previo?
    const isBlocked = await isEmailRegistrationBlocked(email.trim().toLowerCase());
    if (isBlocked) {
      console.warn(`[create-account] Email ya registrado recientemente: ${email}`);
      return NextResponse.json(
        {
          error: "Este email se registró recientemente. Intenta en 5 minutos.",
          retryAfter: 300,
        },
        { status: 429, headers: { "Retry-After": "300" } }
      );
    }
    
    // CHEQUEO 2: Multi-capa rate limit (Email + IP)
    const rateLimit = await checkRateLimit(
      email.trim().toLowerCase(),
      ip,
      "register"
    );
    
    if (!rateLimit.allowed) {
      console.warn(`[create-account] Rate limit: ${rateLimit.reason}`);
      return NextResponse.json(
        {
          error: rateLimit.reason,
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter || 300) } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const pendingSnapshot = await db
      .collection("emprendedores")
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();

    if (pendingSnapshot.empty) {
      return NextResponse.json(
        { error: "Este correo no está pre-aprobado. Solicita acceso al administrador." },
        { status: 403 },
      );
    }

    const pendingDoc = pendingSnapshot.docs[0];
    const pendingData = pendingDoc.data() as any;

    if (pendingData.status === "completed") {
      return NextResponse.json(
        { error: "Este correo ya fue registrado" },
        { status: 400 },
      );
    }

    // Evitar invitaciones duplicadas cuando el email ya existe en Auth
    try {
      const existingUser = await adminAuth.getUserByEmail(normalizedEmail);
      if (existingUser) {
        return NextResponse.json(
          { error: "Este correo ya está registrado" },
          { status: 400 },
        );
      }
    } catch (error: any) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    // Crear usuario en Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: normalizedEmail,
      password: password,
      displayName: displayName?.trim() || pendingData.displayName || undefined,
      emailVerified: false,
    });

    await adminAuth.setCustomUserClaims(userRecord.uid, { role: "emprendedor" });

    // Actualizar la invitación/pre-aprobación como completada.
    await db.collection("emprendedores").doc(pendingDoc.id).update({
      uid: userRecord.uid,
      status: "completed",
      registeredAt: Date.now(),
    });

    // ÉXITO: Bloquear email por 7 días (anti-spam)
    await markRegistrationSuccess(normalizedEmail, 7);

    console.log(`[create-account] ✅ ${userRecord.email}`);

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
    });

  } catch (err: any) {
    console.error("[create-account] Error:", err);
    
    if (err.code === "auth/email-already-exists") {
      return NextResponse.json({ error: "Email ya registrado" }, { status: 400 });
    }
    if (err.code === "auth/invalid-password") {
      return NextResponse.json({ error: "Contraseña muy corta" }, { status: 400 });
    }

    return NextResponse.json(
      { error: err.message || "Error al crear cuenta" },
      { status: 500 }
    );
  }
}
