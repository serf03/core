"use client"

import { useState, useEffect, useCallback } from "react"
import { getUserFirebaseInstances } from "@/lib/userFirebase"
import { collection, getDocs, query, orderBy, where, getDoc, doc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Loader2, AlertCircle, FileDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import * as XLSX from "xlsx"

const safeFormatDate = (
  date: Date | string | number | { toDate: () => Date } | null | undefined,
  formatString: string,
) => {
  if (!date) return "N/A"
  try {
    let dateObj: Date
    if (date instanceof Date) {
      dateObj = date
    } else if (typeof date === "object" && "toDate" in date) {
      dateObj = date.toDate()
    } else {
      dateObj = new Date(date)
    }
    return format(dateObj, formatString, { locale: es })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Fecha inválida"
  }
}

interface Client {
  id: string
  name: string
  cedula: string
  phone: string
  email: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  client: Client
  total: number
  date: Date
  pendingBalance: number
}

interface CierreDiario {
  id: string
  fecha: Date
  idAdministrador: string
  totalContado: number
  totalEsperado: number | null
  diferencia: number
  collectedAmount: number
  receivableAmount: number
  paidReceivables: number
  totalAmount: number
  detalles: Array<{
    cantidad: number
    denominacionId: number
    subtotal: number
  }>
  invoices: string[]
  newReceivables: string[]
  createdAt: string | { toDate: () => Date } | Date
}

interface AlertInfo {
  message: string
  details: string
}

const AdminId = () => localStorage.getItem("uid")

const CashClosing = () => {
  const [cierres, setCierres] = useState<CierreDiario[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCierre, setSelectedCierre] = useState<CierreDiario | null>(null)
  const [invoicesDetails, setInvoicesDetails] = useState<Invoice[]>([])
  const [newReceivablesDetails, setNewReceivablesDetails] = useState<Invoice[]>([])
  const [alertInfo, setAlertInfo] = useState<AlertInfo | null>(null)
  const { toast } = useToast()


  const fetchCierres = useCallback(async () => {
    try {
      const { db } = await getUserFirebaseInstances()
      const cierresQuery = query(
        collection(db, "cierresDiarios"),
        where("idAdministrador", "==", AdminId()),
        orderBy("fecha", "desc"),
      )

      const cierresSnapshot = await getDocs(cierresQuery)

      const cierresData = cierresSnapshot.docs.map((doc) => {
        const data = doc.data() as CierreDiario
        return {
          ...data,
          id: doc.id,
          fecha: data.fecha,
          createdAt: data.createdAt,
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
  }, [toast])

  useEffect(() => {
    fetchCierres()
  }, [fetchCierres])


  const fetchInvoiceDetails = async (invoiceIds: string[]) => {
    try {
      const { db } = await getUserFirebaseInstances()
      const invoicesData = await Promise.all(
        invoiceIds.map(async (invoiceId) => {
          const invoiceDoc = await getDoc(doc(db, "invoices", invoiceId))
          const invoiceData = invoiceDoc.data()

          let clientData: Client | null = null
          if (invoiceData?.clientId) {
            const clientDoc = await getDoc(doc(db, "clients", invoiceData.clientId))
            if (clientDoc.exists()) {
              clientData = {
                id: clientDoc.id,
                name: clientDoc.data().name || "Nombre no disponible",
                cedula: clientDoc.data().cedula || "N/A",
                phone: clientDoc.data().phone || "N/A",
                email: clientDoc.data().email || "N/A",
              }
            }
          }

          let invoiceDate: Date
          if (invoiceData?.date instanceof Date) {
            invoiceDate = invoiceData.date
          } else if (invoiceData?.date && typeof invoiceData.date.toDate === "function") {
            invoiceDate = invoiceData.date.toDate()
          } else if (invoiceData?.date && !isNaN(new Date(invoiceData.date).getTime())) {
            invoiceDate = new Date(invoiceData.date)
          } else {
            invoiceDate = new Date()
          }

          return {
            id: invoiceId,
            invoiceNumber: invoiceData?.invoiceNumber || "N/A",
            clientId: invoiceData?.clientId || "N/A",
            client: clientData || {
              id: "N/A",
              name: "Cliente desconocido",
              cedula: "N/A",
              phone: "N/A",
              email: "N/A",
            },
            total: invoiceData?.total || 0,
            date: invoiceDate,
            pendingBalance: invoiceData?.pendingBalance || 0,
          }
        }),
      )
      return invoicesData
    } catch (error) {
      console.error("Error al cargar los detalles de las facturas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de las facturas",
        variant: "destructive",
      })
      return []
    }
  }

  const handleRowClick = async (cierre: CierreDiario) => {
    setSelectedCierre(cierre)
    setAlertInfo(null)
    const invoicesDetails = await fetchInvoiceDetails(cierre.invoices)
    setInvoicesDetails(invoicesDetails)
    const newReceivablesDetails = await fetchInvoiceDetails(cierre.newReceivables)
    setNewReceivablesDetails(newReceivablesDetails)
    checkCashBalance(cierre, invoicesDetails, newReceivablesDetails)
  }

  const checkCashBalance = (cierre: CierreDiario, invoices: Invoice[], newReceivables: Invoice[]) => {
    const totalDenominaciones = cierre.detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0)
    const totalFacturas = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
    const totalNewReceivables = newReceivables.reduce((sum, invoice) => sum + invoice.total, 0)
    const totalEsperado = totalFacturas - totalNewReceivables

    const diferenciaDenominaciones = Math.abs(cierre.totalContado - totalDenominaciones)
    const diferenciaEsperado = Math.abs(cierre.totalContado - totalEsperado)

    if (diferenciaDenominaciones > 0.01 || diferenciaEsperado > 0.01) {
      const message = "Los montos no están cuadrados correctamente."
      let details = ""

      if (diferenciaDenominaciones > 0.01) {
        details += `La suma de las denominaciones (RD$${totalDenominaciones.toFixed(2)}) no coincide con el total contado (RD$${cierre.totalContado.toFixed(2)}). `
      }

      if (diferenciaEsperado > 0.01) {
        details += `El total esperado (RD$${totalEsperado.toFixed(2)}) no coincide con el total contado (RD$${cierre.totalContado.toFixed(2)}). `
      }

      details += `Diferencia detectada: RD$${Math.max(diferenciaDenominaciones, diferenciaEsperado).toFixed(2)}.`

      setAlertInfo({ message, details })
    } else {
      setAlertInfo(null)
    }
  }

  const formatDataForExcel = (cierre: CierreDiario, invoices: Invoice[], newReceivables: Invoice[]) => {
    const generalInfo = [
      ["Fecha del Cierre", safeFormatDate(cierre.fecha, "PPpp")],
      ["Total Contado", `RD$${cierre.totalContado.toFixed(2)}`],
      ["Total Esperado", cierre.totalEsperado !== null ? `RD$${cierre.totalEsperado.toFixed(2)}` : "N/A"],
      ["Diferencia", `RD$${cierre.diferencia.toFixed(2)}`],
      ["Monto Cobrado", `RD$${cierre.collectedAmount.toFixed(2)}`],
      ["Monto por Cobrar", `RD$${cierre.receivableAmount.toFixed(2)}`],
      ["Cuentas por Cobrar Pagadas", `RD$${cierre.paidReceivables.toFixed(2)}`],
      ["Monto Total", `RD$${cierre.totalAmount.toFixed(2)}`],
      ["Facturas Cerradas", cierre.invoices.length],
      ["Nuevas Cuentas por Cobrar", cierre.newReceivables.length],
    ]

    const denominaciones = cierre.detalles.map((detalle) => [
      `RD$${detalle.subtotal / detalle.cantidad}`,
      detalle.cantidad,
      `RD$${detalle.subtotal.toFixed(2)}`,
    ])

    const facturasData = invoices.map((invoice) => [
      invoice.invoiceNumber,
      invoice.client.name,
      invoice.client.cedula,
      safeFormatDate(invoice.date, "dd/MM/yyyy"),
      `RD$${invoice.total.toFixed(2)}`,
    ])

    const newReceivablesData = newReceivables.map((invoice) => [
      invoice.invoiceNumber,
      invoice.client.name,
      invoice.client.cedula,
      safeFormatDate(invoice.date, "dd/MM/yyyy"),
      `RD$${invoice.total.toFixed(2)}`,
      `RD$${invoice.pendingBalance.toFixed(2)}`,
    ])

    return {
      generalInfo,
      denominaciones,
      facturasData,
      newReceivablesData,
    }
  }

  const exportToExcel = async () => {
    if (!selectedCierre) return

    try {
      const data = formatDataForExcel(selectedCierre, invoicesDetails, newReceivablesDetails)

      const wb = XLSX.utils.book_new()

      // Hoja de Resumen General
      const wsGeneral = XLSX.utils.aoa_to_sheet([["Resumen General"], [""], ...data.generalInfo])
      XLSX.utils.book_append_sheet(wb, wsGeneral, "Resumen General")

      // Hoja de Denominaciones
      const wsDenominaciones = XLSX.utils.aoa_to_sheet([
        ["Detalles de Denominaciones"],
        [""],
        ["Denominación", "Cantidad", "Subtotal"],
        ...data.denominaciones,
      ])
      XLSX.utils.book_append_sheet(wb, wsDenominaciones, "Denominaciones")

      // Hoja de Facturas Cerradas
      const wsFacturas = XLSX.utils.aoa_to_sheet([
        ["Facturas Cerradas"],
        [""],
        ["Número de Factura", "Cliente", "Cédula", "Fecha", "Total"],
        ...data.facturasData,
      ])
      XLSX.utils.book_append_sheet(wb, wsFacturas, "Facturas Cerradas")

      // Hoja de Nuevas Cuentas por Cobrar
      const wsNewReceivables = XLSX.utils.aoa_to_sheet([
        ["Nuevas Cuentas por Cobrar"],
        [""],
        ["Número de Factura", "Cliente", "Cédula", "Fecha", "Total", "Balance Pendiente"],
        ...data.newReceivablesData,
      ])
      XLSX.utils.book_append_sheet(wb, wsNewReceivables, "Nuevas Cuentas por Cobrar")

      // Generar el archivo Excel
      XLSX.writeFile(wb, `Cierre_Diario_${safeFormatDate(selectedCierre.fecha, "yyyy-MM-dd")}.xlsx`)

      toast({
        title: "Exportación Exitosa",
        description: "El archivo Excel ha sido generado y descargado.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error al exportar a Excel:", error)
      toast({
        title: "Error en la Exportación",
        description: "No se pudo generar el archivo Excel. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Historial de Cierres Diarios</CardTitle>
      </CardHeader>
      <CardContent>
        {cierres.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead className="text-right">Total Contado</TableHead>
                  <TableHead className="text-right">Total Esperado</TableHead>
                  <TableHead className="text-right">Diferencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cierres.map((cierre) => (
                  <TableRow
                    key={cierre.id}
                    onClick={() => handleRowClick(cierre)}
                    className="cursor-pointer hover:bg-muted"
                  >
                    <TableCell>{safeFormatDate(cierre.fecha, "PPpp")}</TableCell>
                    <TableCell className="text-right">RD${cierre.totalContado.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {cierre.totalEsperado !== null ? `RD$${cierre.totalEsperado.toFixed(2)}` : "N/A"}
                    </TableCell>
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

      <Dialog open={!!selectedCierre} onOpenChange={() => setSelectedCierre(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Cierre Diario</DialogTitle>
            <DialogDescription>
              Fecha: {selectedCierre && safeFormatDate(selectedCierre.fecha, "PPpp")}
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4">
            <Button onClick={exportToExcel} className="w-full">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar a Excel
            </Button>
          </div>
          {alertInfo && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{alertInfo.message}</AlertTitle>
              <AlertDescription>{alertInfo.details}</AlertDescription>
            </Alert>
          )}
          {selectedCierre && (
            <Tabs defaultValue="resumen" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="resumen">Resumen</TabsTrigger>
                <TabsTrigger value="denominaciones">Denominaciones</TabsTrigger>
                <TabsTrigger value="facturas">Facturas Cerradas</TabsTrigger>
                <TabsTrigger value="nuevasReceivables">Nuevas Cuentas por Cobrar</TabsTrigger>
              </TabsList>
              <TabsContent value="resumen">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen General</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <dt>Total Contado:</dt>
                      <dd className="font-semibold">RD${selectedCierre.totalContado.toFixed(2)}</dd>
                      <dt>Total Esperado:</dt>
                      <dd className="font-semibold">
                        {selectedCierre.totalEsperado !== null
                          ? `RD$${selectedCierre.totalEsperado.toFixed(2)}`
                          : "N/A"}
                      </dd>
                      <dt>Diferencia:</dt>
                      <dd
                        className={`font-semibold ${selectedCierre.diferencia >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        RD${selectedCierre.diferencia.toFixed(2)}
                      </dd>
                      <dt>Monto Cobrado:</dt>
                      <dd className="font-semibold">RD${selectedCierre.collectedAmount.toFixed(2)}</dd>
                      <dt>Monto por Cobrar:</dt>
                      <dd className="font-semibold">RD${selectedCierre.receivableAmount.toFixed(2)}</dd>
                      <dt>Cuentas por Cobrar Pagadas:</dt>
                      <dd className="font-semibold">RD${selectedCierre.paidReceivables.toFixed(2)}</dd>
                      <dt>Monto Total:</dt>
                      <dd className="font-semibold">RD${selectedCierre.totalAmount.toFixed(2)}</dd>
                      <dt>Facturas Cerradas:</dt>
                      <dd className="font-semibold">{selectedCierre.invoices.length}</dd>
                      <dt>Nuevas Cuentas por Cobrar:</dt>
                      <dd className="font-semibold">{selectedCierre.newReceivables.length}</dd>
                      <dt>Fecha de Creación:</dt>
                      <dd className="font-semibold">{safeFormatDate(selectedCierre.createdAt, "PPpp")}</dd>
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="denominaciones">
                <Card>
                  <CardHeader>
                    <CardTitle>Detalles de Denominaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Denominación</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCierre.detalles.map((detalle, index) => (
                          <TableRow key={index}>
                            <TableCell>RD${detalle.subtotal / detalle.cantidad}</TableCell>
                            <TableCell className="text-right">{detalle.cantidad}</TableCell>
                            <TableCell className="text-right">RD${detalle.subtotal.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={2} className="font-bold">
                            Total
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            RD${selectedCierre.detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="facturas">
                <Card>
                  <CardHeader>
                    <CardTitle>Facturas Cerradas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Número de Factura</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Cédula</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoicesDetails.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell>{invoice.invoiceNumber}</TableCell>
                            <TableCell>{invoice.client.name}</TableCell>
                            <TableCell>{invoice.client.cedula}</TableCell>
                            <TableCell>{safeFormatDate(invoice.date, "dd/MM/yyyy")}</TableCell>
                            <TableCell className="text-right">RD${invoice.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={4} className="font-bold">
                            Total
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            RD${invoicesDetails.reduce((sum, invoice) => sum + invoice.total, 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="nuevasReceivables">
                <Card>
                  <CardHeader>
                    <CardTitle>Nuevas Cuentas por Cobrar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Número de Factura</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Cédula</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">Balance Pendiente</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newReceivablesDetails.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell>{invoice.invoiceNumber}</TableCell>
                            <TableCell>{invoice.client.name}</TableCell>
                            <TableCell>{invoice.client.cedula}</TableCell>
                            <TableCell>{safeFormatDate(invoice.date, "dd/MM/yyyy")}</TableCell>
                            <TableCell className="text-right">RD${invoice.total.toFixed(2)}</TableCell>
                            <TableCell className="text-right">RD${invoice.pendingBalance.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={5} className="font-bold">
                            Total
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            RD${newReceivablesDetails.reduce((sum, invoice) => sum + invoice.total, 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default CashClosing

