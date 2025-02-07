import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getUserFirebaseConfig } from "./mainFirebaseServices"

let userApp: FirebaseApp | null = null
let userDb: Firestore | null = null

export async function initializeUserFirebase() {
  if (userApp && userDb) return { app: userApp, db: userDb }

  try {
    const firebaseConfig = await getUserFirebaseConfig()
    if (!firebaseConfig) {
      throw new Error("No se pudo obtener la configuración de Firebase del usuario.")
    }

    const firebaseConfigs = {
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
      measurementId: firebaseConfig.measurementId,
    }

    // Check if an app with this name already exists
    const existingApp = getApps().find((app) => app.name === `user-${firebaseConfig.userId}`)

    if (existingApp) {
      userApp = existingApp
    } else {
      userApp = initializeApp(firebaseConfigs, `user-${firebaseConfig.userId}`)
    }

    userDb = getFirestore(userApp)

    return { app: userApp, db: userDb }
  } catch (error) {
    console.error("Error al inicializar Firebase del usuario:", error)
    throw error
  }
}

export async function getUserFirebaseInstances() {
  if (!userApp || !userDb) {
    return await initializeUserFirebase()
  }
  return { app: userApp, db: userDb }
}

