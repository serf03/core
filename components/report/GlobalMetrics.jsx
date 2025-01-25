import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const GlobalMetrics = ({ invoices }) => {
  const totalIncome = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const pendingInvoices = invoices.filter((invoice) => invoice.status === "Pendiente").length
  const completedInvoices = invoices.filter((invoice) => invoice.status === "Finalizado").length
  const cancelledInvoices = invoices.filter((invoice) => invoice.status === "Anulado").length
  const generalBalance = invoices.reduce((sum, invoice) => sum + invoice.pendingBalance, 0)
  const averageIncome = totalIncome / invoices.length || 0
  const uniqueClients = new Set(invoices.map((invoice) => invoice.clientId)).size

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Total de Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${totalIncome.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Facturas Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{pendingInvoices}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Facturas Completadas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{completedInvoices}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Facturas Anuladas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{cancelledInvoices}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Balance General</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${generalBalance.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Promedio de Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${averageIncome.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Clientes Únicos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{uniqueClients}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default GlobalMetrics

