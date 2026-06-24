"use client";
import React, { useState, useEffect } from "react";
import { actualizarProducto } from "../../lib/productos-db";

type StockVariant = {
  id: string;
  nombre: string;
  cantidad: number;
};

interface StockEditModalProps {
  producto: any;
  onClose: () => void;
  onSave: () => void;
}

export default function StockEditModal({ producto, onClose, onSave }: StockEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [stockSimple, setStockSimple] = useState<number>(producto.stock || 0);
  const [stockVariants, setStockVariants] = useState<StockVariant[]>(
    Array.isArray(producto.stockVariants) ? producto.stockVariants : []
  );

  const hasVariants = stockVariants.length > 0;

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData: any = {};
      
      if (hasVariants) {
        updateData.stockVariants = stockVariants;
        updateData.stock = stockVariants.reduce((sum, v) => sum + Number(v.cantidad || 0), 0);
      } else {
        updateData.stock = stockSimple;
      }

      await actualizarProducto(producto.id, updateData);
      onSave();
      onClose();
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      alert("Error al actualizar el stock");
    }
    setLoading(false);
  };

  const updateVariantStock = (index: number, value: number) => {
    const newVariants = [...stockVariants];
    newVariants[index] = { ...newVariants[index], cantidad: value };
    setStockVariants(newVariants);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Modificar Stock</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-2">Producto: <span className="font-semibold">{producto.nombre}</span></p>
            <p className="text-xs text-slate-500">SKU: {producto.sku || producto.id}</p>
          </div>

          {hasVariants ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-700">Variantes:</p>
              {stockVariants.map((variant, index) => (
                <div key={variant.id || index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{variant.nombre}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateVariantStock(index, Math.max(0, variant.cantidad - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold text-slate-700"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={variant.cantidad}
                      onChange={(e) => updateVariantStock(index, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 text-center border-2 border-slate-300 rounded-lg py-2 font-semibold"
                    />
                    <button
                      onClick={() => updateVariantStock(index, variant.cantidad + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold text-slate-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="font-semibold text-emerald-800">Total:</span>
                <span className="font-bold text-emerald-800 text-lg">
                  {stockVariants.reduce((sum, v) => sum + Number(v.cantidad || 0), 0)}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-700">Stock actual:</p>
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => setStockSimple(Math.max(0, stockSimple - 1))}
                  className="w-12 h-12 rounded-xl bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold text-slate-700 text-xl"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={stockSimple}
                  onChange={(e) => setStockSimple(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-32 text-center border-2 border-slate-300 rounded-xl py-3 font-bold text-2xl"
                />
                <button
                  onClick={() => setStockSimple(stockSimple + 1)}
                  className="w-12 h-12 rounded-xl bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold text-slate-700 text-xl"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
