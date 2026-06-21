"use client";
import React, { useState, useEffect } from "react";
import { uploadImageAndGetUrl } from "../../lib/upload-image";
import { obtenerCategoriasAlimentos } from "../../lib/categorias-db";

export type Alimento = {
  nombre: string;
  sku?: string;
  stock: number;
  precio: string;
  descuento?: number;
  categoria: string;
  subcategoria: string;
  imagenes: (string | File)[];
  descripcion: string;
  extras: { nombre: string; precio: string }[];
  diasDisponibles?: string[];
};

type AlimentoFormProps = {
  initialData?: Alimento | null;
  onSave?: (data: Alimento) => void;
  onCancel?: () => void;
};

export default function AlimentoForm({ initialData = null, onSave, onCancel }: AlimentoFormProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;
  
  const [nombre, setNombre] = useState<string>(initialData?.nombre || "");
  const [sku, setSku] = useState<string>(initialData?.sku || "");
  const [stock, setStock] = useState<number>(initialData?.stock || 0);
  const [precio, setPrecio] = useState<string>(initialData?.precio || "");
  const [descuento, setDescuento] = useState<string>(
    initialData?.descuento !== undefined && initialData?.descuento !== null
      ? String(initialData.descuento)
      : ""
  );
  const [categoria, setCategoria] = useState<string>(initialData?.categoria || "");
  const [subcategoria, setSubcategoria] = useState<string>(initialData?.subcategoria || "");
  const [imagenes, setImagenes] = useState<(string | File)[]>(initialData?.imagenes || []);
  const [descripcion, setDescripcion] = useState<string>(initialData?.descripcion || "");
  const [extras, setExtras] = useState<{ nombre: string; precio: string }[]>(initialData?.extras || []);
  const [nuevoExtraNombre, setNuevoExtraNombre] = useState<string>("");
  const [nuevoExtraPrecio, setNuevoExtraPrecio] = useState<string>("");
  const [diasDisponibles, setDiasDisponibles] = useState<string[]>(initialData?.diasDisponibles || []);

  const DIAS_SEMANA = [
    "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
  ];

  const [categoriasDb, setCategoriasDb] = useState<any[]>([]);
  
  useEffect(() => {
    obtenerCategoriasAlimentos().then(setCategoriasDb);
  }, []);

  const categorias = categoriasDb.map((cat: any) => ({
    value: cat.id,
    label: cat.nombre,
    subcategorias: cat.subcategorias || []
  }));
  const subcategoriasOptions = categorias.find((c: any) => c.value === categoria)?.subcategorias || [];

  function handleAddImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setImagenes([...imagenes, ...files]);
  }

  function handleRemoveImagen(idx: number) {
    setImagenes(imagenes.filter((_, i) => i !== idx));
  }

  function handleAddExtra() {
    if (nuevoExtraNombre.trim() && nuevoExtraPrecio.trim()) {
      setExtras([...extras, { nombre: nuevoExtraNombre.trim(), precio: nuevoExtraPrecio.trim() }]);
      setNuevoExtraNombre("");
      setNuevoExtraPrecio("");
    }
  }

  function handleRemoveExtra(idx: number) {
    setExtras(extras.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Subir imágenes
      const imagenesUrls: string[] = [];
      for (const img of imagenes) {
        if (img instanceof File) {
          const path = `alimentos/${Date.now()}_${img.name}`;
          const url = await uploadImageAndGetUrl(img, path);
          imagenesUrls.push(url);
        } else if (typeof img === "string" && img.trim()) {
          imagenesUrls.push(img);
        }
      }

      const data: Alimento = {
        nombre,
        sku,
        stock,
        precio,
        descuento: descuento ? Number(descuento) : undefined,
        categoria,
        subcategoria,
        imagenes: imagenesUrls,
        descripcion,
        extras,
        diasDisponibles,
      };

      if (onSave) {
        onSave(data);
      }
    } catch (error) {
      console.error("Error guardando alimento:", error);
      alert("Error al guardar el alimento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información General */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-900">Información General</h3>
        
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Nombre del alimento</span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej. Arroz con pollo"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Descripción</span>
          <textarea
            className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Describe el alimento, su sabor, presentación, etc."
            required
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Categoría de Alimento</span>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              value={categoria}
              onChange={e => {
                setCategoria(e.target.value);
                setSubcategoria("");
              }}
              required
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>

          {subcategoriasOptions.length > 0 && (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Subcategoría</span>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                value={subcategoria}
                onChange={e => setSubcategoria(e.target.value)}
                required
              >
                <option value="">Selecciona una subcategoría</option>
                {subcategoriasOptions.map((s: any) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </label>
          )}
        </div>
      </div>

      {/* Días Disponibles */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-900">Días Disponibles</h3>
        <p className="text-sm text-slate-600">Selecciona los días de la semana en que este alimento estará disponible para reserva.</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DIAS_SEMANA.map(dia => (
            <label key={dia} className="flex items-center gap-2 p-3 rounded-xl border-2 border-slate-200 hover:border-emerald-300 cursor-pointer transition">
              <input
                type="checkbox"
                checked={diasDisponibles.includes(dia)}
                onChange={e => {
                  if (e.target.checked) {
                    setDiasDisponibles([...diasDisponibles, dia]);
                  } else {
                    setDiasDisponibles(diasDisponibles.filter(d => d !== dia));
                  }
                }}
                className="h-5 w-5 accent-emerald-600"
              />
              <span className="text-sm font-medium text-slate-700">{dia}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Imágenes */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-900">Imágenes</h3>
        
        {imagenes.length > 0 && (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {imagenes.map((img, idx) => {
              const isFile = img instanceof File;
              const url = isFile ? URL.createObjectURL(img) : img;
              return (
                <div key={idx} className="relative group rounded-2xl border-2 border-slate-200 overflow-hidden">
                  <img src={url} alt={`foto-${idx}`} className="w-full aspect-square object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleRemoveImagen(idx)}
                      className="flex items-center justify-center gap-1 rounded-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 text-sm font-semibold transition"
                    >
                      <span className="material-icons-round text-base">delete</span>
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <label className="block">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleAddImagen}
            className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-white file:font-semibold"
          />
        </label>
      </div>

      {/* Información del Producto */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-900">Información del Producto</h3>
        
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Precio ($)</span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              type="number"
              step="0.01"
              min="0"
              value={precio}
              onChange={e => setPrecio(e.target.value)}
              placeholder="0.00"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Stock</span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              type="number"
              min="0"
              value={stock}
              onChange={e => setStock(Number(e.target.value))}
              placeholder="0"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Descuento (%)</span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              type="number"
              min="0"
              max="100"
              value={descuento}
              onChange={e => setDescuento(e.target.value)}
              placeholder="0"
            />
          </label>
        </div>
      </div>

      {/* Extras Opcionales */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-900">Extras Opcionales</h3>
        <p className="text-sm text-slate-500">Agrega productos extra que el cliente puede elegir (ej. jugo, postre, etc.)</p>
        
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              value={nuevoExtraNombre}
              onChange={e => setNuevoExtraNombre(e.target.value)}
              placeholder="Nombre del extra (ej. Jugo de naranja)"
            />
            <input
              className="w-32 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              type="number"
              step="0.01"
              value={nuevoExtraPrecio}
              onChange={e => setNuevoExtraPrecio(e.target.value)}
              placeholder="Precio"
            />
            <button
              type="button"
              onClick={handleAddExtra}
              className="px-4 py-3 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
            >
              Agregar
            </button>
          </div>
          {extras.length > 0 && (
            <div className="space-y-2 mt-3">
              {extras.map((extra, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-medium text-slate-800">{extra.nombre}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-emerald-600">${extra.precio}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExtra(idx)}
                      className="text-red-500 hover:text-red-700 font-semibold"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 rounded-2xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Guardando..." : (isEdit ? "Actualizar" : "Crear")}
        </button>
      </div>
    </form>
  );
}
