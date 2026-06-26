"use client";

import React, { useState, useEffect } from "react";
import { obtenerBodegas } from "../lib/bodegas-db";
import { useRouter } from "next/navigation";
import { getSnapshotPricing } from "../lib/pricing";
import { useUser } from "../context/UserContext";
import { obtenerAtributos } from "../lib/atributos-db";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

function resolveCartItemKey(item: any) {
  if (!item) return "";
  return item.cartKey || item.variantKey || item.id;
}

function resolveAvailableStock(item: any) {
  if (!item) return 0;

  // Soportar variaciones dinámicas (nuevo sistema)
  if (item.selectedVariations && item.variationAttributeIds && Array.isArray(item.stockVariants)) {
    const allSelected = item.variationAttributeIds.every((attrId: string) => item.selectedVariations[attrId]);
    if (allSelected) {
      const variant = item.stockVariants.find((v: any) => {
        return item.variationAttributeIds.every(
          (attrId: string) => v.attributes?.[attrId] === item.selectedVariations[attrId]
        );
      });
      if (variant) {
        return Number(variant.cantidad ?? 0);
      }
    }
  }

  // Soportar variaciones legacy (talla/color)
  if (item.selectedTalla && item.selectedColor && Array.isArray(item.stockVariants)) {
    const variant = item.stockVariants.find(
      (v: any) => v.talla === item.selectedTalla && v.color === item.selectedColor
    );
    const variantStock = Number(variant?.cantidad ?? variant?.stock ?? variant?.variantStock ?? 0);
    if (variantStock > 0 || variantStock === 0) {
      return variantStock;
    }
  }

  return Number(item.variantStock ?? item.stock ?? 0);
}


