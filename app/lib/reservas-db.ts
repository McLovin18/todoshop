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
  orderBy,
  serverTimestamp
} from "firebase/firestore";

const COLLECTION = "reservas";

export interface Reserva {
  id: string;
  alimentoId: string;
  alimentoNombre: string;
  alimentoPrecio: string;
  extra?: { nombre: string; precio: string };
  total: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail?: string;
  emprendedorId: string;
  emprendedorNombre: string;
  emprendedorWhatsapp: string;
  fechaReserva: Date;
  fechaCreacion: any;
  estado: "pendiente" | "confirmada" | "completada" | "cancelada";
  notas?: string;
  createdAt?: number | Date;
  [key: string]: any;
}

// Crear reserva
export async function crearReserva(reserva: Omit<Reserva, "id" | "fechaCreacion" | "createdAt">): Promise<Reserva> {
  const reservaConFecha = {
    ...reserva,
    fechaCreacion: serverTimestamp(),
    createdAt: Date.now(),
  };
  const docRef = await addDoc(collection(db, COLLECTION), reservaConFecha);
  return { ...reserva, id: docRef.id, createdAt: Date.now(), fechaCreacion: serverTimestamp() } as Reserva;
}

// Obtener reservas del emprendedor
export async function obtenerReservasPorEmprendedor(emprendedorId: string): Promise<Reserva[]> {
  const q = query(
    collection(db, COLLECTION),
    where("emprendedorId", "==", emprendedorId),
    orderBy("fechaReserva", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reserva));
}

// Obtener reservas por fecha
export async function obtenerReservasPorFecha(emprendedorId: string, fecha: Date): Promise<Reserva[]> {
  const inicioDia = new Date(fecha);
  inicioDia.setHours(0, 0, 0, 0);
  const finDia = new Date(fecha);
  finDia.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, COLLECTION),
    where("emprendedorId", "==", emprendedorId),
    where("fechaReserva", ">=", inicioDia),
    where("fechaReserva", "<=", finDia),
    orderBy("fechaReserva", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reserva));
}

// Obtener reserva por ID
export async function obtenerReservaPorId(id: string): Promise<Reserva | null> {
  const docSnap = await getDoc(doc(db, COLLECTION, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Reserva;
}

// Actualizar estado de reserva
export async function actualizarEstadoReserva(id: string, estado: Reserva["estado"]): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { estado });
}

// Actualizar reserva
export async function actualizarReserva(id: string, data: Partial<Reserva>): Promise<void> {
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
  await updateDoc(doc(db, COLLECTION, id), cleanData);
}

// Eliminar reserva
export async function eliminarReserva(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
