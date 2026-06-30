import { NextRequest, NextResponse } from "next/server";
import { obtenerCategorias, obtenerCategoriasAlimentos } from "../../lib/categorias-db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo"); // "productos" o "alimentos"

    let categorias;

    if (tipo === "alimentos") {
      categorias = await obtenerCategoriasAlimentos();
    } else {
      categorias = await obtenerCategorias();
    }

    return NextResponse.json({ success: true, categorias });
  } catch (error: any) {
    console.error("[api/categorias] GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Error interno" }, { status: 500 });
  }
}