// --- Pagina principal del carrito
export default function CartPage() {
  const { carrito: carritoRaw, removeCarrito, addCarrito, user: userRaw } = useUser();
  const carrito = carritoRaw as any[];
  const user = userRaw as any;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isLogged } = useUser();
  const [atributos, setAtributos] = useState<any[]>([]);
  const [emprendedoresMap, setEmprendedoresMap] = useState<Map<string, any>>(new Map());

  const calcularPrecioData = (p: any) => {
    const { basePrice, discount, hasDiscount, fakeOldPrice, finalPrice } = getSnapshotPricing(p);
    return { basePrice, discount, hasDiscount, fakeOldPrice, finalPrice };
  };

  useEffect(() => {
  async function loadAtributos() {
    const data = await obtenerAtributos();
    setAtributos(data);
  }

  loadAtributos();
}, []);

  useEffect(() => {
    async function loadEmprendedores() {
      try {
        const emprendedoresSnapshot = await getDocs(collection(db, "emprendedores"));
        const map = new Map();
        emprendedoresSnapshot.forEach(doc => {
          const data = doc.data();
          map.set(data.uid, data);
        });
        setEmprendedoresMap(map);
      } catch (error) {
        console.error("Error al cargar emprendedores:", error);
      }
    }

    loadEmprendedores();
  }, []);




  const subtotal = carrito.reduce((sum, p) => {
    const { finalPrice } = calcularPrecioData(p);
    return sum + finalPrice * (p.cantidad || 1);
  }, 0);
  
  const total = subtotal;

  // Agrupar productos por emprendedor
  const groupedByEmprendedor = carrito.reduce((groups: any, product: any) => {
    const emprendedorId = product.emprendedorId || 'unknown';
    
    // Obtener nombre del emprendedor desde el producto o desde el mapa
    let emprendedorNombre = product.emprendedorNombre || product.emprendimientoNombre || product.tiendaNombre;
    if (!emprendedorNombre && emprendedorId !== 'unknown') {
      const emprendedorData = emprendedoresMap.get(emprendedorId);
      if (emprendedorData) {
        emprendedorNombre = emprendedorData.displayName || 'Emprendedor desconocido';
      }
    }
    
    emprendedorNombre = emprendedorNombre || 'Emprendedor desconocido';
    
    if (!groups[emprendedorId]) {
      groups[emprendedorId] = {
        emprendedorId,
        emprendedorNombre,
        productos: [],
        subtotal: 0
      };
    }
    
    groups[emprendedorId].productos.push(product);
    const { finalPrice } = calcularPrecioData(product);
    groups[emprendedorId].subtotal += finalPrice * (product.cantidad || 1);
    
    return groups;
  }, {});

  // Convertir a array y ordenar por número de productos (más productos primero)
  const sortedGroups = Object.values(groupedByEmprendedor).sort((a: any, b: any) => b.productos.length - a.productos.length);

  const generateWhatsAppMessage = async (emprendedorId: string): Promise<string> => {
    const bodegas = await obtenerBodegas();
    const bodegasMap = new Map(
      bodegas.map((b) => [b.id, b.tiempoEntrega])
    );

    // Obtener solo el grupo del emprendedor específico
    const group = groupedByEmprendedor[emprendedorId];
    if (!group) return "";

    let message = "Hola, me gustaría realizar una compra:\n\n";

    message += `🏪 ${group.emprendedorNombre}\n`;
    message += `━━━━━━━━━━━━━━━\n`;

    const productosText = group.productos
      .map((p: any) => {
        const tiempoEntrega =
          bodegasMap.get(p.bodegaId || "technothings") || 72;

        const { finalPrice } = calcularPrecioData(p);
        const lineTotal = finalPrice * (p.cantidad || 1);

        let variaciones = "";

        // Variaciones dinámicas
        if (
          p.selectedVariations &&
          p.variationAttributeIds &&
          p.variationAttributeIds.length > 0
        ) {
          variaciones = p.variationAttributeIds
            .map((attrId: string) => {
              const atributo = atributos.find(
                (a: any) => a.id === attrId
              );

              const attrName = atributo?.nombre || "Opción";
              const value = p.selectedVariations?.[attrId];

              return value
                ? `${attrName}: ${value}`
                : null;
            })
            .filter(Boolean)
            .join(" | ");
        }

        // Compatibilidad con sistema antiguo
        else if (p.selectedTalla || p.selectedColor) {
          const legacy: string[] = [];

          if (p.selectedTalla) {
            legacy.push(`Talla: ${p.selectedTalla}`);
          }

          if (p.selectedColor) {
            legacy.push(`Color: ${p.selectedColor}`);
          }

          variaciones = legacy.join(" | ");
        }

        return [
          `📦 ${p.nombre}`,
          `Cantidad: ${p.cantidad || 1}`,
          variaciones ? `: ${variaciones}` : null,
          `Precio unitario: $${finalPrice.toFixed(2)}`,
          `Subtotal: $${lineTotal.toFixed(2)}`,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");

    message += productosText;
    message += `\n💰 Subtotal: $${group.subtotal.toFixed(2)}\n\n`;
    message += `━━━━━━━━━━━━━━━━\n`;
    message += `TOTAL: $${group.subtotal.toFixed(2)}\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;
    message += `Quiero confirmar disponibilidad y conocer más detalles. Gracias!`;

    return encodeURIComponent(message);
  };

  const handleGenerarOrden = async (emprendedorId: string) => {
    // Obtener el número de teléfono del emprendedor específico
    const group = groupedByEmprendedor[emprendedorId];
    if (!group) return;

    let emprendedorTelefono = group?.productos?.[0]?.emprendedorTelefono || group?.productos?.[0]?.telefono;
    
    // Si no hay teléfono en el producto, buscar en la colección de emprendedores
    if (!emprendedorTelefono && group?.emprendedorId) {
      try {
        const emprendedorQuery = query(
          collection(db, "emprendedores"),
          where("uid", "==", group.emprendedorId)
        );
        const emprendedorSnapshot = await getDocs(emprendedorQuery);
        if (!emprendedorSnapshot.empty) {
          const emprendedorData = emprendedorSnapshot.docs[0].data();
          emprendedorTelefono = emprendedorData.telefono;
        }
      } catch (error) {
        console.error("Error al obtener teléfono del emprendedor:", error);
      }
    }
    
    // Si no hay teléfono del emprendedor, usar el número por defecto
    const whatsappNumber = emprendedorTelefono || process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "593996326003";
    const message = await generateWhatsAppMessage(emprendedorId);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  const handleCantidad = (id: string, cantidad: number) => {
    if (cantidad < 1) return;
    const prod = carrito.find((p) => resolveCartItemKey(p) === id);
    if (prod) {
      const availableStock = resolveAvailableStock(prod);
      if (cantidad > availableStock) {
        setError(
          `Solo hay ${availableStock} unidades disponibles en stock de "${prod.nombre}".`
        );
        return;
      }
      setError("");
      removeCarrito(id);
      addCarrito({ ...prod, cantidad });
    }
  };

  const EmptyCart = () => (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <span className="material-icons-round text-4xl text-slate-400 dark:text-slate-500">
          shopping_bag
        </span>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-white">
          Tu carrito está vacío
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Agrega productos para continuar
        </p>
      </div>
      <a
        href="/products-by-category"
        className="mt-2 inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-900 hover:border-black/60 hover:shadow-md font-semibold px-6 py-2.5 rounded-xl transition-colors shadow"
      >
        <span className="material-icons-round text-base">storefront</span>
        Ver productos
      </a>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white transition-colors">
        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
              Carrito
            </h1>
            {carrito.length > 0 && (
              <span className="bg-white border border-slate-300 text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full">
                {carrito.length} {carrito.length === 1 ? "producto" : "productos"}
              </span>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-6">
              <span className="material-icons-round text-base mt-0.5 shrink-0">error_outline</span>
              {error}
            </div>
          )}

          {carrito.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="space-y-10">
              {sortedGroups.map((group: any) => (
                <div key={group.emprendedorId} className="bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden py-4">
                  {/* Header del emprendedor */}
                  <div className="bg-gradient-to-r from-slate-400 to-slate-500 px-4 py-3">
                    <h2 className="text-white font-bold text-lg">
                      🏪 {group.emprendedorNombre}
                    </h2>
                    <p className="text-green-100 text-sm">
                      {group.productos.length} {group.productos.length === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>

                  {/* Lista de productos del emprendedor */}
                  <div className="p-4 space-y-3">
                    {group.productos.map((p: any) => {
                      const itemKey = resolveCartItemKey(p);
                      const { basePrice, discount, hasDiscount, fakeOldPrice, finalPrice } = calcularPrecioData(p);
                      const lineTotal = finalPrice * (p.cantidad || 1);
                      const availableStock = resolveAvailableStock(p);

                      return (
                        <div
                          key={itemKey}
                          className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-3 flex gap-3 sm:gap-4 items-start"
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                            <img
                              src={p.imagenes?.[0] || "/no-image.png"}
                              alt={p.nombre}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base leading-tight line-clamp-2">
                              {p.nombre}
                            </p>
                            {p.selectedTalla && p.selectedColor && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Talla {p.selectedTalla} · Color {p.selectedColor}
                              </p>
                            )}
                            {p.selectedVariations && p.variationAttributeIds && p.variationAttributeIds.length > 0 && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {p.variationAttributeIds.map((attrId: string) => {
                                  const atributo = atributos.find((a: any) => a.id === attrId);
                                  const attrName = atributo?.nombre || "Opción";
                                  const value = p.selectedVariations?.[attrId];
                                  return value
                                    ? `${attrName}: ${value}`
                                    : null;
                                }).filter(Boolean).join(" · ")}
                              </p>
                            )}

                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {hasDiscount && (
                                <span className="text-xs text-slate-400 line-through">
                                  ${fakeOldPrice?.toFixed(2)}
                                </span>
                              )}
                              <span className="text-sm font-bold text-slate-900 dark:text-white">
                                ${finalPrice.toFixed(2)}
                              </span>
                              {hasDiscount && (
                                <span className="text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full">
                                  -{discount}%
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5">
                                <button
                                  onClick={() => handleCantidad(itemKey, (p.cantidad || 1) - 1)}
                                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 font-bold text-base"
                                >
                                  -
                                </button>
                                <span className="w-7 text-center text-sm font-semibold">
                                  {p.cantidad || 1}
                                </span>
                                <button
                                  onClick={() => handleCantidad(itemKey, (p.cantidad || 1) + 1)}
                                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 font-bold text-base"
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-xs text-slate-400">
                                {availableStock} en stock
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end justify-between h-full gap-3 shrink-0">
                            <span className="font-bold text-sm sm:text-base">
                              ${lineTotal.toFixed(2)}
                            </span>
                            <button
                              onClick={() => removeCarrito(itemKey)}
                              className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              title="Eliminar"
                            >
                              <span className="material-icons-round text-xl">delete_outline</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Resumen de pago del emprendedor */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        Subtotal ({group.productos.reduce((n: number, p: any) => n + (p.cantidad || 1), 0)} items)
                      </span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        ${group.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleGenerarOrden(group.emprendedorId)}
                      className="mx-auto flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-900 font-bold text-sm rounded-xl transition-all shadow-md"
                      title="Enviar pedido a este emprendedor por WhatsApp"
                    >
                      <span>Generar orden para {group.emprendedorNombre}</span>
                    </button>
                  </div>
                </div>
              ))}

              <a
                href="/productos"
                className="inline-flex items-center gap-1.5 text-sm text-slate-900 dark:text-white hover:underline mt-1"
              >
                <span className="material-icons-round text-base">arrow_back</span>
                Continuar comprando
              </a>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
