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
      const fetchData = async () => {
        try {


          const invoicesQuery = props.invoices;
          console.log(invoicesQuery)

          setInvoices(invoicesQuery);
    

          const clientsQuery = props.clients;

          console.log(clientsQuery)
          setClients(clientsQuery);

        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
    
      fetchData();
    }, [props.invoices, props.clients]);
    

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard de Facturas</h1>
      <GlobalMetrics invoices={invoices} clients={clients} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <DailyIncomeChart invoices={invoices} />
        <CashClosing />
      </div>
      <ClientStatistics invoices={invoices} clients={clients} />
      <ExportReport invoices={invoices} />
      <TabsReport invoices={invoices} />
    </div>
  )
}

export default DashboardReport
