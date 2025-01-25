import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ClientStatistics = ({ invoices, clients }) => {
  const clientInvoices = invoices.reduce((acc, invoice) => {
    if (!acc[invoice.clientId]) {
      acc[invoice.clientId] = { total: 0, count: 0 }
    }
    acc[invoice.clientId].total += invoice.total
    acc[invoice.clientId].count += 1
    return acc
  }, {})

  console.log("clientInvoices", clientInvoices)

  const topClients = Object.entries(clientInvoices)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([clientId, stats]) => {
      const clientInfo = (clients || []).find((client) => client.clientId === clientId) || {}
      return {
        clientId,
        name: clientInfo.name || "Cliente Desconocido",
        ...stats,
      }
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Clientes por Volumen de Facturación</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {topClients.map((client, index) => (
            <li key={client.clientId} className="mb-2">
              <span className="font-bold">
                {index + 1}. {client.name}
              </span>
              <span className="ml-2">Total: ${client.total.toFixed(2)}</span>
              <span className="ml-2">Facturas: {client.count}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default ClientStatistics

