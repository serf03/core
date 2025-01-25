"use client"

import { useState, useEffect } from "react"
import { getUserFirebaseInstances } from "@/lib/userFirebase"
import { collection, getDocs, query, orderBy, where } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Loader2 } from "lucide-react"

interface CierreDiario {
  id: string
  fecha: Date
  idAdministrador: string
  totalContado: number
  totalEsperado: number
  diferencia: number
}

const AdminId = () => localStorage.getItem("uid")

const CashClosing = () => {
  const [cierres, setCierres] = useState<CierreDiario[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchCierres()
  }, [])

  const fetchCierres = async () => {
    try {
      const { db } = await getUserFirebaseInstances()
      const cierresQuery = query(
        collection(db, "cierresDiarios"), 
        where("idAdministrador", "==", AdminId()), 
        orderBy("fecha", "desc")
    );

    const cierresSnapshot = await getDocs(cierresQuery);

      const cierresData = cierresSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          fecha: data.fecha?.toDate() || new Date(),
          idAdministrador: data.idAdministrador || "No disponible",
          totalContado: data.totalContado || 0,
          totalEsperado: data.totalEsperado || 0,
          diferencia: data.diferencia || 0,
        }
      })

      setCierres(cierresData)
    } catch (error) {
      console.error("Error al cargar los cierres:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los cierres diarios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Historial de Cierres Diarios</CardTitle>
      </CardHeader>
      <CardContent>
        {cierres.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y Hora</TableHead>
                  {/* <TableHead>Usuario</TableHead> */}
                  <TableHead className="text-right">Total Contado</TableHead>
                  <TableHead className="text-right">Total Esperado</TableHead>
                  <TableHead className="text-right">Diferencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cierres.map((cierre) => (
                  <TableRow key={cierre.id}>
                    {/* <TableCell className="font-mono text-sm">{cierre.id.slice(0, 8)}...</TableCell> */}
                    <TableCell>{format(cierre.fecha, "PPpp", { locale: es })}</TableCell>
                    {/* <TableCell>{cierre.idAdministrador}</TableCell> */}
                    <TableCell className="text-right">RD${cierre.totalContado.toFixed(2)}</TableCell>
                    <TableCell className="text-right">RD${cierre.totalEsperado.toFixed(2)}</TableCell>
                    <TableCell className={`text-right ${cierre.diferencia >= 0 ? "text-green-600" : "text-red-600"}`}>
                      RD${cierre.diferencia.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No hay cierres diarios registrados</div>
        )}
      </CardContent>
    </Card>
  )
}

export default CashClosing

