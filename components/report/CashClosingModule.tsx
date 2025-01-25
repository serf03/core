import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getUserFirebaseInstances } from "@/lib/userFirebase"
import { collection, query, where, getDocs, addDoc} from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"

interface Denomination {
  value: number
  quantity: number
}

interface Expense {
  description: string
  amount: number
}

interface CashClosing {
  date: Date
  initialAmount: number
  cashCounted: number
  accountsReceivable: number
  expenses: Expense[]
  expectedBalance: number
  difference: number
  totalGeneral: number
  notes: string
  idAdministrador: string
}

const CashClosingModule: React.FC = () => {
  const [denominations, setDenominations] = useState<Denomination[]>([
    { value: 100, quantity: 0 },
    { value: 50, quantity: 0 },
    { value: 20, quantity: 0 },
    { value: 10, quantity: 0 },
    { value: 5, quantity: 0 },
    { value: 1, quantity: 0 },
    { value: 0.25, quantity: 0 },
    { value: 0.1, quantity: 0 },
    { value: 0.05, quantity: 0 },
    { value: 0.01, quantity: 0 },
  ])
  const [accountsReceivable, setAccountsReceivable] = useState(0)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [initialAmount, setInitialAmount] = useState(0)
  const [notes, setNotes] = useState("")
  const [cashCounted, setCashCounted] = useState(0)
  const [expectedBalance, setExpectedBalance] = useState(0)
  const [difference, setDifference] = useState(0)
  const [totalGeneral, setTotalGeneral] = useState(0)
  const [idAdministrador, setIdAdministrador] = useState("")
  const [isClosed, setIsClosed] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const storedIdAdministrador = localStorage.getItem("uid")
    if (storedIdAdministrador) {
      setIdAdministrador(storedIdAdministrador)
      checkCashClosingStatus()
      fetchInitialAmount(storedIdAdministrador)
    }
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [denominations, accountsReceivable, expenses, initialAmount])

  const checkCashClosingStatus = () => {
    const today = new Date().toISOString().split("T")[0]
    const storedClosingDate = localStorage.getItem("lastCashClosingDate")
    if (storedClosingDate === today) {
      setIsClosed(true)
    } else {
      setIsClosed(false)
    }
  }

  const fetchInitialAmount = async (idAdministrador: string) => {
    try {
      const { db } = await getUserFirebaseInstances()
      const cashOpeningsRef = collection(db, "cashOpenings")
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const q = query(cashOpeningsRef, where("idAdministrador", "==", idAdministrador), where("date", ">=", today))
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const openingData = querySnapshot.docs[0].data()
        setInitialAmount(openingData.initialAmount)
      }
    } catch (error) {
      console.error("Error fetching initial amount:", error)
      toast({
        title: "Error",
        description: "No se pudo obtener el monto inicial de la caja.",
        variant: "destructive",
      })
    }
  }

  const handleDenominationChange = (index: number, quantity: number) => {
    const newDenominations = [...denominations]
    newDenominations[index].quantity = quantity
    setDenominations(newDenominations)
  }

  const handleExpenseAdd = () => {
    setExpenses([...expenses, { description: "", amount: 0 }])
  }

  const handleExpenseChange = (index: number, field: keyof Expense, value: string | number) => {
    const newExpenses = [...expenses]
    newExpenses[index][field] = value as never
    setExpenses(newExpenses)
  }

  const calculateTotals = () => {
    const totalCash = denominations.reduce((sum, d) => sum + d.value * d.quantity, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const calculatedExpectedBalance = initialAmount + totalCash - totalExpenses
    const calculatedDifference = totalCash - calculatedExpectedBalance
    const calculatedTotalGeneral = totalCash + accountsReceivable

    setCashCounted(totalCash)
    setExpectedBalance(calculatedExpectedBalance)
    setDifference(calculatedDifference)
    setTotalGeneral(calculatedTotalGeneral)
  }

  const handleCloseCash = async () => {
    if (!idAdministrador || isClosed) return

    try {
      const { db } = await getUserFirebaseInstances()
      const closingData: CashClosing = {
        date: new Date(),
        initialAmount,
        cashCounted,
        accountsReceivable,
        expenses,
        expectedBalance,
        difference,
        totalGeneral,
        notes,
        idAdministrador,
      }

      await addDoc(collection(db, "cashClosings"), closingData)

      // Store the closing date in localStorage
      const today = new Date().toISOString().split("T")[0]
      localStorage.setItem("lastCashClosingDate", today)

      setIsClosed(true)
      toast({
        title: "Cierre de caja exitoso",
        description: `Ingresos: $${cashCounted.toFixed(2)}, Gastos: $${expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}, Balance: $${totalGeneral.toFixed(2)}`,
      })
      generateReport(closingData)
    } catch (error) {
      console.error("Error al cerrar la caja:", error)
      toast({
        title: "Error al cerrar la caja",
        description: "Ha ocurrido un error al procesar el cierre de caja. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const generateReport = (data: CashClosing) => {
    // Generate PDF report
    const doc = new jsPDF()
    doc.text("Reporte de Cierre de Caja", 14, 15)
    doc.autoTable({
      head: [["Concepto", "Monto"]],
      body: [
        ["Monto Inicial", `$${data.initialAmount.toFixed(2)}`],
        ["Efectivo Contado", `$${data.cashCounted.toFixed(2)}`],
        ["Cuentas por Cobrar", `$${data.accountsReceivable.toFixed(2)}`],
        ["Gastos", `$${data.expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}`],
        ["Saldo Esperado", `$${data.expectedBalance.toFixed(2)}`],
        ["Diferencia", `$${data.difference.toFixed(2)}`],
        ["Total General", `$${data.totalGeneral.toFixed(2)}`],
      ],
    })
    doc.text(`Notas: ${data.notes}`, 14, doc.lastAutoTable.finalY + 10)
    doc.save("cierre_de_caja.pdf")

    // Generate Excel report
    const ws = XLSX.utils.json_to_sheet([
      { Concepto: "Monto Inicial", Monto: data.initialAmount },
      { Concepto: "Efectivo Contado", Monto: data.cashCounted },
      { Concepto: "Cuentas por Cobrar", Monto: data.accountsReceivable },
      { Concepto: "Gastos", Monto: data.expenses.reduce((sum, e) => sum + e.amount, 0) },
      { Concepto: "Saldo Esperado", Monto: data.expectedBalance },
      { Concepto: "Diferencia", Monto: data.difference },
      { Concepto: "Total General", Monto: data.totalGeneral },
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Cierre de Caja")
    XLSX.writeFile(wb, "cierre_de_caja.xlsx")
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Cierre de Caja</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label htmlFor="initialAmount">Monto Inicial</Label>
            <Input
              id="initialAmount"
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              disabled
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Conteo de Efectivo</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Denominación</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {denominations.map((d, index) => (
                  <TableRow key={d.value}>
                    <TableCell>${d.value.toFixed(2)}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={d.quantity}
                        onChange={(e) => handleDenominationChange(index, Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>${(d.value * d.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div>
            <Label htmlFor="accountsReceivable">Cuentas por Cobrar</Label>
            <Input
              id="accountsReceivable"
              type="number"
              value={accountsReceivable}
              onChange={(e) => setAccountsReceivable(Number(e.target.value))}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Gastos</h3>
            {expenses.map((expense, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <Input
                  placeholder="Descripción"
                  value={expense.description}
                  onChange={(e) => handleExpenseChange(index, "description", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Monto"
                  value={expense.amount}
                  onChange={(e) => handleExpenseChange(index, "amount", Number(e.target.value))}
                />
              </div>
            ))}
            <Button onClick={handleExpenseAdd}>Agregar Gasto</Button>
          </div>
          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="space-y-2">
            <p>
              <strong>Efectivo Contado:</strong> ${cashCounted.toFixed(2)}
            </p>
            <p>
              <strong>Saldo Esperado:</strong> ${expectedBalance.toFixed(2)}
            </p>
            <p>
              <strong>Diferencia:</strong> ${difference.toFixed(2)}
            </p>
            <p>
              <strong>Total General:</strong> ${totalGeneral.toFixed(2)}
            </p>
          </div>
          {Math.abs(difference) > 10 && (
            <Alert variant="destructive">
              <AlertTitle>Atención</AlertTitle>
              <AlertDescription>
                Hay una diferencia significativa entre el efectivo contado y el saldo esperado. Por favor, revise los
                montos ingresados y justifique la diferencia en las notas.
              </AlertDescription>
            </Alert>
          )}
          <Button onClick={handleCloseCash} disabled={isClosed}>
            {isClosed ? "Caja Cerrada" : "Finalizar Cierre de Caja"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CashClosingModule

