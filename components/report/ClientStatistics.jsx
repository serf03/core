import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ClientStatistics = ({ invoices, client }) => {
  const processClientInvoices = (invoices, clients) => {
    const clientMap = new Map(clients.map((c) => [c.id, c.name]))

    const clientInvoices = invoices.reduce((acc, invoice) => {
      const { clientId, total } = invoice
      const current = acc.get(clientId) || { total: 0, count: 0 }
      acc.set(clientId, {
        total: current.total + total,
        count: current.count + 1,
      })
      return acc
    }, new Map())

    return Array.from(clientInvoices, ([clientId, stats]) => ({
      clientId,
      name: clientMap.get(clientId) || "Cliente Desconocido",
      ...stats,
    }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }

  const topClients = processClientInvoices(invoices, client)

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gray-50">
        <CardTitle className="text-xl font-bold text-gray-800">Top 5 Clientes por Volumen de Facturación</CardTitle>
      </CardHeader>
      <CardContent>
        {topClients.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {topClients.map((client, index) => (
              <li key={client.clientId} className="py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{client.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${client.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    {client.count} factura{client.count !== 1 ? "s" : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No hay datos de facturación disponibles.</p>
        )}
      </CardContent>
    </Card>
  )
}

export default ClientStatistics

