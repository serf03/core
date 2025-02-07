"use client"

import React, { useState, useEffect } from "react"
import { collection, addDoc, getDocs, query, where, Timestamp, writeBatch, doc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Banknote, Coins, Eye, EyeOff } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getUserFirebaseInstances } from "@/lib/userFirebase"
import { format } from "date-fns"
import type { Invoice } from "@/lib/types"

type Denominacion = {
  id: number
  valor: number
  activa: boolean
  visible: boolean
}

type CantidadDenominacion = {
  denominacionId: number
  cantidad: number
}

// type CuentaPorCobrar = {
//   invoiceId: string
//   clientId: string
//   clientName: string
//   pendingBalance: number
//   invoiceNumber: string
//   date: string
// }

const DENOMINACIONES_INICIALES: Denominacion[] = [
  { id: 1, valor: 2000, activa: true, visible: true },
  { id: 2, valor: 1000, activa: true, visible: true },
  { id: 3, valor: 500, activa: true, visible: true },
  { id: 4, valor: 200, activa: true, visible: true },
  { id: 5, valor: 100, activa: true, visible: true },
  { id: 6, valor: 50, activa: true, visible: true },
  { id: 7, valor: 25, activa: true, visible: true },
  { id: 8, valor: 10, activa: true, visible: true },
  { id: 9, valor: 5, activa: true, visible: true },
  { id: 10, valor: 1, activa: true, visible: true },
]

const AdminId = () => localStorage.getItem("uid")

