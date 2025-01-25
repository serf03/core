import { useEffect } from 'react'
import React, { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

const TabsReport = ({ invoices }) => {
  const [filteredInvoices, setFilteredInvoices] = useState(invoices)
  const [filter, setFilter] = useState({
    client: "",
    status: "",
    date: format(new Date(), "yyyy-MM-dd"),
  })

  const handleFilterChange = (key, value) => {
    const newFilter = { ...filter, [key]: value }
    setFilter(newFilter)

    const filtered = invoices.filter(
      (invoice) =>
        (newFilter.client === "" || invoice.clientId.toLowerCase().includes(newFilter.client.toLowerCase())) &&
        (newFilter.status === "" || invoice.status === newFilter.status) &&
        (newFilter.date === "" || invoice.date === newFilter.date),
    )

    setFilteredInvoices(filtered)
  }

useEffect(() => {
  const filtered = invoices.filter(
    (invoice) =>
      (filter.client === "" || invoice.clientId.toLowerCase().includes(filter.client.toLowerCase())) &&
      (filter.status === "" || invoice.status === filter.status) &&
      (filter.date === "" || invoice.date === filter.date),
  )

  setFilteredInvoices(filtered)
  console.log("filtered", invoices)
}, [invoices, filter])


  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Reporte Detallado de Facturas</h2>
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Filtrar por cliente"
          value={filter.client}
          onChange={(e) => handleFilterChange("client", e.target.value)}
        />
        <Select onValueChange={(value) => handleFilterChange("status", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Pendiente">Pendiente</SelectItem>
            <SelectItem value="Finalizado">Finalizado</SelectItem>
            <SelectItem value="Anulado">Anulado</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={filter.date} onChange={(e) => handleFilterChange("date", e.target.value)} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número de Factura</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Saldo Pendiente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Método de Pago</TableHead>
            <TableHead>Descuento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.invoiceNumber}</TableCell>
              <TableCell>{invoice.pickupDate || "N/A"}</TableCell>
              <TableCell>${invoice.total}</TableCell>
              <TableCell>${invoice.pendingBalance}</TableCell>
              <TableCell>{invoice.status}</TableCell>
              <TableCell>{invoice.paymentType}</TableCell>
              <TableCell>${invoice.discount || 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default TabsReport

