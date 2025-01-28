import React, { useState, useMemo, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format, parse } from "date-fns"
import { es } from "date-fns/locale"

const ITEMS_PER_PAGE = 10

const TabsReport = ({ invoices }) => {
  const [filter, setFilter] = useState({
    client: "",
    status: "",
    date: "",
    invoiceNumber: "",
  })
  const [currentPage, setCurrentPage] = useState(1)

  const handleFilterChange = useCallback((key, value) => {
    setFilter((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }, [])

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const clientMatch =
        filter.client === "" ||
        (invoice.clientId && invoice.clientId.toLowerCase().includes(filter.client.toLowerCase()))

      const statusMatch =
        filter.status === "" || filter.status === "all" || invoice.status.toLowerCase() === filter.status.toLowerCase()

      const dateMatch = filter.date === "" || invoice.date === filter.date

      const invoiceNumberMatch =
        filter.invoiceNumber === "" || invoice.invoiceNumber.toLowerCase().includes(filter.invoiceNumber.toLowerCase())

      return clientMatch && statusMatch && dateMatch && invoiceNumberMatch
    })
  }, [invoices, filter])

  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredInvoices, currentPage])

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = parse(dateString, "yyyy-MM-dd HH:mm a", new Date())
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date")
      }
      return format(date, "d 'de' MMMM, yyyy HH:mm", { locale: es })
    } catch (error) {
      console.error("Error parsing date:", error)
      return dateString // Return the original string if parsing fails
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold">Reporte Detallado de Facturas</h2>
      <div className="flex flex-wrap gap-4 mb-4">
        <Input
          placeholder="Número de factura"
          value={filter.invoiceNumber}
          onChange={(e) => handleFilterChange("invoiceNumber", e.target.value)}
          className="w-full sm:w-auto"
        />
        <Input
          type="date"
          value={filter.date}
          onChange={(e) => handleFilterChange("date", e.target.value)}
          className="w-full sm:w-auto"
        />
      </div>
      {paginatedInvoices.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número de Factura</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Saldo Pendiente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead>Monto Pagado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{formatDate(invoice.pickupDate)}</TableCell>
                    <TableCell>{formatCurrency(invoice.total)}</TableCell>
                    <TableCell>{formatCurrency(invoice.pendingBalance)}</TableCell>
                    <TableCell>{invoice.status}</TableCell>
                    <TableCell>{invoice.paymentType}</TableCell>
                    <TableCell>{formatCurrency(invoice.amountPaid)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <p>
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)} de {filteredInvoices.length} facturas
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                Anterior
              </Button>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">No se encontraron facturas que coincidan con los filtros aplicados.</p>
      )}
    </div>
  )
}

export default TabsReport