export default function TabCierreCaja() {
  const [denominaciones, setDenominaciones] = useState<Denominacion[]>([])
  const [cantidades, setCantidades] = useState<CantidadDenominacion[]>([])
  const [montoEsperado, setMontoEsperado] = useState<string>("")
  // const [cuentasPorCobrar, setCuentasPorCobrar] = useState<CuentaPorCobrar[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { toast } = useToast()

  // Nuevos estados para el cierre
  const [closingDate, setClosingDate] = useState(new Date())
  const [closedInvoices, setClosedInvoices] = useState<Invoice[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [receivableAmount, setReceivableAmount] = useState(0)
  const [collectedAmount, setCollectedAmount] = useState(0)
  const [paidReceivables, setPaidReceivables] = useState(0)
  const [newReceivables, setNewReceivables] = useState<Invoice[]>([])

  useEffect(() => {
    setClosingDate(new Date());
    const denominacionesGuardadas = localStorage.getItem("denominaciones")
    if (denominacionesGuardadas) {
      setDenominaciones(JSON.parse(denominacionesGuardadas))
    } else {
      setDenominaciones(DENOMINACIONES_INICIALES)
    }
  }, [])

  useEffect(() => {
    if (denominaciones.length > 0) {
      localStorage.setItem("denominaciones", JSON.stringify(denominaciones))
      setCantidades(denominaciones.map((d) => ({ denominacionId: d.id, cantidad: 0 })))
    }
  }, [denominaciones])

  // useEffect(() => {
  //   cargarCuentasPorCobrar()
  // }, [])

  // const cargarCuentasPorCobrar = async () => {
  //   try {
  //     const { db } = await getUserFirebaseInstances()
  //     const invoicesQuery = query(
  //       collection(db, "invoices"),
  //       where("idAdministrador", "==", AdminId()),
  //       where("pendingBalance", ">", 0),
  //     )
  //     const invoicesSnapshot = await getDocs(invoicesQuery)
  //     const invoices = invoicesSnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     })) as Invoice[]

  //     const clientIds = Array.from(new Set(invoices.map((invoice) => invoice.clientId)))
  //     const clientsQuery = query(collection(db, "clients"), where("id", "in", clientIds))
  //     const clientsSnapshot = await getDocs(clientsQuery)
  //     const clients = clientsSnapshot.docs.reduce<Record<string, Client>>((acc, doc) => {
  //       acc[doc.id] = { id: doc.id, ...doc.data() } as Client
  //       return acc
  //     }, {})

  //     const cuentas = invoices.map((invoice) => ({
  //       invoiceId: invoice.id,
  //       clientId: invoice.clientId,
  //       clientName: clients[invoice.clientId]?.name || "Cliente desconocido",
  //       pendingBalance: invoice.pendingBalance,
  //       invoiceNumber: invoice.invoiceNumber,
  //       date: invoice.date,
  //     }))

  //     setCuentasPorCobrar(cuentas)
  //   } catch (error) {
  //     console.error("Error al cargar las cuentas por cobrar:", error)
  //     toast({
  //       title: "Error",
  //       description: "Hubo un problema al cargar las cuentas por cobrar.",
  //       variant: "destructive",
  //     })
  //   }
  // }

  const handleCantidadChange = (id: number, cantidad: number) => {
    setCantidades(cantidades.map((c) => (c.denominacionId === id ? { ...c, cantidad } : c)))
  }

  const calcularTotal = () => {
    return cantidades.reduce((total, c) => {
      const denominacion = denominaciones.find((d) => d.id === c.denominacionId && d.activa)
      return total + (denominacion?.valor || 0) * c.cantidad
    }, 0)
  }

  const calculateClosingData = async () => {
    const { db } = await getUserFirebaseInstances()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const invoicesQuery = query(
      collection(db, "invoices"),
      where("idAdministrador", "==", AdminId()),
      where("date", ">=", today.toISOString().split("T")[0]),
    )

    const invoicesSnapshot = await getDocs(invoicesQuery)
    const invoices = invoicesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Invoice[]

    // Filter invoices that are not closed (either isClosed doesn't exist or is false)
    const unclosedInvoices = invoices.filter((invoice) => !("isClosed" in invoice) || invoice.isClosed === false)

    const totalAmount = unclosedInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
    const receivableAmount = unclosedInvoices.reduce((sum, invoice) => sum + invoice.pendingBalance, 0)
    const collectedAmount = totalAmount - receivableAmount

    const paidReceivablesQuery = query(
      collection(db, "invoices"),
      where("idAdministrador", "==", AdminId()),
      where("date", "<", today.toISOString().split("T")[0]),
      where("paymentDate", ">=", today.toISOString().split("T")[0]),
    )

    const paidReceivablesSnapshot = await getDocs(paidReceivablesQuery)
    const paidReceivables = paidReceivablesSnapshot.docs.reduce((sum, doc) => {
      const data = doc.data() as Invoice;
      return sum + (data?.amountPaid || 0); // Asegúrate de manejar valores nulos o indefinidos
    }, 0);
    
    const newReceivables = unclosedInvoices.filter((invoice) => invoice.pendingBalance > 0)

    setClosedInvoices(unclosedInvoices)
    setTotalAmount(totalAmount)
    setReceivableAmount(receivableAmount)
    setCollectedAmount(collectedAmount)
    setPaidReceivables(paidReceivables)
    setNewReceivables(newReceivables)

    
  }

  const openClosingDialog = async () => {
    await calculateClosingData()
    setShowConfirmDialog(true)
  }

  const finalizarCierre = async () => {
    const totalContado = calcularTotal()
    const totalEsperado = Number.parseFloat(montoEsperado) || 0
    const diferencia = totalContado - totalEsperado

    const detalles = cantidades
      .filter((c) => denominaciones.find((d) => d.id === c.denominacionId && d.activa))
      .map((c) => {
        const denominacion = denominaciones.find((d) => d.id === c.denominacionId)
        return {
          denominacionId: c.denominacionId,
          cantidad: c.cantidad,
          subtotal: (denominacion?.valor || 0) * c.cantidad,
        }
      })

    try {
      const { db } = await getUserFirebaseInstances()
      const closingRef = await addDoc(collection(db, "cierresDiarios"), {
        fecha: Timestamp.fromDate(closingDate),
        totalEsperado,
        totalContado,
        diferencia,
        detalles,
        createdAt: Timestamp.now(),
        idAdministrador: AdminId(),
        invoices: closedInvoices.map((inv) => inv.id),
        totalAmount,
        receivableAmount,
        collectedAmount,
        paidReceivables,
        newReceivables: newReceivables.map((inv) => inv.id),
      })

      // console.log("Closing data:", {
      //   fecha: closingDate,
      //   totalEsperado,
      //   totalContado,
      //   diferencia,
      //   detalles,
      //   idAdministrador: AdminId(),
      //   invoices: closedInvoices.map((inv) => inv.id),
      //   totalAmount,
      //   receivableAmount,
      //   collectedAmount,
      //   paidReceivables,
      //   newReceivables: newReceivables.map((inv) => inv.id),
      // })

      // Update invoices with isClosed flag
      const batch = writeBatch(db)
      closedInvoices.forEach((invoice) => {
        const invoiceRef = doc(db, "invoices", invoice.id)
        batch.update(invoiceRef, { isClosed: true, closingId: closingRef.id })
      })
      await batch.commit()

      toast({
        title: "Cierre diario guardado",
        description: "El cierre diario se ha guardado correctamente en Firebase.",
      })

      // Reset state
      setCantidades(denominaciones.map((d) => ({ denominacionId: d.id, cantidad: 0 })))
      setMontoEsperado("")
      setClosedInvoices([])
      setTotalAmount(0)
      setReceivableAmount(0)
      setCollectedAmount(0)
      setPaidReceivables(0)
      setNewReceivables([])
      setShowConfirmDialog(false)
    } catch (error) {
      console.error("Error al guardar el cierre diario:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al guardar el cierre diario.",
        variant: "destructive",
      })
    }
  }

  const toggleDenominacion = (id: number) => {
    setDenominaciones((prevDenominaciones) =>
      prevDenominaciones.map((d) => (d.id === id ? { ...d, activa: !d.activa } : d)),
    )
  }

  const toggleVisibilidad = (id: number) => {
    setDenominaciones((prevDenominaciones) =>
      prevDenominaciones.map((d) => (d.id === id ? { ...d, visible: !d.visible } : d)),
    )
  }

  const total = calcularTotal()
  // const diferencia = total - (Number.parseFloat(montoEsperado) || 0)

  return (
    <TabsContent value="cierre" className="space-y-4">
      <h2 className="text-2xl font-bold">Cierre</h2>
      <div className="flex justify-between items-center">
        <Tabs defaultValue="cierres" className="flex-grow">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="cierres">Cierre Diario</TabsTrigger>
            <TabsTrigger value="denominaciones">Denominaciones</TabsTrigger>
            {/* <TabsTrigger value="cuentas">Cuentas por Cobrar</TabsTrigger> */}
          </TabsList>

          <TabsContent value="cierres" className="mt-0 flex-grow">
            <Card className="flex-grow flex flex-col border-0 shadow-none">
              <CardHeader className="pt-4">
                <CardTitle className="text-xl font-bold">Cierre Diario</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col space-y-4 overflow-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-auto flex-grow">
                  {denominaciones
                    .filter((d) => d.visible && d.activa)
                    .map((denominacion) => {
                      const cantidad = cantidades.find((c) => c.denominacionId === denominacion.id)?.cantidad || 0
                      return (
                        <Card
                          key={denominacion.id}
                          className="bg-gradient-to-br from-primary/5 to-primary-foreground/5 hover:from-primary/10 hover:to-primary-foreground/10 transition-all duration-300"
                        >
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {denominacion.valor >= 100 ? (
                                  <Banknote className="h-6 w-6 text-primary" />
                                ) : (
                                  <Coins className="h-6 w-6 text-primary" />
                                )}
                                <p className="text-lg font-bold text-primary">RD${denominacion.valor}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <Input
                                type="number"
                                value={cantidad || ""}
                                onChange={(e) => handleCantidadChange(denominacion.id, Number(e.target.value))}
                                className="w-36 text-right pr-2 font-semibold"
                                min="0"
                              />
                              <p className="text-sm font-semibold text-primary-foreground">
                                RD${(denominacion.valor * cantidad).toFixed(2)}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>
                <Card className="bg-gradient-to-r from-secondary/30 to-secondary-foreground/30">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-secondary-foreground">Total Contado:</p>
                      <p className="text-lg font-bold text-primary">RD${total.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
                <Button
                  className="w-48 text-lg font-semibold py-4 bg-primary hover:bg-primary/90"
                  onClick={openClosingDialog}
                >
                  Finalizar Cierre
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="denominaciones" className="mt-0 flex-grow">
            <Card className="flex-grow flex flex-col border-0 shadow-none">
              <CardHeader className="pt-4">
                <CardTitle className="text-xl font-bold">Gestión de Denominaciones</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {denominaciones.map((denominacion) => (
                    <Card
                      key={denominacion.id}
                      className={`bg-gradient-to-br transition-all duration-300 ${
                        denominacion.activa
                          ? "from-primary/5 to-primary-foreground/5 hover:from-primary/10 hover:to-primary-foreground/10"
                          : "from-gray-200 to-gray-300"
                      }`}
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {denominacion.valor >= 100 ? (
                              <Banknote className="h-6 w-6 text-primary" />
                            ) : (
                              <Coins className="h-6 w-6 text-primary" />
                            )}
                            <p className="text-lg font-bold text-primary">RD${denominacion.valor}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={denominacion.activa}
                              onCheckedChange={() => toggleDenominacion(denominacion.id)}
                            />
                            <button
                              onClick={() => toggleVisibilidad(denominacion.id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {denominacion.visible ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
{/* 
          <TabsContent value="cuentas" className="mt-0 flex-grow">
            <Card className="flex-grow flex flex-col border-0 shadow-none">
              <CardHeader className="pt-4">
                <CardTitle className="text-xl font-bold">Cuentas por Cobrar</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-grow">
                <div className="overflow-auto h-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Cliente</TableHead>
                        <TableHead>Factura #</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Balance Pendiente</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cuentasPorCobrar.map((cuenta) => (
                        <TableRow key={cuenta.invoiceId}>
                          <TableCell className="font-medium">{cuenta.clientName}</TableCell>
                          <TableCell>{cuenta.invoiceNumber}</TableCell>
                          <TableCell>{format(new Date(cuenta.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell className="text-right">RD${cuenta.pendingBalance.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro de que quieres finalizar el cierre?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se guardará el cierre diario con los siguientes detalles:
                <br />
                Fecha de cierre: {format(closingDate, "dd/MM/yyyy HH:mm")}
                <br />
                Total Contado: RD${total.toFixed(2)}
                <br />
                Monto General Total: RD${totalAmount.toFixed(2)}
                <br />
                Monto por Cobrar: RD${receivableAmount.toFixed(2)}
                <br />
                Monto Cobrado: RD${collectedAmount.toFixed(2)}
                <br />
                Cuentas por Cobrar Pagadas: RD${paidReceivables.toFixed(2)}
                <br />
                Nuevas Cuentas por Cobrar: {newReceivables.length}
                <br />
                Facturas cerradas: {closedInvoices.length}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={finalizarCierre}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TabsContent>
  )
}

