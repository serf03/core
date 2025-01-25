import React from "react"
import { Button } from "@/components/ui/button"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

const ExportReport = ({ invoices }) => {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(invoices)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices")
    XLSX.writeFile(workbook, "invoices_report.xlsx")
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text("Reporte de Facturas", 14, 15)
    doc.autoTable({
      head: [
        ["Número de Factura", "Cliente", "Fecha", "Total", "Saldo Pendiente", "Estado", "Método de Pago", "Descuento"],
      ],
      body: invoices.map((invoice) => [
        invoice.invoiceNumber,
        invoice.clientId,
        invoice.date,
        invoice.total,
        invoice.pendingBalance,
        invoice.status,
        invoice.paymentType,
        invoice.discount || 0,
      ]),
    })
    doc.save("invoices_report.pdf")
  }

  const exportToCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," + invoices.map((invoice) => Object.values(invoice).join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "invoices_report.csv")
    document.body.appendChild(link)
    link.click()
  }

  return (
    <div className="flex space-x-4 mb-4 mt-4">
      <Button onClick={exportToExcel}>Exportar a Excel</Button>
      <Button onClick={exportToPDF}>Exportar a PDF</Button>
      <Button onClick={exportToCSV}>Exportar a CSV</Button>
    </div>
  )
}

export default ExportReport

