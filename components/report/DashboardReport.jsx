import React, { useState, useEffect } from "react"
import TabsReport from "./TabsReport"
import GlobalMetrics from "./GlobalMetrics"
import DailyIncomeChart from "./DailyIncomeChart"
import CashClosing from "./CashClosing"
import ExportReport from "./ExportReport"
import ClientStatistics from "./ClientStatistics"

const DashboardReport = (props) => {
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])

    useEffect(() => {

      setInvoices(props.invoices);
      setClients(props.client);
    
    }, [clients, props.client, props.invoices]);
    

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard de Facturas</h1>
      <GlobalMetrics invoices={invoices} clients={clients} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <DailyIncomeChart invoices={invoices} />
        <CashClosing />
      </div>
      <ClientStatistics invoices={invoices} client={props.client} />
      <ExportReport invoices={invoices} />
      <TabsReport invoices={invoices} />
    </div>
  )
}

export default DashboardReport
