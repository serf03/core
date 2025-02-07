import { doc, getDoc, setDoc } from "firebase/firestore"
import { db as dbadm } from "@/lib/firebaseClient";
import type { UserFirebaseConfig } from "./types"

// Función para obtener el UID del administrador
function getAdminId(): string | null {
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null; // Asegúrate de que el uid está disponible 
  return user.idAdm;
}

// Función para obtener o crear la configuración del usuario en Firestore
export async function getUserFirebaseConfig(): Promise<UserFirebaseConfig | null> {
  const userId = getAdminId()
  if (!userId) {
    console.warn("No se encontró UID en localStorage.")
    return null
  }
  const docRef = doc(dbadm, "userConfigs", userId)
  try {
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data() as UserFirebaseConfig
    } else {
      const defaultConfig: UserFirebaseConfig = {
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: "",
        measurementId: "",
        userId,
      }

      await setDoc(docRef, defaultConfig)
      console.log("Documento creado con configuración vacía. Por favor, actualice la configuración.")
      return defaultConfig
    }
  } catch (error) {
    console.error("Error al obtener o crear la configuración del usuario:", error)
    return null
  }
}

