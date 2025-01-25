import React, { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const DailyIncomeChart = ({ invoices }) => {
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])

  const filteredInvoices = invoices.filter((invoice) => {
    const invoiceDate = invoice.date
    return invoiceDate >= startDate && invoiceDate <= endDate
  })

  const dailyIncome = filteredInvoices.reduce((acc, invoice) => {
    const date = invoice.date
    if (!acc[date]) {
      acc[date] = { total: 0, pending: 0 }
    }
    acc[date].total += invoice.total
    acc[date].pending += invoice.pendingBalance
    return acc
  }, {})

  const data = Object.keys(dailyIncome).map((date) => ({
    date,
    total: dailyIncome[date].total,
    pending: dailyIncome[date].pending,
  }))

  return (
    <div className="h-[500px] w-full">
      <h3 className="text-xl font-bold mb-4">Ingresos Diarios</h3>
      <div className="flex gap-4 mb-4">
        <div>
          <Label htmlFor="start-date">Fecha inicial</Label>
          <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="end-date">Fecha final</Label>
          <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" name="Ingresos Totales" fill="#8884d8" />
          <Bar dataKey="pending" name="Ingresos Pendientes" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DailyIncomeChart

