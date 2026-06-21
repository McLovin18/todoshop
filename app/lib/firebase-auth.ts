import { sendPasswordResetEmail as _sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";
import {
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	getIdToken,
	getIdTokenResult,
	User,
} from "firebase/auth";
import { getRoleFromFirebaseClaims } from "./auth-roles";

// RECUPERAR CONTRASEÑA
export async function sendPasswordResetEmail(email: string) {
	await _sendPasswordResetEmail(auth, email);
}

// LOGIN
export async function loginUser(email: string, password: string) {
	try {
		// ✅ Login normal con Firebase SDK
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;

		const idToken = await getIdToken(user, true);
		const tokenResult = await getIdTokenResult(user);
		const userRole = getRoleFromFirebaseClaims(tokenResult.claims as any);
		if (userRole !== "admin" && userRole !== "emprendedor") {
			await signOut(auth);
			throw new Error("Solo el administrador o el emprendedor puede iniciar sesión en esta tienda.");
		}

		return { success: true, user, idToken, role: userRole };
	} catch (error: any) {
		throw new Error(error.message || "Error al iniciar sesión");
	}
}

// LOGOUT
export async function logoutUser() {
	await signOut(auth);
}

// OBTENER USUARIO ACTUAL Y SU ROL
export async function getCurrentUser(): Promise<null | (User & { role?: string; tipoEmprendimiento?: string })> {
	return new Promise((resolve) => {
		onAuthStateChanged(auth, async (user) => {
			if (!user) return resolve(null);
			const idToken = await getIdToken(user, true);
			// Llama a tu API para obtener el rol desde el token/cookie
			try {
				const res = await fetch("/api/auth/me", {
					headers: { Authorization: `Bearer ${idToken}` },
				});
				console.log("[getCurrentUser] Status de la respuesta:", res.status);
				if (res.ok) {
					const data = await res.json();
					console.log("[getCurrentUser] Datos de la API:", data);
					return resolve({ ...user, role: data.role, tipoEmprendimiento: data.tipoEmprendimiento });
				} else {
					const errorData = await res.json();
					console.error("[getCurrentUser] Error en la API:", errorData);
				}
			} catch (e) {
				console.error("[getCurrentUser] Error:", e);
			}
			// Si falla, solo devuelve el usuario
			resolve(user);
		});
	});
}

// REDIRECCIÓN AUTOMÁTICA SI YA ESTÁ LOGUEADO
export async function redirectIfLoggedIn(router: any) {
	onAuthStateChanged(auth, async (user) => {
		if (!user) return;
		// Obtener el rol real del usuario desde el backend
		const idToken = await getIdToken(user, true);
		try {
			const res = await fetch("/api/auth/me", {
				headers: { Authorization: `Bearer ${idToken}` },
			});
			if (res.ok) {
				const data = await res.json();
				if (data.role === "admin") {
					router.push("/admin");
					return;
				}
				if (data.role === "emprendedor") {
					router.push("/emprendedor/inventario");
					return;
				}
			}
		} catch (e) {}
		router.push("/login");
	});
}
