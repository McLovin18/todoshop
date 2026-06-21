import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";

const COLLECTION = "alimentos";

export interface Alimento {
  id: string;
  nombre: string;
  sku?: string;
  stock: number;
  precio: string;
  descuento?: number;
  categoria: string;
  subcategoria: string;
  emprendedorId?: string;
  email?: string; // Email del emprendedor
  descripcion: string;
  imagenes: (string | File)[];
  extras: { nombre: string; precio: string }[];
  diasDisponibles?: string[];
  destacado?: boolean;
  createdAt?: number | Date;
  fechaCreacion?: any;
  [key: string]: any;
}

// Crear alimento
export async function crearAlimento(alimento: Alimento, emprendedorId?: string, email?: string): Promise<Alimento> {
  // Limpiar valores undefined
  const cleanAlimento = Object.fromEntries(
    Object.entries(alimento).filter(([_, v]) => v !== undefined)
  );
  
  const alimentoConFecha = {
    ...cleanAlimento,
    createdAt: Date.now(),
    fechaCreacion: serverTimestamp(),
    ...(emprendedorId && { emprendedorId }),
    ...(email && { email }),
  };
  const docRef = await addDoc(collection(db, COLLECTION), alimentoConFecha);
  return { ...alimento, id: docRef.id, createdAt: Date.now(), ...(emprendedorId && { emprendedorId }) };
}

// Obtener todos los alimentos
export async function obtenerAlimentos(opts: { incluirSinStock?: boolean; emprendedorId?: string } = {}) {
  let q;
  if (opts.emprendedorId) {
    q = query(collection(db, COLLECTION), where("emprendedorId", "==", opts.emprendedorId));
  } else {
    q = collection(db, COLLECTION);
  }
  const snapshot = await getDocs(q);
  let alimentos = snapshot.docs.map(doc => {
    const data = doc.data();
    return { id: doc.id, ...data } as Alimento;
  });
  
  // Filtrar por stock si no se incluye sin stock
  if (!opts.incluirSinStock) {
    alimentos = alimentos.filter(a => (a.stock || 0) > 0);
  }
  
  return alimentos;
}

// Obtener alimento por ID
export async function obtenerAlimentoPorId(id: string): Promise<Alimento | null> {
  const docSnap = await getDoc(doc(db, COLLECTION, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Alimento;
}

// Actualizar alimento
export async function actualizarAlimento(id: string, data: Partial<Alimento>): Promise<void> {
  // Limpiar valores undefined
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
  await updateDoc(doc(db, COLLECTION, id), cleanData);
}

// Eliminar alimento
export async function eliminarAlimento(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
