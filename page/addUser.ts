import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin"; // Nueva ruta
import { serverTimestamp } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" })
  }

  try {
    const { name, email, password, role, accessibleViews, idAdministrador } = req.body

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    })


    await adminDb
      .collection("users")
      .doc(userRecord.uid)
      .set({
        name,
        email,
        role,
        accessibleViews: accessibleViews || [],
        idAdministrador: idAdministrador || null,
        createdAt: serverTimestamp(),
      })

    res.status(200).json({ uid: userRecord.uid })
  } catch (error) {
    console.error("Error adding user:", error)
    res.status(500).json({ message: "Error adding user" })
  }
}

